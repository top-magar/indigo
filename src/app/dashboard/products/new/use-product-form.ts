import { useState, useCallback, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProductWithDetails } from "../actions";
import type {
    ProductImage,
    ProductVariant,
    ProductFormData,
    ProductFormErrors,
    SectionState,
} from "./types";
import {
    AUTOSAVE_KEY,
    AUTOSAVE_INTERVAL,
    generateSlug,
    generateId,
    initialFormData,
} from "./types";

type FormData = ProductFormData;
type FormErrors = ProductFormErrors;

export function useProductForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [tagInput, setTagInput] = useState("");
    const [isDirty, setIsDirty] = useState(false);
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [sections, setSections] = useState<SectionState>({
        basic: true,
        media: true,
        pricing: true,
        shipping: false,
        variants: false,
        seo: false,
    });

    const toggleSection = (section: keyof SectionState) => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Load autosaved draft on mount
    useEffect(() => {
        const saved = localStorage.getItem(AUTOSAVE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.publishDate) {
                    parsed.publishDate = new Date(parsed.publishDate);
                }
                setFormData(parsed);
                setLastSaved(new Date());
                toast.info("Draft restored from autosave");
            } catch {
                localStorage.removeItem(AUTOSAVE_KEY);
            }
        }
    }, []);

    // Autosave effect
    useEffect(() => {
        if (!isDirty) return;
        const timer = setTimeout(() => {
            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
            setLastSaved(new Date());
        }, AUTOSAVE_INTERVAL);
        return () => clearTimeout(timer);
    }, [formData, isDirty]);

    // Warn before leaving
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            if (field === "name" && typeof value === "string") {
                newData.slug = generateSlug(value);
            }
            return newData;
        });
        setIsDirty(true);
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [errors]);

    const addTag = useCallback(() => {
        const tag = tagInput.trim();
        if (tag && !formData.tags.includes(tag) && formData.tags.length < 20) {
            updateField("tags", [...formData.tags, tag]);
            setTagInput("");
        }
    }, [tagInput, formData.tags, updateField]);

    const removeTag = useCallback((tagToRemove: string) => {
        updateField("tags", formData.tags.filter(t => t !== tagToRemove));
    }, [formData.tags, updateField]);

    const toggleCollection = useCallback((collectionId: string) => {
        const newIds = formData.collectionIds.includes(collectionId)
            ? formData.collectionIds.filter(id => id !== collectionId)
            : [...formData.collectionIds, collectionId];
        updateField("collectionIds", newIds);
    }, [formData.collectionIds, updateField]);

    const addVariant = useCallback(() => {
        if (formData.variants.length >= 100) {
            toast.error("Maximum 100 variants allowed");
            return;
        }
        updateField("variants", [
            ...formData.variants,
            { id: generateId(), name: "", sku: "", price: "", compareAtPrice: "", quantity: "0", weight: "" }
        ]);
    }, [formData.variants, updateField]);

    const removeVariant = useCallback((id: string) => {
        if (formData.variants.length > 1) {
            updateField("variants", formData.variants.filter(v => v.id !== id));
        }
    }, [formData.variants, updateField]);

    const updateVariant = useCallback((id: string, field: keyof ProductVariant, value: string) => {
        updateField("variants", formData.variants.map(v =>
            v.id === id ? { ...v, [field]: value } : v
        ));
    }, [formData.variants, updateField]);

    const handleImageUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const maxImages = 10 - formData.images.length;
        if (maxImages <= 0) {
            toast.error("Maximum 10 images allowed");
            return;
        }

        const filesToUpload = Array.from(files).slice(0, maxImages);
        setIsUploading(true);

        const placeholders: ProductImage[] = filesToUpload.map((file, index) => ({
            id: generateId(),
            url: URL.createObjectURL(file),
            alt: file.name,
            position: formData.images.length + index,
            isUploading: true,
        }));

        updateField("images", [...formData.images, ...placeholders]);

        try {
            const uploadPromises = filesToUpload.map(async (file, index) => {
                const formDataUpload = new globalThis.FormData();
                formDataUpload.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formDataUpload,
                });

                if (!response.ok) throw new Error("Upload failed");

                const data = await response.json();
                return {
                    id: placeholders[index].id,
                    url: data.url,
                    alt: file.name.replace(/\.[^/.]+$/, ""),
                    position: formData.images.length + index,
                };
            });

            const uploadedImages = await Promise.all(uploadPromises);

            setFormData(prev => ({
                ...prev,
                images: prev.images.map(img => {
                    const uploaded = uploadedImages.find(u => u.id === img.id);
                    return uploaded ? { ...uploaded, isUploading: false } : img;
                }),
            }));

            toast.success(`${uploadedImages.length} image(s) uploaded`);
        } catch {
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter(img => !img.isUploading),
            }));
            toast.error("Failed to upload image(s)");
        } finally {
            setIsUploading(false);
        }
    }, [formData.images, updateField]);

    const removeImage = useCallback((id: string) => {
        updateField("images", formData.images.filter(img => img.id !== id).map((img, index) => ({
            ...img,
            position: index,
        })));
    }, [formData.images, updateField]);

    const handleDragStart = useCallback((index: number) => {
        setDraggedImageIndex(index);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedImageIndex === null || draggedImageIndex === index) return;

        const newImages = [...formData.images];
        const draggedImage = newImages[draggedImageIndex];
        newImages.splice(draggedImageIndex, 1);
        newImages.splice(index, 0, draggedImage);

        const reorderedImages = newImages.map((img, i) => ({ ...img, position: i }));
        updateField("images", reorderedImages);
        setDraggedImageIndex(index);
    }, [draggedImageIndex, formData.images, updateField]);

    const handleDragEnd = useCallback(() => {
        setDraggedImageIndex(null);
    }, []);

    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        handleImageUpload(files);
    }, [handleImageUpload]);

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Product name is required";
        }

        if (!formData.price || parseFloat(formData.price) < 0) {
            newErrors.price = "Valid price is required";
        }

        if (formData.compareAtPrice && parseFloat(formData.compareAtPrice) <= parseFloat(formData.price)) {
            newErrors.compareAtPrice = "Compare price must be higher than price";
        }

        if (formData.metaTitle && formData.metaTitle.length > 60) {
            newErrors.metaTitle = "Meta title should be under 60 characters";
        }

        if (formData.metaDescription && formData.metaDescription.length > 160) {
            newErrors.metaDescription = "Meta description should be under 160 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(async (asDraft: boolean = false) => {
        if (!validateForm()) {
            toast.error("Please fix the errors before submitting");
            return;
        }

        const status = asDraft ? "draft" : formData.status === "draft" ? "active" : formData.status;

        const submitData = new globalThis.FormData();
        submitData.set("name", formData.name);
        submitData.set("slug", formData.slug || generateSlug(formData.name));
        submitData.set("description", formData.description);
        submitData.set("categoryId", formData.categoryId);
        submitData.set("collectionIds", JSON.stringify(formData.collectionIds));
        submitData.set("brand", formData.brand);
        submitData.set("tags", JSON.stringify(formData.tags));
        submitData.set("price", formData.price);
        submitData.set("compareAtPrice", formData.compareAtPrice);
        submitData.set("costPrice", formData.costPrice);
        submitData.set("sku", formData.sku);
        submitData.set("barcode", formData.barcode);
        submitData.set("quantity", formData.quantity);
        submitData.set("trackQuantity", String(formData.trackQuantity));
        submitData.set("allowBackorder", String(formData.allowBackorder));
        submitData.set("lowStockThreshold", formData.lowStockThreshold);
        submitData.set("weight", formData.weight);
        submitData.set("weightUnit", formData.weightUnit);
        submitData.set("length", formData.length);
        submitData.set("width", formData.width);
        submitData.set("height", formData.height);
        submitData.set("requiresShipping", String(formData.requiresShipping));
        submitData.set("images", JSON.stringify(formData.images.filter(img => !img.isUploading)));
        submitData.set("hasVariants", String(formData.hasVariants));
        submitData.set("variants", JSON.stringify(formData.variants));
        submitData.set("metaTitle", formData.metaTitle);
        submitData.set("metaDescription", formData.metaDescription);
        submitData.set("status", status);

        if (!formData.publishNow && formData.publishDate) {
            const publishAt = new Date(formData.publishDate);
            const [hours, minutes] = formData.publishTime.split(":").map(Number);
            publishAt.setHours(hours, minutes, 0, 0);
            submitData.set("publishAt", publishAt.toISOString());
        }

        startTransition(async () => {
            try {
                const result = await createProductWithDetails(submitData);

                if (result.error) {
                    toast.error(result.error);
                    return;
                }

                localStorage.removeItem(AUTOSAVE_KEY);
                setIsDirty(false);

                toast.success(asDraft ? "Draft saved successfully" : "Product created successfully");
                router.push("/dashboard/products");
            } catch {
                toast.error("Failed to create product");
            }
        });
    }, [formData, validateForm, router]);

    const handleNavigation = useCallback((href: string) => {
        if (isDirty) {
            setPendingNavigation(href);
            setShowUnsavedDialog(true);
        } else {
            router.push(href);
        }
    }, [isDirty, router]);

    const clearDraft = useCallback(() => {
        localStorage.removeItem(AUTOSAVE_KEY);
        setFormData(initialFormData);
        setIsDirty(false);
        setLastSaved(null);
        toast.success("Draft cleared");
    }, []);

    const profitMargin = formData.price && formData.costPrice
        ? (((parseFloat(formData.price) - parseFloat(formData.costPrice)) / parseFloat(formData.price)) * 100).toFixed(1)
        : null;

    const seoPreviewUrl = `yourstore.com/products/${formData.slug || "product-name"}`;

    const completionItems = [
        !!formData.name,
        !!formData.price,
        formData.images.length > 0,
        !!formData.description,
        !!formData.categoryId,
    ];
    const completionPercentage = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

    return {
        // State
        formData, errors, tagInput, isDirty, showUnsavedDialog, pendingNavigation,
        lastSaved, isUploading, draggedImageIndex, fileInputRef, sections,
        isPending, profitMargin, seoPreviewUrl, completionPercentage,
        // Setters
        setFormData, setTagInput, setShowUnsavedDialog, setPendingNavigation,
        // Actions
        updateField, toggleSection, addTag, removeTag, toggleCollection,
        addVariant, removeVariant, updateVariant,
        handleImageUpload, removeImage, handleDragStart, handleDragOver, handleDragEnd, handleFileDrop,
        handleSubmit, handleNavigation, clearDraft,
        router,
    };
}

import { useState, useCallback, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProductWithDetails } from "../actions";
import type {
    ProductImage,
    ProductVariant,
    ProductOption,
    ProductFormData,
    ProductFormErrors,
    WizardStep,
} from "./types";
import {
    AUTOSAVE_KEY,
    AUTOSAVE_INTERVAL,
    generateSlug,
    generateId,
    generateVariantsFromOptions,
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
    const [currentStep, setCurrentStep] = useState<WizardStep>(0);

    // Load autosaved draft on mount
    useEffect(() => {
        const saved = localStorage.getItem(AUTOSAVE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.publishDate) {
                    parsed.publishDate = new Date(parsed.publishDate);
                }
                // Merge with defaults so old drafts missing new fields still work
                setFormData({ ...initialFormData, ...parsed, options: parsed.options ?? [], variants: parsed.variants ?? initialFormData.variants });
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

    // --- Option management (Medusa pattern) ---
    const addOption = useCallback(() => {
        if (formData.options.length >= 5) {
            toast.error("Maximum 5 options allowed");
            return;
        }
        const newOption: ProductOption = { id: generateId(), title: "", values: [] };
        updateField("options", [...formData.options, newOption]);
    }, [formData.options, updateField]);

    const removeOption = useCallback((optionId: string) => {
        const newOptions = formData.options.filter(o => o.id !== optionId);
        updateField("options", newOptions);
        // Regenerate variants from remaining options
        const newVariants = generateVariantsFromOptions(newOptions);
        updateField("variants", newVariants);
    }, [formData.options, updateField]);

    const updateOptionTitle = useCallback((optionId: string, title: string) => {
        const newOptions = formData.options.map(o =>
            o.id === optionId ? { ...o, title } : o
        );
        updateField("options", newOptions);
    }, [formData.options, updateField]);

    const updateOptionValues = useCallback((optionId: string, values: string[]) => {
        const newOptions = formData.options.map(o =>
            o.id === optionId ? { ...o, values } : o
        );
        updateField("options", newOptions);
        // Regenerate variants when values change
        const newVariants = generateVariantsFromOptions(newOptions);
        updateField("variants", newVariants);
    }, [formData.options, updateField]);

    // --- Tag management ---
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

    // --- Variant management (bulk editor) ---
    const updateVariant = useCallback((id: string, field: keyof ProductVariant, value: string | boolean) => {
        updateField("variants", formData.variants.map(v =>
            v.id === id ? { ...v, [field]: value } : v
        ));
    }, [formData.variants, updateField]);

    const toggleAllVariants = useCallback((enabled: boolean) => {
        updateField("variants", formData.variants.map(v => ({ ...v, enabled })));
    }, [formData.variants, updateField]);

    // --- Image management ---
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

    // --- Per-step validation (Medusa: title is only required field) ---
    const validateStep = useCallback((step: WizardStep): boolean => {
        const newErrors: FormErrors = {};

        if (step === 0) {
            if (!formData.name.trim()) {
                newErrors.name = "Product title is required";
            }
        }

        // Step 1 (Organize): nothing required
        // Step 2 (Variants): validate enabled variants have prices
        if (step === 2) {
            const enabledVariants = formData.variants.filter(v => v.enabled);
            const missingPrices = enabledVariants.some(v => !v.price || parseFloat(v.price) < 0);
            if (missingPrices) {
                newErrors.variants = "All enabled variants must have a valid price";
            }
        }

        setErrors(prev => {
            const cleared = { ...prev };
            const stepFields: Record<WizardStep, string[]> = {
                0: ["name"],
                1: [],
                2: ["variants"],
            };
            for (const field of stepFields[step]) {
                delete cleared[field];
            }
            return { ...cleared, ...newErrors };
        });

        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const validateAllSteps = useCallback((): boolean => {
        const s0 = validateStep(0);
        const s1 = validateStep(1);
        const s2 = validateStep(2);
        return s0 && s1 && s2;
    }, [validateStep]);

    const goToNextStep = useCallback(() => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 2) as WizardStep);
            return true;
        }
        return false;
    }, [currentStep, validateStep]);

    const goToPrevStep = useCallback(() => {
        setCurrentStep(prev => Math.max(prev - 1, 0) as WizardStep);
    }, []);

    const goToStep = useCallback((step: WizardStep) => {
        if (step < currentStep) {
            setCurrentStep(step);
            return;
        }
        let valid = true;
        for (let s = currentStep; s < step; s++) {
            if (!validateStep(s as WizardStep)) {
                valid = false;
                break;
            }
        }
        if (valid) {
            setCurrentStep(step);
        }
    }, [currentStep, validateStep]);

    // --- Submit ---
    const handleSubmit = useCallback(async (asDraft: boolean = false) => {
        if (!asDraft && !validateAllSteps()) {
            toast.error("Please fix the errors before submitting");
            return;
        }

        const status = asDraft ? "draft" : formData.status === "draft" ? "active" : formData.status;

        // Get the first enabled variant's price as the "main" price for backward compat
        const enabledVariants = formData.variants.filter(v => v.enabled);
        const mainPrice = enabledVariants[0]?.price || "0";

        const submitData = new globalThis.FormData();
        submitData.set("name", formData.name);
        submitData.set("subtitle", formData.subtitle);
        submitData.set("slug", formData.slug || generateSlug(formData.name));
        submitData.set("description", formData.description);
        submitData.set("categoryId", formData.categoryId);
        submitData.set("collectionIds", JSON.stringify(formData.collectionIds));
        submitData.set("brand", formData.brand);
        submitData.set("tags", JSON.stringify(formData.tags));
        // Use first variant price as main product price
        submitData.set("price", mainPrice);
        submitData.set("compareAtPrice", enabledVariants[0]?.compareAtPrice || "");
        submitData.set("costPrice", enabledVariants[0]?.costPrice || "");
        submitData.set("sku", enabledVariants[0]?.sku || "");
        submitData.set("barcode", "");
        submitData.set("quantity", enabledVariants.reduce((sum, v) => sum + (parseInt(v.quantity) || 0), 0).toString());
        submitData.set("trackQuantity", "true");
        submitData.set("allowBackorder", String(enabledVariants.some(v => v.allowBackorder)));
        submitData.set("lowStockThreshold", "");
        submitData.set("weight", formData.weight);
        submitData.set("weightUnit", formData.weightUnit);
        submitData.set("length", "");
        submitData.set("width", "");
        submitData.set("height", "");
        submitData.set("requiresShipping", String(formData.requiresShipping));
        submitData.set("images", JSON.stringify(formData.images.filter(img => !img.isUploading)));
        submitData.set("hasVariants", String(formData.hasVariants));
        submitData.set("variants", JSON.stringify(enabledVariants.map(v => ({
            title: v.title,
            sku: v.sku,
            price: parseFloat(v.price) || 0,
            quantity: parseInt(v.quantity) || 0,
        }))));
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
    }, [formData, validateAllSteps, router]);

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
        setCurrentStep(0);
        toast.success("Draft cleared");
    }, []);

    const seoPreviewUrl = `yourstore.com/products/${formData.slug || "product-name"}`;

    // Completion tracks key fields across all steps
    const completionItems = [
        !!formData.name,
        formData.variants.some(v => v.enabled && !!v.price),
        formData.images.length > 0,
        !!formData.description,
        !!formData.categoryId,
    ];
    const completionPercentage = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

    return {
        formData, errors, tagInput, isDirty, showUnsavedDialog, pendingNavigation,
        lastSaved, isUploading, draggedImageIndex, fileInputRef,
        isPending, seoPreviewUrl, completionPercentage,
        currentStep,
        setFormData, setTagInput, setShowUnsavedDialog, setPendingNavigation,
        updateField, addTag, removeTag, toggleCollection,
        addOption, removeOption, updateOptionTitle, updateOptionValues,
        updateVariant, toggleAllVariants,
        handleImageUpload, removeImage, handleDragStart, handleDragOver, handleDragEnd, handleFileDrop,
        handleSubmit, handleNavigation, clearDraft,
        goToNextStep, goToPrevStep, goToStep, validateStep,
        router,
    };
}

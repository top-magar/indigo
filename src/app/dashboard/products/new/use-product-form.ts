import { useState, useCallback, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useFormDirty } from "@/hooks/use-form-dirty";
import { useSaveShortcut } from "@/hooks/use-save-shortcut";
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

export function useProductForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [errors, setErrors] = useState<ProductFormErrors>({});
    const [tagInput, setTagInput] = useState("");
    const [isPublished, setIsPublished] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Core form state via useFormDirty ---
    const { data: formData, isDirty, setField, setFields, reset, markClean } = useFormDirty({
        initialData: initialFormData as Record<string, unknown> & ProductFormData,
        confirmOnLeave: true,
    });

    // Typed setField wrapper
    const updateField = useCallback(<K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
        if (field === "name" && typeof value === "string") {
            setFields({ [field]: value, slug: generateSlug(value) } as Partial<Record<string, unknown> & ProductFormData>);
        } else {
            setField(field, value as (Record<string, unknown> & ProductFormData)[K]);
        }
        if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }, [setField, setFields, errors]);

    // --- Load autosaved draft ---
    useEffect(() => {
        const saved = localStorage.getItem(AUTOSAVE_KEY);
        if (!saved) return;
        try {
            const parsed = JSON.parse(saved);
            if (parsed.publishDate) parsed.publishDate = new Date(parsed.publishDate);
            setFields({ ...initialFormData, ...parsed, options: parsed.options ?? [], variants: parsed.variants ?? initialFormData.variants } as Partial<Record<string, unknown> & ProductFormData>);
            toast.info("Draft restored from autosave");
        } catch { localStorage.removeItem(AUTOSAVE_KEY); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Autosave ---
    useEffect(() => {
        if (!isDirty) return;
        const timer = setTimeout(() => {
            const saveable = { ...formData, images: (formData.images as ProductImage[]).filter(img => !img.url.startsWith("blob:")) };
            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(saveable));
        }, AUTOSAVE_INTERVAL);
        return () => clearTimeout(timer);
    }, [formData, isDirty]);

    // --- Option management ---
    const addOption = useCallback(() => {
        const opts = formData.options as ProductOption[];
        if (opts.length >= 5) { toast.error("Maximum 5 options"); return; }
        updateField("options", [...opts, { id: generateId(), title: "", values: [] }]);
    }, [formData.options, updateField]);

    const removeOption = useCallback((optionId: string) => {
        const newOpts = (formData.options as ProductOption[]).filter(o => o.id !== optionId);
        setFields({ options: newOpts, variants: generateVariantsFromOptions(newOpts) } as Partial<Record<string, unknown> & ProductFormData>);
    }, [formData.options, setFields]);

    const updateOptionTitle = useCallback((optionId: string, title: string) => {
        updateField("options", (formData.options as ProductOption[]).map(o => o.id === optionId ? { ...o, title } : o));
    }, [formData.options, updateField]);

    const updateOptionValues = useCallback((optionId: string, values: string[]) => {
        const newOpts = (formData.options as ProductOption[]).map(o => o.id === optionId ? { ...o, values } : o);
        setFields({ options: newOpts, variants: generateVariantsFromOptions(newOpts) } as Partial<Record<string, unknown> & ProductFormData>);
    }, [formData.options, setFields]);

    // --- Tags ---
    const addTag = useCallback(() => {
        const tag = tagInput.trim();
        const tags = formData.tags as string[];
        if (tag && !tags.includes(tag) && tags.length < 20) {
            updateField("tags", [...tags, tag]);
            setTagInput("");
        }
    }, [tagInput, formData.tags, updateField]);

    const removeTag = useCallback((t: string) => {
        updateField("tags", (formData.tags as string[]).filter(x => x !== t));
    }, [formData.tags, updateField]);

    const toggleCollection = useCallback((id: string) => {
        const ids = formData.collectionIds as string[];
        updateField("collectionIds", ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
    }, [formData.collectionIds, updateField]);

    // --- Variants ---
    const updateVariant = useCallback((id: string, field: keyof ProductVariant, value: string | boolean) => {
        updateField("variants", (formData.variants as ProductVariant[]).map(v => v.id === id ? { ...v, [field]: value } : v));
    }, [formData.variants, updateField]);

    const toggleAllVariants = useCallback((enabled: boolean) => {
        updateField("variants", (formData.variants as ProductVariant[]).map(v => ({ ...v, enabled })));
    }, [formData.variants, updateField]);

    // --- Images ---
    const handleImageUpload = useCallback(async (files: FileList | null) => {
        if (!files?.length) return;
        const images = formData.images as ProductImage[];
        const maxNew = 10 - images.length;
        if (maxNew <= 0) { toast.error("Maximum 10 images"); return; }

        const batch = Array.from(files).slice(0, maxNew);
        setIsUploading(true);

        const placeholders: ProductImage[] = batch.map((file, i) => ({
            id: generateId(), url: URL.createObjectURL(file), alt: file.name, position: images.length + i, isUploading: true,
        }));
        updateField("images", [...images, ...placeholders]);

        try {
            const uploaded = await Promise.all(batch.map(async (file, i) => {
                const fd = new globalThis.FormData();
                fd.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                if (!res.ok) throw new Error("Upload failed");
                const data = await res.json();
                return { id: placeholders[i].id, url: data.url, alt: file.name.replace(/\.[^/.]+$/, ""), position: images.length + i };
            }));

            // Replace placeholders with uploaded URLs
            const currentImages = formData.images as ProductImage[];
            const newImages = currentImages.map(img => {
                const u = uploaded.find(x => x.id === img.id);
                if (u) { if (img.url.startsWith("blob:")) URL.revokeObjectURL(img.url); return { ...u, isUploading: false } as ProductImage; }
                return img;
            });
            updateField("images", newImages);
            toast.success(`${uploaded.length} image(s) uploaded`);
        } catch {
            const currentImages = formData.images as ProductImage[];
            currentImages.filter(img => img.isUploading && img.url.startsWith("blob:")).forEach(img => URL.revokeObjectURL(img.url));
            updateField("images", currentImages.filter(img => !img.isUploading));
            toast.error("Failed to upload image(s)");
        } finally { setIsUploading(false); }
    }, [formData.images, updateField, setField]);

    const removeImage = useCallback((id: string) => {
        updateField("images", (formData.images as ProductImage[]).filter(img => img.id !== id).map((img, i) => ({ ...img, position: i })));
    }, [formData.images, updateField]);

    const handleDragStart = useCallback((i: number) => setDraggedImageIndex(i), []);
    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedImageIndex === null || draggedImageIndex === index) return;
        const imgs = [...(formData.images as ProductImage[])];
        const dragged = imgs[draggedImageIndex];
        imgs.splice(draggedImageIndex, 1);
        imgs.splice(index, 0, dragged);
        updateField("images", imgs.map((img, i) => ({ ...img, position: i })));
        setDraggedImageIndex(index);
    }, [draggedImageIndex, formData.images, updateField]);
    const handleDragEnd = useCallback(() => setDraggedImageIndex(null), []);
    const handleFileDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); handleImageUpload(e.dataTransfer.files); }, [handleImageUpload]);

    // --- Validation ---
    const validate = useCallback((): boolean => {
        const errs: ProductFormErrors = {};
        if (!(formData.name as string).trim()) errs.name = "Product title is required";
        const enabled = (formData.variants as ProductVariant[]).filter(v => v.enabled);
        if (enabled.some(v => !v.price || parseFloat(v.price) < 0)) errs.variants = "All enabled variants must have a valid price";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [formData]);

    // --- Submit ---
    const handleSubmit = useCallback(async (asDraft: boolean = false) => {
        if (!asDraft && !validate()) { toast.error("Please fix errors before publishing"); return; }

        const status = asDraft ? "draft" : "active";
        const enabledVariants = (formData.variants as ProductVariant[]).filter(v => v.enabled);
        const mainPrice = enabledVariants[0]?.price || "0";

        const fd = new globalThis.FormData();
        fd.set("name", formData.name as string);
        fd.set("subtitle", formData.subtitle as string);
        fd.set("slug", (formData.slug as string) || generateSlug(formData.name as string));
        fd.set("description", formData.description as string);
        fd.set("categoryId", formData.categoryId as string);
        fd.set("collectionIds", JSON.stringify(formData.collectionIds));
        fd.set("brand", formData.brand as string);
        fd.set("tags", JSON.stringify(formData.tags));
        fd.set("price", mainPrice);
        fd.set("compareAtPrice", enabledVariants[0]?.compareAtPrice || "");
        fd.set("costPrice", enabledVariants[0]?.costPrice || "");
        fd.set("sku", enabledVariants[0]?.sku || "");
        fd.set("barcode", "");
        fd.set("quantity", enabledVariants.reduce((s, v) => s + (parseInt(v.quantity) || 0), 0).toString());
        fd.set("trackQuantity", "true");
        fd.set("allowBackorder", String(enabledVariants.some(v => v.allowBackorder)));
        fd.set("weight", formData.weight as string);
        fd.set("weightUnit", formData.weightUnit as string);
        fd.set("length", ""); fd.set("width", ""); fd.set("height", "");
        fd.set("requiresShipping", String(formData.requiresShipping));
        fd.set("images", JSON.stringify((formData.images as ProductImage[]).filter(img => !img.isUploading)));
        fd.set("hasVariants", String(formData.hasVariants));
        fd.set("variants", JSON.stringify(enabledVariants.map(v => ({ title: v.title, sku: v.sku, price: parseFloat(v.price) || 0, quantity: parseInt(v.quantity) || 0 }))));
        fd.set("metaTitle", formData.metaTitle as string);
        fd.set("metaDescription", formData.metaDescription as string);
        fd.set("status", status);

        if (!(formData.publishNow as boolean) && formData.publishDate) {
            const d = new Date(formData.publishDate as Date);
            const [h, m] = (formData.publishTime as string).split(":").map(Number);
            d.setHours(h, m, 0, 0);
            fd.set("publishAt", d.toISOString());
        }

        startTransition(async () => {
            try {
                const result = await createProductWithDetails(fd);
                if (result.error) { toast.error(result.error); return; }
                localStorage.removeItem(AUTOSAVE_KEY);
                markClean();
                if (asDraft) {
                    toast.success("Draft saved");
                    router.push("/dashboard/products");
                } else {
                    setIsPublished(true);
                    setTimeout(() => router.push("/dashboard/products"), 3000);
                }
            } catch { toast.error("Failed to create product"); }
        });
    }, [formData, validate, markClean, router]);

    // --- ⌘S shortcut ---
    useSaveShortcut(useCallback(() => handleSubmit(true), [handleSubmit]));

    const clearDraft = useCallback(() => {
        localStorage.removeItem(AUTOSAVE_KEY);
        reset();
        setErrors({});
        toast.success("Draft cleared");
    }, [reset]);

    // --- Completion ---
    const completionItems = [
        !!(formData.name as string),
        (formData.variants as ProductVariant[]).some(v => v.enabled && !!v.price),
        (formData.images as ProductImage[]).length > 0,
        !!(formData.description as string),
        !!(formData.categoryId as string),
    ];
    const completionPercentage = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

    // --- Wizard steps ---
    const [currentStep, setCurrentStep] = useState<WizardStep>(0);

    const validateStep = useCallback((step: WizardStep): boolean => {
        const errs: ProductFormErrors = {};
        if (step === 0 && !(formData.name as string).trim()) errs.name = "Product title is required";
        if (step === 2) {
            const enabled = (formData.variants as ProductVariant[]).filter(v => v.enabled);
            if (enabled.some(v => !v.price || parseFloat(v.price) < 0)) errs.variants = "All enabled variants must have a valid price";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [formData]);

    const goNext = useCallback(() => {
        if (validateStep(currentStep)) setCurrentStep(s => Math.min(s + 1, 2) as WizardStep);
    }, [currentStep, validateStep]);

    const goBack = useCallback(() => {
        setCurrentStep(s => Math.max(s - 1, 0) as WizardStep);
    }, []);

    const goToStep = useCallback((step: WizardStep) => {
        // Can go back freely, forward only if current step validates
        if (step <= currentStep) { setCurrentStep(step); return; }
        if (validateStep(currentStep)) setCurrentStep(step);
    }, [currentStep, validateStep]);

    return {
        formData: formData as unknown as ProductFormData,
        errors, tagInput, isDirty, isPending, isPublished, completionPercentage,
        currentStep, goNext, goBack, goToStep,
        isUploading, draggedImageIndex, fileInputRef,
        setTagInput, updateField, addTag, removeTag, toggleCollection,
        addOption, removeOption, updateOptionTitle, updateOptionValues,
        updateVariant, toggleAllVariants,
        handleImageUpload, removeImage, handleDragStart, handleDragOver, handleDragEnd, handleFileDrop,
        handleSubmit, clearDraft, validate, router,
    };
}

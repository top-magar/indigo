"use client";

import { useState } from "react";
import {
    AttributeHeader,
    AttributeInfoCard,
    AttributeValuesCard,
    AttributePropertiesCard,
    AddValueDialog,
    EditValueDialog,
} from "../components";
import type { Attribute, AttributeValue } from "../types";

interface AttributeDetailClientProps {
    attribute: Attribute;
}

export function AttributeDetailClient({ attribute }: AttributeDetailClientProps) {
    const [addValueDialogOpen, setAddValueDialogOpen] = useState(false);
    const [editValueDialogOpen, setEditValueDialogOpen] = useState(false);
    const [editingValue, setEditingValue] = useState<AttributeValue | null>(null);

    const handleEditValue = (value: AttributeValue) => {
        setEditingValue(value);
        setEditValueDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <AttributeHeader attribute={attribute} />

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Values Card */}
                    <AttributeValuesCard
                        attribute={attribute}
                        onAddValue={() => setAddValueDialogOpen(true)}
                        onEditValue={handleEditValue}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Info Card */}
                    <AttributeInfoCard attribute={attribute} />

                    {/* Properties Card */}
                    <AttributePropertiesCard attribute={attribute} />
                </div>
            </div>

            {/* Dialogs */}
            <AddValueDialog
                attribute={attribute}
                open={addValueDialogOpen}
                onOpenChange={setAddValueDialogOpen}
            />

            <EditValueDialog
                attribute={attribute}
                value={editingValue}
                open={editValueDialogOpen}
                onOpenChange={setEditValueDialogOpen}
            />
        </div>
    );
}

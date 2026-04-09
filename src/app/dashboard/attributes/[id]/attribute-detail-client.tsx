"use client";

import { useState } from "react";
import {
    AttributeHeader,
    AttributeInfoCard,
    AttributeValuesCard,
    AttributePropertiesCard,
    AddValueDialog,
    EditValueDialog,
} from "@/features/attributes/components";
import { EntityDetailPage } from "@/components/dashboard/templates";
import type { Attribute, AttributeValue } from "@/app/dashboard/attributes/types";

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
        <>
            <EntityDetailPage
                backHref="/dashboard/attributes"
                backLabel="Attributes"
                title={attribute.name}
                subtitle={`Slug: ${attribute.slug}`}
                sidebar={
                    <>
                        <AttributeInfoCard attribute={attribute} />
                        <AttributePropertiesCard attribute={attribute} />
                    </>
                }
            >
                {/* Header with actions/status/delete dialog */}
                <AttributeHeader attribute={attribute} />

                {/* Values Card */}
                <AttributeValuesCard
                    attribute={attribute}
                    onAddValue={() => setAddValueDialogOpen(true)}
                    onEditValue={handleEditValue}
                />
            </EntityDetailPage>

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
        </>
    );
}

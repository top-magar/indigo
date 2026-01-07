import "server-only";
import { 
    attributes, 
    attributeValues, 
    productAttributeValues,
    AttributeInputType,
} from "@/db/schema/attributes";
import { eq, desc, ilike, or } from "drizzle-orm";
import { withTenant } from "@/infrastructure/db";
import { QueryOptions } from "@/infrastructure/repositories/base";

export type AttributeCreateInput = {
    name: string;
    slug: string;
    inputType?: AttributeInputType;
    unit?: string;
    valueRequired?: boolean;
    visibleInStorefront?: boolean;
    filterableInStorefront?: boolean;
    filterableInDashboard?: boolean;
};

export type AttributeUpdateInput = Partial<AttributeCreateInput>;

export type AttributeValueCreateInput = {
    attributeId: string;
    name: string;
    slug: string;
    value?: string;
    richText?: string;
    fileUrl?: string;
    swatchColor?: string;
    swatchImage?: string;
    sortOrder?: number;
};

export interface AttributeStats {
    total: number;
    dropdown: number;
    swatch: number;
    text: number;
    numeric: number;
    boolean: number;
    filterable: number;
}

export class AttributeRepository {
    async findAll(tenantId: string, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            let query = tx
                .select()
                .from(attributes)
                .orderBy(desc(attributes.createdAt));

            if (options?.limit) {
                query = query.limit(options.limit) as typeof query;
            }

            if (options?.offset) {
                query = query.offset(options.offset) as typeof query;
            }

            return query;
        });
    }

    async findById(tenantId: string, id: string) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .select()
                .from(attributes)
                .where(eq(attributes.id, id))
                .limit(1);

            return result || null;
        });
    }

    async findBySlug(tenantId: string, slug: string) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .select()
                .from(attributes)
                .where(eq(attributes.slug, slug))
                .limit(1);

            return result || null;
        });
    }

    async search(tenantId: string, query: string, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            const searchPattern = `%${query}%`;
            let dbQuery = tx
                .select()
                .from(attributes)
                .where(
                    or(
                        ilike(attributes.name, searchPattern),
                        ilike(attributes.slug, searchPattern)
                    )
                )
                .orderBy(desc(attributes.createdAt));

            if (options?.limit) {
                dbQuery = dbQuery.limit(options.limit) as typeof dbQuery;
            }

            if (options?.offset) {
                dbQuery = dbQuery.offset(options.offset) as typeof dbQuery;
            }

            return dbQuery;
        });
    }

    async findFilterable(tenantId: string) {
        return withTenant(tenantId, async (tx) => {
            return tx
                .select()
                .from(attributes)
                .where(eq(attributes.filterableInStorefront, true))
                .orderBy(attributes.name);
        });
    }

    async getStats(tenantId: string): Promise<AttributeStats> {
        return withTenant(tenantId, async (tx) => {
            const allAttributes = await tx.select().from(attributes);

            return {
                total: allAttributes.length,
                dropdown: allAttributes.filter(a => a.inputType === "dropdown").length,
                swatch: allAttributes.filter(a => a.inputType === "swatch").length,
                text: allAttributes.filter(a => a.inputType === "text").length,
                numeric: allAttributes.filter(a => a.inputType === "numeric").length,
                boolean: allAttributes.filter(a => a.inputType === "boolean").length,
                filterable: allAttributes.filter(a => a.filterableInStorefront).length,
            };
        });
    }

    async create(tenantId: string, data: AttributeCreateInput) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .insert(attributes)
                .values({
                    tenantId,
                    name: data.name,
                    slug: data.slug,
                    inputType: data.inputType || "dropdown",
                    unit: data.unit,
                    valueRequired: data.valueRequired ?? false,
                    visibleInStorefront: data.visibleInStorefront ?? true,
                    filterableInStorefront: data.filterableInStorefront ?? false,
                    filterableInDashboard: data.filterableInDashboard ?? true,
                })
                .returning();

            return result;
        });
    }

    async update(tenantId: string, id: string, data: AttributeUpdateInput) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .update(attributes)
                .set({
                    ...data,
                    updatedAt: new Date(),
                })
                .where(eq(attributes.id, id))
                .returning();

            return result || null;
        });
    }

    async delete(tenantId: string, id: string) {
        return withTenant(tenantId, async (tx) => {
            await tx.delete(attributes).where(eq(attributes.id, id));
        });
    }

    async getValues(tenantId: string, attributeId: string) {
        return withTenant(tenantId, async (tx) => {
            return tx
                .select()
                .from(attributeValues)
                .where(eq(attributeValues.attributeId, attributeId))
                .orderBy(attributeValues.sortOrder);
        });
    }

    async addValue(tenantId: string, data: AttributeValueCreateInput) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .insert(attributeValues)
                .values({
                    tenantId,
                    attributeId: data.attributeId,
                    name: data.name,
                    slug: data.slug,
                    value: data.value,
                    richText: data.richText,
                    fileUrl: data.fileUrl,
                    swatchColor: data.swatchColor,
                    swatchImage: data.swatchImage,
                    sortOrder: data.sortOrder ?? 0,
                })
                .returning();

            return result;
        });
    }

    async updateValue(tenantId: string, valueId: string, data: Partial<AttributeValueCreateInput>) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .update(attributeValues)
                .set(data)
                .where(eq(attributeValues.id, valueId))
                .returning();

            return result || null;
        });
    }

    async deleteValue(tenantId: string, valueId: string) {
        return withTenant(tenantId, async (tx) => {
            await tx.delete(attributeValues).where(eq(attributeValues.id, valueId));
        });
    }

    async findWithValues(tenantId: string, id: string) {
        return withTenant(tenantId, async (tx) => {
            const [attribute] = await tx
                .select()
                .from(attributes)
                .where(eq(attributes.id, id))
                .limit(1);

            if (!attribute) return null;

            const values = await tx
                .select()
                .from(attributeValues)
                .where(eq(attributeValues.attributeId, id))
                .orderBy(attributeValues.sortOrder);

            return { ...attribute, values };
        });
    }

    async getProductAttributeValues(tenantId: string, productId: string) {
        return withTenant(tenantId, async (tx) => {
            return tx
                .select()
                .from(productAttributeValues)
                .where(eq(productAttributeValues.productId, productId));
        });
    }

    async setProductAttributeValue(
        tenantId: string,
        productId: string,
        attributeId: string,
        value: {
            attributeValueId?: string;
            textValue?: string;
            numericValue?: string;
            booleanValue?: boolean;
        }
    ) {
        return withTenant(tenantId, async (tx) => {
            await tx
                .delete(productAttributeValues)
                .where(eq(productAttributeValues.productId, productId));

            const [result] = await tx
                .insert(productAttributeValues)
                .values({
                    tenantId,
                    productId,
                    attributeId,
                    attributeValueId: value.attributeValueId,
                    textValue: value.textValue,
                    numericValue: value.numericValue,
                    booleanValue: value.booleanValue,
                })
                .returning();

            return result;
        });
    }
}

export const attributeRepository = new AttributeRepository();

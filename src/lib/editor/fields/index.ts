// Auto-Field System - Main exports

// Types
export type {
  FieldType,
  BaseFieldConfig,
  TextField,
  TextareaField,
  RichtextField,
  NumberField,
  BooleanField,
  SelectField,
  ColorField,
  ImageField,
  UrlField,
  IconField,
  ArrayField,
  ObjectField,
  ProductField,
  CollectionField,
  ProductsField,
  FieldConfig,
  FieldSchema,
  BlockFieldDefinition,
} from "./types"

// Block field schemas
export { BLOCK_FIELD_SCHEMAS, getBlockFieldSchema } from "./block-fields"

// Editable field helpers
export {
  isEditableField,
  isMultilineField,
  getEditableFields,
  getFieldConfig,
  isFieldEditable,
  type EditableFieldInfo,
} from "./editable-fields"

// Components (exported with different names to avoid conflicts)
export { AutoField } from "./components/auto-field"

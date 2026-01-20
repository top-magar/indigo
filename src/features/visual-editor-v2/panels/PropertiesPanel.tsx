'use client';

/**
 * Visual Editor V2 - Properties Panel
 * 
 * Figma-like design panel for editing selected element properties.
 * Organized in collapsible sections for Layout, Size, Position, Spacing,
 * Background, Border, Typography, Effects, and Content.
 */

import * as React from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Move, 
  Square, 
  Type, 
  Palette, 
  Box, 
  Sparkles,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Link2,
  Unlink2,
} from 'lucide-react';
import { cn } from '@/shared/utils';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { useEditorStoreV2 } from '../store/editor-store';
import type { 
  VisualElement, 
  LayoutConfig, 
  PositionConfig, 
  SizeConfig, 
  StyleConfig,
  BackgroundStyle,
  BorderStyle,
  TypographyStyle,
  ShadowStyle,
  SizeValue,
} from '../types/element';

// ============================================================================
// TYPES
// ============================================================================

interface PropertySectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

interface PropertyRowProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

interface NumberInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  unit?: string;
  className?: string;
}

interface ColorPickerProps {
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

function PropertySection({ 
  title, 
  icon, 
  defaultOpen = true, 
  children 
}: PropertySectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--ds-gray-600)] hover:bg-[var(--ds-gray-100)] transition-colors">
        {isOpen ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <span className="flex items-center gap-1.5">
          {icon}
          {title}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 space-y-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function PropertyRow({ label, children, className }: PropertyRowProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-xs text-[var(--ds-gray-500)] w-16 shrink-0">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function NumberInput({ 
  value, 
  onChange, 
  min, 
  max, 
  step = 1, 
  placeholder = "auto",
  unit,
  className 
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || val === 'auto') {
      onChange(undefined);
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        onChange(num);
      }
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        type="text"
        value={value ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        size="sm"
        className="h-7 text-xs pr-6"
      />
      {unit && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--ds-gray-400)]">
          {unit}
        </span>
      )}
    </div>
  );
}

function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [inputValue, setInputValue] = React.useState(value || '');

  React.useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    if (inputValue) {
      onChange(inputValue);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setInputValue(newColor);
    onChange(newColor);
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="relative">
        <input
          type="color"
          value={value?.startsWith('#') ? value : '#000000'}
          onChange={handleColorChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div 
          className="h-7 w-7 rounded-md border border-[var(--ds-gray-300)] shrink-0"
          style={{ backgroundColor: value || 'transparent' }}
        />
      </div>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder="#000000"
        size="sm"
        className="h-7 text-xs flex-1"
      />
    </div>
  );
}

function ToggleButton({ 
  active, 
  onClick, 
  children,
  title,
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "h-7 w-7 flex items-center justify-center rounded-md transition-colors",
        active 
          ? "bg-[var(--ds-gray-200)] text-[var(--ds-gray-900)]" 
          : "text-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-700)]"
      )}
    >
      {children}
    </button>
  );
}

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

interface SectionProps {
  element: VisualElement;
  onUpdate: (updates: Partial<VisualElement>) => void;
}

function LayoutSection({ element, onUpdate }: SectionProps) {
  const layout = element.layout;

  const updateLayout = (updates: Partial<LayoutConfig>) => {
    onUpdate({ layout: { ...layout, ...updates } });
  };

  return (
    <PropertySection title="Layout" icon={<Layers className="h-3 w-3" />}>
      <PropertyRow label="Display">
        <Select 
          value={layout.display} 
          onValueChange={(v) => updateLayout({ display: v as LayoutConfig['display'] })}
          size="sm"
        >
          <SelectTrigger className="h-7 text-xs w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="block">Block</SelectItem>
            <SelectItem value="flex">Flex</SelectItem>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="inline">Inline</SelectItem>
            <SelectItem value="inline-flex">Inline Flex</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </PropertyRow>

      {(layout.display === 'flex' || layout.display === 'inline-flex') && (
        <>
          <PropertyRow label="Direction">
            <Select 
              value={layout.flexDirection || 'row'} 
              onValueChange={(v) => updateLayout({ flexDirection: v as LayoutConfig['flexDirection'] })}
              size="sm"
            >
              <SelectTrigger className="h-7 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="row">Row</SelectItem>
                <SelectItem value="column">Column</SelectItem>
                <SelectItem value="row-reverse">Row Reverse</SelectItem>
                <SelectItem value="column-reverse">Column Reverse</SelectItem>
              </SelectContent>
            </Select>
          </PropertyRow>

          <PropertyRow label="Justify">
            <Select 
              value={layout.justifyContent || 'start'} 
              onValueChange={(v) => updateLayout({ justifyContent: v as LayoutConfig['justifyContent'] })}
              size="sm"
            >
              <SelectTrigger className="h-7 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="end">End</SelectItem>
                <SelectItem value="between">Space Between</SelectItem>
                <SelectItem value="around">Space Around</SelectItem>
                <SelectItem value="evenly">Space Evenly</SelectItem>
              </SelectContent>
            </Select>
          </PropertyRow>

          <PropertyRow label="Align">
            <Select 
              value={layout.alignItems || 'stretch'} 
              onValueChange={(v) => updateLayout({ alignItems: v as LayoutConfig['alignItems'] })}
              size="sm"
            >
              <SelectTrigger className="h-7 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="end">End</SelectItem>
                <SelectItem value="stretch">Stretch</SelectItem>
                <SelectItem value="baseline">Baseline</SelectItem>
              </SelectContent>
            </Select>
          </PropertyRow>

          <PropertyRow label="Gap">
            <NumberInput
              value={layout.gap}
              onChange={(v) => updateLayout({ gap: v })}
              min={0}
              unit="px"
            />
          </PropertyRow>

          <PropertyRow label="Wrap">
            <Select 
              value={layout.flexWrap || 'nowrap'} 
              onValueChange={(v) => updateLayout({ flexWrap: v as LayoutConfig['flexWrap'] })}
              size="sm"
            >
              <SelectTrigger className="h-7 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nowrap">No Wrap</SelectItem>
                <SelectItem value="wrap">Wrap</SelectItem>
                <SelectItem value="wrap-reverse">Wrap Reverse</SelectItem>
              </SelectContent>
            </Select>
          </PropertyRow>
        </>
      )}
    </PropertySection>
  );
}

function SizeSection({ element, onUpdate }: SectionProps) {
  const size = element.size;

  const updateSize = (updates: Partial<SizeConfig>) => {
    onUpdate({ size: { ...size, ...updates } });
  };

  const getSizeMode = (value: SizeValue): 'fill' | 'hug' | 'fixed' => {
    if (value === 'fill') return 'fill';
    if (value === 'hug' || value === 'auto') return 'hug';
    return 'fixed';
  };

  const handleSizeModeChange = (dimension: 'width' | 'height', mode: 'fill' | 'hug' | 'fixed') => {
    if (mode === 'fill') {
      updateSize({ [dimension]: 'fill' });
    } else if (mode === 'hug') {
      updateSize({ [dimension]: 'auto' });
    } else {
      updateSize({ [dimension]: typeof size[dimension] === 'number' ? size[dimension] : 100 });
    }
  };

  return (
    <PropertySection title="Size" icon={<Maximize2 className="h-3 w-3" />}>
      <PropertyRow label="Width">
        <div className="flex gap-1">
          <Select 
            value={getSizeMode(size.width)} 
            onValueChange={(v) => handleSizeModeChange('width', v as 'fill' | 'hug' | 'fixed')}
            size="sm"
          >
            <SelectTrigger className="h-7 text-xs w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fill">Fill</SelectItem>
              <SelectItem value="hug">Hug</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
            </SelectContent>
          </Select>
          {typeof size.width === 'number' && (
            <NumberInput
              value={size.width}
              onChange={(v) => updateSize({ width: v ?? 'auto' })}
              min={0}
              unit="px"
              className="flex-1"
            />
          )}
        </div>
      </PropertyRow>

      <PropertyRow label="Height">
        <div className="flex gap-1">
          <Select 
            value={getSizeMode(size.height)} 
            onValueChange={(v) => handleSizeModeChange('height', v as 'fill' | 'hug' | 'fixed')}
            size="sm"
          >
            <SelectTrigger className="h-7 text-xs w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fill">Fill</SelectItem>
              <SelectItem value="hug">Hug</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
            </SelectContent>
          </Select>
          {typeof size.height === 'number' && (
            <NumberInput
              value={size.height}
              onChange={(v) => updateSize({ height: v ?? 'auto' })}
              min={0}
              unit="px"
              className="flex-1"
            />
          )}
        </div>
      </PropertyRow>

      <PropertyRow label="Min W">
        <NumberInput
          value={size.minWidth}
          onChange={(v) => updateSize({ minWidth: v })}
          min={0}
          unit="px"
        />
      </PropertyRow>

      <PropertyRow label="Max W">
        <NumberInput
          value={size.maxWidth}
          onChange={(v) => updateSize({ maxWidth: v })}
          min={0}
          unit="px"
        />
      </PropertyRow>

      <PropertyRow label="Min H">
        <NumberInput
          value={size.minHeight}
          onChange={(v) => updateSize({ minHeight: v })}
          min={0}
          unit="px"
        />
      </PropertyRow>

      <PropertyRow label="Max H">
        <NumberInput
          value={size.maxHeight}
          onChange={(v) => updateSize({ maxHeight: v })}
          min={0}
          unit="px"
        />
      </PropertyRow>
    </PropertySection>
  );
}

function PositionSection({ element, onUpdate }: SectionProps) {
  const position = element.position;

  const updatePosition = (updates: Partial<PositionConfig>) => {
    onUpdate({ position: { ...position, ...updates } });
  };

  return (
    <PropertySection title="Position" icon={<Move className="h-3 w-3" />} defaultOpen={false}>
      <PropertyRow label="Type">
        <Select 
          value={position.type} 
          onValueChange={(v) => updatePosition({ type: v as PositionConfig['type'] })}
          size="sm"
        >
          <SelectTrigger className="h-7 text-xs w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relative">Relative</SelectItem>
            <SelectItem value="absolute">Absolute</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="sticky">Sticky</SelectItem>
          </SelectContent>
        </Select>
      </PropertyRow>

      {position.type !== 'relative' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <PropertyRow label="Top" className="col-span-1">
              <NumberInput
                value={position.top === 'auto' ? undefined : position.top}
                onChange={(v) => updatePosition({ top: v ?? 'auto' })}
                unit="px"
              />
            </PropertyRow>
            <PropertyRow label="Right" className="col-span-1">
              <NumberInput
                value={position.right === 'auto' ? undefined : position.right}
                onChange={(v) => updatePosition({ right: v ?? 'auto' })}
                unit="px"
              />
            </PropertyRow>
            <PropertyRow label="Bottom" className="col-span-1">
              <NumberInput
                value={position.bottom === 'auto' ? undefined : position.bottom}
                onChange={(v) => updatePosition({ bottom: v ?? 'auto' })}
                unit="px"
              />
            </PropertyRow>
            <PropertyRow label="Left" className="col-span-1">
              <NumberInput
                value={position.left === 'auto' ? undefined : position.left}
                onChange={(v) => updatePosition({ left: v ?? 'auto' })}
                unit="px"
              />
            </PropertyRow>
          </div>
        </>
      )}

      <PropertyRow label="Z-Index">
        <NumberInput
          value={position.zIndex}
          onChange={(v) => updatePosition({ zIndex: v })}
          placeholder="auto"
        />
      </PropertyRow>
    </PropertySection>
  );
}


function SpacingSection({ element, onUpdate }: SectionProps) {
  const styles = element.styles;
  const [linkedPadding, setLinkedPadding] = React.useState(true);
  const [linkedMargin, setLinkedMargin] = React.useState(true);

  const updateStyles = (updates: Partial<StyleConfig>) => {
    onUpdate({ styles: { ...styles, ...updates } });
  };

  const getPaddingValues = (): [number, number, number, number] => {
    if (typeof styles.padding === 'number') {
      return [styles.padding, styles.padding, styles.padding, styles.padding];
    }
    if (Array.isArray(styles.padding)) {
      return styles.padding;
    }
    return [0, 0, 0, 0];
  };

  const getMarginValues = (): [number, number, number, number] => {
    if (typeof styles.margin === 'number') {
      return [styles.margin, styles.margin, styles.margin, styles.margin];
    }
    if (Array.isArray(styles.margin)) {
      return styles.margin;
    }
    return [0, 0, 0, 0];
  };

  const handlePaddingChange = (index: number, value: number | undefined) => {
    const current = getPaddingValues();
    if (linkedPadding) {
      updateStyles({ padding: value ?? 0 });
    } else {
      const newPadding: [number, number, number, number] = [...current];
      newPadding[index] = value ?? 0;
      updateStyles({ padding: newPadding });
    }
  };

  const handleMarginChange = (index: number, value: number | undefined) => {
    const current = getMarginValues();
    if (linkedMargin) {
      updateStyles({ margin: value ?? 0 });
    } else {
      const newMargin: [number, number, number, number] = [...current];
      newMargin[index] = value ?? 0;
      updateStyles({ margin: newMargin });
    }
  };

  const paddingValues = getPaddingValues();
  const marginValues = getMarginValues();

  return (
    <PropertySection title="Spacing" icon={<Box className="h-3 w-3" />} defaultOpen={false}>
      {/* Padding */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--ds-gray-600)] font-medium">Padding</span>
          <button
            type="button"
            onClick={() => setLinkedPadding(!linkedPadding)}
            className="p-1 rounded hover:bg-[var(--ds-gray-100)]"
            title={linkedPadding ? "Unlink sides" : "Link sides"}
          >
            {linkedPadding ? (
              <Link2 className="h-3 w-3 text-[var(--ds-gray-500)]" />
            ) : (
              <Unlink2 className="h-3 w-3 text-[var(--ds-gray-400)]" />
            )}
          </button>
        </div>
        {linkedPadding ? (
          <NumberInput
            value={paddingValues[0]}
            onChange={(v) => handlePaddingChange(0, v)}
            min={0}
            unit="px"
          />
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3 text-[var(--ds-gray-400)]" />
              <NumberInput
                value={paddingValues[0]}
                onChange={(v) => handlePaddingChange(0, v)}
                min={0}
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-1">
              <ArrowRight className="h-3 w-3 text-[var(--ds-gray-400)]" />
              <NumberInput
                value={paddingValues[1]}
                onChange={(v) => handlePaddingChange(1, v)}
                min={0}
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-1">
              <ArrowDown className="h-3 w-3 text-[var(--ds-gray-400)]" />
              <NumberInput
                value={paddingValues[2]}
                onChange={(v) => handlePaddingChange(2, v)}
                min={0}
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-1">
              <ArrowLeft className="h-3 w-3 text-[var(--ds-gray-400)]" />
              <NumberInput
                value={paddingValues[3]}
                onChange={(v) => handlePaddingChange(3, v)}
                min={0}
                placeholder="0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Margin */}
      <div className="space-y-2 pt-2 border-t border-[var(--ds-gray-200)]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--ds-gray-600)] font-medium">Margin</span>
          <button
            type="button"
            onClick={() => setLinkedMargin(!linkedMargin)}
            className="p-1 rounded hover:bg-[var(--ds-gray-100)]"
            title={linkedMargin ? "Unlink sides" : "Link sides"}
          >
            {linkedMargin ? (
              <Link2 className="h-3 w-3 text-[var(--ds-gray-500)]" />
            ) : (
              <Unlink2 className="h-3 w-3 text-[var(--ds-gray-400)]" />
            )}
          </button>
        </div>
        {linkedMargin ? (
          <NumberInput
            value={marginValues[0]}
            onChange={(v) => handleMarginChange(0, v)}
            min={0}
            unit="px"
          />
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3 text-[var(--ds-gray-400)]" />
              <NumberInput
                value={marginValues[0]}
                onChange={(v) => handleMarginChange(0, v)}
                min={0}
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-1">
              <ArrowRight className="h-3 w-3 text-[var(--ds-gray-400)]" />
              <NumberInput
                value={marginValues[1]}
                onChange={(v) => handleMarginChange(1, v)}
                min={0}
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-1">
              <ArrowDown className="h-3 w-3 text-[var(--ds-gray-400)]" />
              <NumberInput
                value={marginValues[2]}
                onChange={(v) => handleMarginChange(2, v)}
                min={0}
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-1">
              <ArrowLeft className="h-3 w-3 text-[var(--ds-gray-400)]" />
              <NumberInput
                value={marginValues[3]}
                onChange={(v) => handleMarginChange(3, v)}
                min={0}
                placeholder="0"
              />
            </div>
          </div>
        )}
      </div>
    </PropertySection>
  );
}

function BackgroundSection({ element, onUpdate }: SectionProps) {
  const styles = element.styles;
  const background = styles.background;

  const updateStyles = (updates: Partial<StyleConfig>) => {
    onUpdate({ styles: { ...styles, ...updates } });
  };

  const updateBackground = (updates: Partial<BackgroundStyle>) => {
    updateStyles({ 
      background: { 
        type: background?.type || 'solid',
        ...background, 
        ...updates 
      } 
    });
  };

  return (
    <PropertySection title="Background" icon={<Palette className="h-3 w-3" />} defaultOpen={false}>
      <PropertyRow label="Type">
        <Select 
          value={background?.type || 'solid'} 
          onValueChange={(v) => updateBackground({ type: v as BackgroundStyle['type'] })}
          size="sm"
        >
          <SelectTrigger className="h-7 text-xs w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="gradient">Gradient</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>
      </PropertyRow>

      {(!background?.type || background.type === 'solid') && (
        <PropertyRow label="Color">
          <ColorPicker
            value={background?.color}
            onChange={(v) => updateBackground({ color: v })}
          />
        </PropertyRow>
      )}

      {background?.type === 'gradient' && (
        <>
          <PropertyRow label="Gradient">
            <Select 
              value={background.gradient?.type || 'linear'} 
              onValueChange={(v) => updateBackground({ 
                gradient: { 
                  ...background.gradient,
                  type: v as 'linear' | 'radial',
                  stops: background.gradient?.stops || [
                    { color: '#000000', position: 0 },
                    { color: '#ffffff', position: 100 }
                  ]
                } 
              })}
              size="sm"
            >
              <SelectTrigger className="h-7 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="radial">Radial</SelectItem>
              </SelectContent>
            </Select>
          </PropertyRow>
          {background.gradient?.type === 'linear' && (
            <PropertyRow label="Angle">
              <NumberInput
                value={background.gradient?.angle ?? 0}
                onChange={(v) => updateBackground({ 
                  gradient: { 
                    ...background.gradient!,
                    angle: v ?? 0 
                  } 
                })}
                min={0}
                max={360}
                unit="°"
              />
            </PropertyRow>
          )}
        </>
      )}

      {background?.type === 'image' && (
        <>
          <PropertyRow label="URL">
            <Input
              type="text"
              value={background.image?.url || ''}
              onChange={(e) => updateBackground({ 
                image: { 
                  ...background.image,
                  url: e.target.value,
                  size: background.image?.size || 'cover',
                  position: background.image?.position || 'center',
                  repeat: background.image?.repeat || 'no-repeat'
                } 
              })}
              placeholder="https://…"
              size="sm"
              className="h-7 text-xs"
            />
          </PropertyRow>
          <PropertyRow label="Size">
            <Select 
              value={background.image?.size || 'cover'} 
              onValueChange={(v) => updateBackground({ 
                image: { 
                  ...background.image!,
                  size: v as 'cover' | 'contain' | 'auto'
                } 
              })}
              size="sm"
            >
              <SelectTrigger className="h-7 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover</SelectItem>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </PropertyRow>
        </>
      )}
    </PropertySection>
  );
}

function BorderSection({ element, onUpdate }: SectionProps) {
  const styles = element.styles;
  const border = styles.border;
  const [linkedRadius, setLinkedRadius] = React.useState(true);

  const updateStyles = (updates: Partial<StyleConfig>) => {
    onUpdate({ styles: { ...styles, ...updates } });
  };

  const updateBorder = (updates: Partial<BorderStyle>) => {
    updateStyles({ 
      border: { 
        width: border?.width ?? 0,
        style: border?.style ?? 'solid',
        color: border?.color ?? '#000000',
        ...border, 
        ...updates 
      } 
    });
  };

  const getRadiusValues = (): [number, number, number, number] => {
    if (typeof styles.borderRadius === 'number') {
      return [styles.borderRadius, styles.borderRadius, styles.borderRadius, styles.borderRadius];
    }
    if (Array.isArray(styles.borderRadius)) {
      return styles.borderRadius;
    }
    return [0, 0, 0, 0];
  };

  const handleRadiusChange = (index: number, value: number | undefined) => {
    const current = getRadiusValues();
    if (linkedRadius) {
      updateStyles({ borderRadius: value ?? 0 });
    } else {
      const newRadius: [number, number, number, number] = [...current];
      newRadius[index] = value ?? 0;
      updateStyles({ borderRadius: newRadius });
    }
  };

  const radiusValues = getRadiusValues();

  return (
    <PropertySection title="Border" icon={<Square className="h-3 w-3" />} defaultOpen={false}>
      <PropertyRow label="Width">
        <NumberInput
          value={border?.width}
          onChange={(v) => updateBorder({ width: v ?? 0 })}
          min={0}
          unit="px"
        />
      </PropertyRow>

      <PropertyRow label="Style">
        <Select 
          value={border?.style || 'solid'} 
          onValueChange={(v) => updateBorder({ style: v as BorderStyle['style'] })}
          size="sm"
        >
          <SelectTrigger className="h-7 text-xs w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </PropertyRow>

      <PropertyRow label="Color">
        <ColorPicker
          value={border?.color}
          onChange={(v) => updateBorder({ color: v })}
        />
      </PropertyRow>

      {/* Border Radius */}
      <div className="space-y-2 pt-2 border-t border-[var(--ds-gray-200)]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--ds-gray-600)] font-medium">Radius</span>
          <button
            type="button"
            onClick={() => setLinkedRadius(!linkedRadius)}
            className="p-1 rounded hover:bg-[var(--ds-gray-100)]"
            title={linkedRadius ? "Unlink corners" : "Link corners"}
          >
            {linkedRadius ? (
              <Link2 className="h-3 w-3 text-[var(--ds-gray-500)]" />
            ) : (
              <Unlink2 className="h-3 w-3 text-[var(--ds-gray-400)]" />
            )}
          </button>
        </div>
        {linkedRadius ? (
          <NumberInput
            value={radiusValues[0]}
            onChange={(v) => handleRadiusChange(0, v)}
            min={0}
            unit="px"
          />
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            <NumberInput
              value={radiusValues[0]}
              onChange={(v) => handleRadiusChange(0, v)}
              min={0}
              placeholder="TL"
            />
            <NumberInput
              value={radiusValues[1]}
              onChange={(v) => handleRadiusChange(1, v)}
              min={0}
              placeholder="TR"
            />
            <NumberInput
              value={radiusValues[3]}
              onChange={(v) => handleRadiusChange(3, v)}
              min={0}
              placeholder="BL"
            />
            <NumberInput
              value={radiusValues[2]}
              onChange={(v) => handleRadiusChange(2, v)}
              min={0}
              placeholder="BR"
            />
          </div>
        )}
      </div>
    </PropertySection>
  );
}


function TypographySection({ element, onUpdate }: SectionProps) {
  const styles = element.styles;
  const typography = styles.typography;

  const updateStyles = (updates: Partial<StyleConfig>) => {
    onUpdate({ styles: { ...styles, ...updates } });
  };

  const updateTypography = (updates: Partial<TypographyStyle>) => {
    updateStyles({ 
      typography: { 
        ...typography, 
        ...updates 
      } 
    });
  };

  // Only show for text-related elements
  if (!['text', 'button', 'link'].includes(element.type)) {
    return null;
  }

  return (
    <PropertySection title="Typography" icon={<Type className="h-3 w-3" />}>
      <PropertyRow label="Font">
        <Select 
          value={typography?.fontFamily || 'var(--font-geist-sans)'} 
          onValueChange={(v) => updateTypography({ fontFamily: v })}
          size="sm"
        >
          <SelectTrigger className="h-7 text-xs w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="var(--font-geist-sans)">Geist Sans</SelectItem>
            <SelectItem value="var(--font-geist-mono)">Geist Mono</SelectItem>
            <SelectItem value="system-ui">System UI</SelectItem>
            <SelectItem value="serif">Serif</SelectItem>
          </SelectContent>
        </Select>
      </PropertyRow>

      <div className="grid grid-cols-2 gap-2">
        <PropertyRow label="Size" className="col-span-1">
          <NumberInput
            value={typography?.fontSize}
            onChange={(v) => updateTypography({ fontSize: v })}
            min={1}
            unit="px"
          />
        </PropertyRow>
        <PropertyRow label="Weight" className="col-span-1">
          <Select 
            value={String(typography?.fontWeight || 400)} 
            onValueChange={(v) => updateTypography({ fontWeight: parseInt(v) })}
            size="sm"
          >
            <SelectTrigger className="h-7 text-xs w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="300">Light</SelectItem>
              <SelectItem value="400">Regular</SelectItem>
              <SelectItem value="500">Medium</SelectItem>
              <SelectItem value="600">Semibold</SelectItem>
              <SelectItem value="700">Bold</SelectItem>
            </SelectContent>
          </Select>
        </PropertyRow>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <PropertyRow label="Line H" className="col-span-1">
          <NumberInput
            value={typography?.lineHeight}
            onChange={(v) => updateTypography({ lineHeight: v })}
            min={0}
            step={0.1}
          />
        </PropertyRow>
        <PropertyRow label="Letter" className="col-span-1">
          <NumberInput
            value={typography?.letterSpacing}
            onChange={(v) => updateTypography({ letterSpacing: v })}
            step={0.1}
            unit="px"
          />
        </PropertyRow>
      </div>

      <PropertyRow label="Align">
        <div className="flex gap-0.5">
          <ToggleButton
            active={typography?.textAlign === 'left' || !typography?.textAlign}
            onClick={() => updateTypography({ textAlign: 'left' })}
            title="Align left"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </ToggleButton>
          <ToggleButton
            active={typography?.textAlign === 'center'}
            onClick={() => updateTypography({ textAlign: 'center' })}
            title="Align center"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </ToggleButton>
          <ToggleButton
            active={typography?.textAlign === 'right'}
            onClick={() => updateTypography({ textAlign: 'right' })}
            title="Align right"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </ToggleButton>
          <ToggleButton
            active={typography?.textAlign === 'justify'}
            onClick={() => updateTypography({ textAlign: 'justify' })}
            title="Justify"
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </ToggleButton>
        </div>
      </PropertyRow>

      <PropertyRow label="Color">
        <ColorPicker
          value={typography?.color}
          onChange={(v) => updateTypography({ color: v })}
        />
      </PropertyRow>
    </PropertySection>
  );
}

function EffectsSection({ element, onUpdate }: SectionProps) {
  const styles = element.styles;

  const updateStyles = (updates: Partial<StyleConfig>) => {
    onUpdate({ styles: { ...styles, ...updates } });
  };

  const shadow = styles.boxShadow?.[0];

  const updateShadow = (updates: Partial<ShadowStyle>) => {
    const currentShadow = shadow || {
      type: 'drop' as const,
      x: 0,
      y: 4,
      blur: 8,
      spread: 0,
      color: 'rgba(0,0,0,0.1)'
    };
    updateStyles({ 
      boxShadow: [{ ...currentShadow, ...updates }] 
    });
  };

  return (
    <PropertySection title="Effects" icon={<Sparkles className="h-3 w-3" />} defaultOpen={false}>
      <PropertyRow label="Opacity">
        <div className="flex items-center gap-2">
          <Slider
            value={[(styles.opacity ?? 1) * 100]}
            onValueChange={([v]) => updateStyles({ opacity: v / 100 })}
            min={0}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-[var(--ds-gray-500)] w-8 text-right tabular-nums">
            {Math.round((styles.opacity ?? 1) * 100)}%
          </span>
        </div>
      </PropertyRow>

      <PropertyRow label="Blur">
        <NumberInput
          value={styles.blur}
          onChange={(v) => updateStyles({ blur: v })}
          min={0}
          unit="px"
        />
      </PropertyRow>

      {/* Shadow */}
      <div className="space-y-2 pt-2 border-t border-[var(--ds-gray-200)]">
        <span className="text-xs text-[var(--ds-gray-600)] font-medium">Shadow</span>
        
        <div className="grid grid-cols-2 gap-1.5">
          <NumberInput
            value={shadow?.x}
            onChange={(v) => updateShadow({ x: v ?? 0 })}
            placeholder="X"
          />
          <NumberInput
            value={shadow?.y}
            onChange={(v) => updateShadow({ y: v ?? 0 })}
            placeholder="Y"
          />
          <NumberInput
            value={shadow?.blur}
            onChange={(v) => updateShadow({ blur: v ?? 0 })}
            placeholder="Blur"
          />
          <NumberInput
            value={shadow?.spread}
            onChange={(v) => updateShadow({ spread: v ?? 0 })}
            placeholder="Spread"
          />
        </div>

        <ColorPicker
          value={shadow?.color}
          onChange={(v) => updateShadow({ color: v })}
        />
      </div>
    </PropertySection>
  );
}

function ContentSection({ element, onUpdate }: SectionProps) {
  const content = element.content;

  const updateContent = (updates: Partial<typeof content>) => {
    if (!content) return;
    onUpdate({ content: { ...content, ...updates } as typeof content });
  };

  if (!content) return null;

  return (
    <PropertySection title="Content" icon={<ImageIcon className="h-3 w-3" />}>
      {content.type === 'text' && (
        <div className="space-y-2">
          <textarea
            value={content.text}
            onChange={(e) => updateContent({ text: e.target.value })}
            placeholder="Enter text…"
            className="w-full h-20 px-2 py-1.5 text-xs rounded-md border border-[var(--ds-gray-300)] bg-[var(--ds-background-100)] resize-none focus:border-[var(--ds-gray-900)] focus:outline-none"
          />
        </div>
      )}

      {content.type === 'image' && (
        <>
          <PropertyRow label="Source">
            <Input
              type="text"
              value={content.src}
              onChange={(e) => updateContent({ src: e.target.value })}
              placeholder="https://…"
              size="sm"
              className="h-7 text-xs"
            />
          </PropertyRow>
          <PropertyRow label="Alt">
            <Input
              type="text"
              value={content.alt}
              onChange={(e) => updateContent({ alt: e.target.value })}
              placeholder="Image description…"
              size="sm"
              className="h-7 text-xs"
            />
          </PropertyRow>
        </>
      )}

      {content.type === 'video' && (
        <>
          <PropertyRow label="Source">
            <Input
              type="text"
              value={content.src}
              onChange={(e) => updateContent({ src: e.target.value })}
              placeholder="https://…"
              size="sm"
              className="h-7 text-xs"
            />
          </PropertyRow>
          <PropertyRow label="Poster">
            <Input
              type="text"
              value={content.poster || ''}
              onChange={(e) => updateContent({ poster: e.target.value })}
              placeholder="Poster image URL…"
              size="sm"
              className="h-7 text-xs"
            />
          </PropertyRow>
        </>
      )}

      {content.type === 'link' && (
        <>
          <PropertyRow label="URL">
            <Input
              type="text"
              value={content.href}
              onChange={(e) => updateContent({ href: e.target.value })}
              placeholder="https://…"
              size="sm"
              className="h-7 text-xs"
            />
          </PropertyRow>
          <PropertyRow label="Target">
            <Select 
              value={content.target || '_self'} 
              onValueChange={(v) => updateContent({ target: v as '_self' | '_blank' })}
              size="sm"
            >
              <SelectTrigger className="h-7 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_self">Same Window</SelectItem>
                <SelectItem value="_blank">New Window</SelectItem>
              </SelectContent>
            </Select>
          </PropertyRow>
        </>
      )}

      {content.type === 'icon' && (
        <>
          <PropertyRow label="Icon">
            <Input
              type="text"
              value={content.name}
              onChange={(e) => updateContent({ name: e.target.value })}
              placeholder="Icon name…"
              size="sm"
              className="h-7 text-xs"
            />
          </PropertyRow>
          <PropertyRow label="Size">
            <NumberInput
              value={content.size}
              onChange={(v) => updateContent({ size: v })}
              min={8}
              unit="px"
            />
          </PropertyRow>
        </>
      )}
    </PropertySection>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function NoSelectionState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-12 h-12 rounded-lg bg-[var(--ds-gray-100)] flex items-center justify-center mb-3">
        <Layers className="h-6 w-6 text-[var(--ds-gray-400)]" />
      </div>
      <p className="text-sm font-medium text-[var(--ds-gray-700)]">No selection</p>
      <p className="text-xs text-[var(--ds-gray-500)] mt-1">
        Select an element to edit its properties
      </p>
    </div>
  );
}

function MultipleSelectionState({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-12 h-12 rounded-lg bg-[var(--ds-gray-100)] flex items-center justify-center mb-3">
        <Layers className="h-6 w-6 text-[var(--ds-gray-400)]" />
      </div>
      <p className="text-sm font-medium text-[var(--ds-gray-700)]">
        {count} elements selected
      </p>
      <p className="text-xs text-[var(--ds-gray-500)] mt-1">
        Select a single element to edit properties
      </p>
    </div>
  );
}

export function PropertiesPanel() {
  const { page, selectedElementIds, updateElement } = useEditorStoreV2();

  // Get selected elements
  const selectedElements = React.useMemo(() => {
    if (!page) return [];
    return selectedElementIds
      .map(id => page.elements[id])
      .filter(Boolean);
  }, [page, selectedElementIds]);

  // Handle element update
  const handleUpdate = React.useCallback((updates: Partial<VisualElement>) => {
    if (selectedElements.length === 1) {
      updateElement(selectedElements[0].id, updates);
    }
  }, [selectedElements, updateElement]);

  // No selection
  if (selectedElements.length === 0) {
    return (
      <div className="h-full bg-[var(--ds-background-100)] border-l border-[var(--ds-gray-200)]">
        <NoSelectionState />
      </div>
    );
  }

  // Multiple selection
  if (selectedElements.length > 1) {
    return (
      <div className="h-full bg-[var(--ds-background-100)] border-l border-[var(--ds-gray-200)]">
        <MultipleSelectionState count={selectedElements.length} />
      </div>
    );
  }

  // Single selection
  const element = selectedElements[0];

  return (
    <div className="h-full bg-[var(--ds-background-100)] border-l border-[var(--ds-gray-200)] flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[var(--ds-gray-200)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[var(--ds-gray-200)] flex items-center justify-center">
            <Square className="h-3 w-3 text-[var(--ds-gray-600)]" />
          </div>
          <div className="flex-1 min-w-0">
            <Input
              type="text"
              value={element.name}
              onChange={(e) => handleUpdate({ name: e.target.value })}
              className="h-6 px-1.5 text-xs font-medium border-transparent hover:border-[var(--ds-gray-300)] focus:border-[var(--ds-gray-900)]"
            />
          </div>
        </div>
        <div className="mt-1 text-[10px] text-[var(--ds-gray-500)] uppercase tracking-wide">
          {element.type}
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-[var(--ds-gray-200)]">
          <LayoutSection element={element} onUpdate={handleUpdate} />
          <SizeSection element={element} onUpdate={handleUpdate} />
          <PositionSection element={element} onUpdate={handleUpdate} />
          <SpacingSection element={element} onUpdate={handleUpdate} />
          <BackgroundSection element={element} onUpdate={handleUpdate} />
          <BorderSection element={element} onUpdate={handleUpdate} />
          <TypographySection element={element} onUpdate={handleUpdate} />
          <EffectsSection element={element} onUpdate={handleUpdate} />
          <ContentSection element={element} onUpdate={handleUpdate} />
        </div>
      </div>
    </div>
  );
}

export default PropertiesPanel;

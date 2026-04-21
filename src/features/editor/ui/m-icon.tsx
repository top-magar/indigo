import {
  Plus, ImagePlus, MousePointerClick, AlignHorizontalJustifyCenter, AlignHorizontalJustifyStart,
  AlignHorizontalJustifyEnd, AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  ArrowLeft, ArrowDown, ArrowRight, ArrowUp, Bookmark, ChevronLeft, ChevronRight, X, Code,
  Pipette, Copy, Trash2, FileText, GripVertical, Maximize, Shrink, AlignCenter, AlignJustify,
  AlignLeft, AlignRight, Italic, ALargeSmall, Strikethrough, Underline, History, AlignHorizontalSpaceAround,
  Minus, Image, Spline, Link, Lock, LockOpen, ExternalLink, Globe, Redo2, Undo2, Save, Search,
  SearchX, Settings, ArrowLeftRight, Type, Heading, PointerOff, Eye, EyeOff, RulerIcon, WrapText,
  ZoomIn, ZoomOut, Palette, Layers, LayoutGrid, PanelLeft, PanelRight, SquareDashed, CircleDot,
  SunMedium, Blend, Droplets, Paintbrush, BoxSelect, Move, RotateCcw, Columns2,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  add: Plus, add_photo_alternate: ImagePlus, ads_click: MousePointerClick,
  align_horizontal_center: AlignHorizontalJustifyCenter, align_horizontal_left: AlignHorizontalJustifyStart,
  align_horizontal_right: AlignHorizontalJustifyEnd, align_vertical_bottom: AlignEndVertical,
  align_vertical_center: AlignCenterVertical, align_vertical_top: AlignStartVertical,
  arrow_back: ArrowLeft, arrow_downward: ArrowDown, arrow_forward: ArrowRight, arrow_upward: ArrowUp,
  bookmark: Bookmark, chevron_left: ChevronLeft, chevron_right: ChevronRight, close: X, code: Code,
  colorize: Pipette, content_copy: Copy, delete: Trash2, description: FileText, drag_indicator: GripVertical,
  expand: Maximize, fit_screen: Shrink,
  format_align_center: AlignCenter, format_align_justify: AlignJustify, format_align_left: AlignLeft, format_align_right: AlignRight,
  format_italic: Italic, format_size: ALargeSmall, format_strikethrough: Strikethrough, format_underlined: Underline,
  history: History, horizontal_distribute: AlignHorizontalSpaceAround, horizontal_rule: Minus,
  image: Image, line_style: Spline, link: Link, lock: Lock, lock_open: LockOpen,
  open_in_new: ExternalLink, public: Globe, redo: Redo2, remove: Minus, save: Save,
  search: Search, search_off: SearchX, settings: Settings, swap_horiz: ArrowLeftRight,
  text_fields: Type, title: Heading, touch_app: PointerOff, undo: Undo2,
  viewport: SquareDashed, visibility: Eye, visibility_off: EyeOff, width: RulerIcon, wrap_text: WrapText,
  zoom_in: ZoomIn, zoom_out: ZoomOut,
  // Panel/design icons
  palette: Palette, layers: Layers, grid_view: LayoutGrid,
  panel_left: PanelLeft, panel_right: PanelRight,
  circle: CircleDot, brightness_6: SunMedium, blur_on: Blend, water_drop: Droplets,
  brush: Paintbrush, select_all: BoxSelect, open_with: Move, rotate_left: RotateCcw,
  view_column: Columns2,
  // Fallback handled below
  widgets: LayoutGrid,
};

/** Lucide icon wrapper — drop-in replacement for Material Symbols MIcon */
export function MIcon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  const Icon = iconMap[name];
  if (!Icon) return <span className={className} style={{ fontSize: size, lineHeight: 1, opacity: 0.5 }}>{name.charAt(0).toUpperCase()}</span>;
  return <Icon size={size} className={className} strokeWidth={1.75} />;
}

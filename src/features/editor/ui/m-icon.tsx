import {
  Plus, ImagePlus, MousePointerClick, AlignHorizontalJustifyCenter, AlignHorizontalJustifyStart,
  AlignHorizontalJustifyEnd, AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  ArrowLeft, ArrowDown, ArrowRight, ArrowUp, Bookmark, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  X, Code, Pipette, Copy, Trash2, FileText, GripVertical, Maximize, Minimize2,
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Italic, ALargeSmall, Strikethrough, Underline, Bold,
  History, AlignHorizontalSpaceAround, Minus, Image, Spline, Link, Lock, LockOpen,
  ExternalLink, Globe, Redo2, Undo2, Save, Search, SearchX, Settings, ArrowLeftRight,
  Type, Heading, PointerOff, Eye, EyeOff, Ruler, WrapText, ZoomIn, ZoomOut,
  LayoutGrid, Square, LayoutList, Columns2, Columns3, Rows3, MonitorPlay, PanelBottom,
  CreditCard, Phone, Star, MapPin, Share2, Timer, Mail, GalleryHorizontalEnd, List,
  Quote, Video, Space, Menu, Sparkles, BarChart3, Megaphone, BadgeCheck,
  RectangleVertical, AppWindow, PanelTop, Layers, Component, Atom,
  LayoutTemplate, LayoutPanelTop, LayoutDashboard, Frame, Section, Container,
  Navigation, Group, Box, Palette, SlidersHorizontal, Paintbrush,
  CloudUpload, RemoveFormatting, SquareMousePointer, SlidersVertical, Crop, Radius, Blend, PaintBucket,
  Monitor, Tablet, Smartphone,
  Droplets, CircleDot, Sun, Contrast, FilterX, RotateCw, ZoomOutIcon, ArrowUpDown, Check,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  // Core actions
  add: Plus, close: X, delete: Trash2, save: Save, search: Search, search_off: SearchX,
  settings: Settings, undo: Undo2, redo: Redo2, history: History, content_copy: Copy,
  drag_indicator: GripVertical, expand: Maximize, fit_screen: Minimize2, remove: Minus,
  lock: Lock, lock_open: LockOpen, open_in_new: ExternalLink, bookmark: Bookmark,
  visibility: Eye, visibility_off: EyeOff,

  // Navigation
  chevron_left: ChevronLeft, chevron_right: ChevronRight, expand_more: ChevronDown,
  arrow_back: ArrowLeft, arrow_forward: ArrowRight, arrow_upward: ArrowUp, arrow_downward: ArrowDown,
  menu: Menu,

  // Text formatting
  text_fields: Type, title: Heading, text_format: ALargeSmall,
  format_align_left: AlignLeft, format_align_center: AlignCenter,
  format_align_right: AlignRight, format_align_justify: AlignJustify,
  format_italic: Italic, format_underlined: Underline, format_strikethrough: Strikethrough, format_bold: Bold,
  format_size: ALargeSmall, format_list_bulleted: List, format_quote: Quote,
  wrap_text: WrapText,

  // Alignment
  align_horizontal_left: AlignHorizontalJustifyStart, align_horizontal_center: AlignHorizontalJustifyCenter,
  align_horizontal_right: AlignHorizontalJustifyEnd, align_vertical_top: AlignStartVertical,
  align_vertical_center: AlignCenterVertical, align_vertical_bottom: AlignEndVertical,
  horizontal_distribute: AlignHorizontalSpaceAround, swap_horiz: ArrowLeftRight,

  // Layout element types (typeIcons)
  public: Globe,
  check_box_outline_blank: Square,
  view_agenda: Section,
  view_column: Columns2,
  view_stream: Rows3,
  featured_video: LayoutTemplate,
  web_asset: LayoutPanelTop,
  call_to_action: PanelBottom,
  crop_portrait: RectangleVertical,
  grid_view: LayoutGrid,
  crop_square: Frame,
  dashboard: LayoutDashboard,
  dashboard_customize: Component,

  // Media
  image: Image, add_photo_alternate: ImagePlus, photo_library: GalleryHorizontalEnd,
  videocam: Video, link: Link, code: Code, colorize: Pipette,

  // Element types
  smart_button: Box,
  horizontal_rule: Minus,
  space_bar: Space,
  star: Star,
  location_on: MapPin,
  share: Share2,
  tab: Layers,
  timer: Timer,
  contact_mail: Mail,
  credit_card: CreditCard,
  payments: CreditCard,
  campaign: Megaphone,
  bar_chart: BarChart3,
  verified: BadgeCheck,
  react: Atom,
  auto_awesome: Sparkles,

  // Canvas
  zoom_in: ZoomIn, zoom_out: ZoomOut, width: Ruler, line_style: Spline,
  touch_app: PointerOff, ads_click: MousePointerClick,
  laptop_mac: Monitor, tablet_mac: Tablet, smartphone: Smartphone,

  // Panel icons
  widgets: Component,
  description: FileText,
  palette: Palette,
  layers: Layers,
  border_style: SlidersHorizontal,
  brush: Paintbrush,

  // Design panel sections
  straighten: Ruler, rounded_corner: Radius, format_color_fill: PaintBucket,
  blur_on: Blend, crop: Crop, tune: SlidersVertical,

  // Content panel
  cloud_upload: CloudUpload, expand_less: ChevronUp, format_clear: RemoveFormatting,
  select_all: SquareMousePointer,

  // Effects
  opacity: Droplets, blur_circular: CircleDot, light_mode: Sun, contrast: Contrast,
  filter_b_and_w: FilterX, color_lens: Paintbrush,
  rotate_right: RotateCw, zoom_out_map: ZoomOutIcon, swap_vert: ArrowUpDown, check: Check,
};

/** Lucide icon wrapper — drop-in replacement for Material Symbols MIcon */
export function MIcon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  const Icon = iconMap[name] ?? Square;
  return <Icon size={size} className={className} strokeWidth={1.75} />;
}

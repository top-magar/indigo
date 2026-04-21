import {
  Plus, ImagePlus, MousePointerClick, AlignHorizontalJustifyCenter, AlignHorizontalJustifyStart,
  AlignHorizontalJustifyEnd, AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  ArrowLeft, ArrowDown, ArrowRight, ArrowUp, Bookmark, ChevronLeft, ChevronRight, ChevronDown,
  X, Code, Pipette, Copy, Trash2, FileText, GripVertical, Maximize, Shrink,
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Italic, ALargeSmall, Strikethrough, Underline,
  History, AlignHorizontalSpaceAround, Minus, Image, Spline, Link, Lock, LockOpen,
  ExternalLink, Globe, Redo2, Undo2, Save, Search, SearchX, Settings, ArrowLeftRight,
  Type, Heading, PointerOff, Eye, EyeOff, Ruler, WrapText, ZoomIn, ZoomOut,
  LayoutGrid, Square, LayoutList, Columns2, Rows3, MonitorPlay, PanelBottom,
  CreditCard, Phone, Star, MapPin, Share2, Timer, Mail, ImageIcon, List,
  Quote, Video, Space, Menu, Sparkles, BarChart3, Megaphone, BadgeCheck,
  RectangleVertical, AppWindow, PanelTop, Layers, Component, Atom,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  // Core actions
  add: Plus, close: X, delete: Trash2, save: Save, search: Search, search_off: SearchX,
  settings: Settings, undo: Undo2, redo: Redo2, history: History, content_copy: Copy,
  drag_indicator: GripVertical, expand: Maximize, fit_screen: Shrink, remove: Minus,
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
  format_italic: Italic, format_underlined: Underline, format_strikethrough: Strikethrough,
  format_size: ALargeSmall, format_list_bulleted: List, format_quote: Quote,
  wrap_text: WrapText,

  // Alignment
  align_horizontal_left: AlignHorizontalJustifyStart, align_horizontal_center: AlignHorizontalJustifyCenter,
  align_horizontal_right: AlignHorizontalJustifyEnd, align_vertical_top: AlignStartVertical,
  align_vertical_center: AlignCenterVertical, align_vertical_bottom: AlignEndVertical,
  horizontal_distribute: AlignHorizontalSpaceAround, swap_horiz: ArrowLeftRight,

  // Layout element types
  public: Globe, check_box_outline_blank: Square, view_agenda: LayoutList,
  view_column: Columns2, view_stream: Rows3, featured_video: MonitorPlay,
  web_asset: AppWindow, call_to_action: PanelBottom, crop_portrait: RectangleVertical,
  grid_view: LayoutGrid, crop_square: Square, dashboard: LayoutGrid,
  dashboard_customize: Component,

  // Media
  image: Image, add_photo_alternate: ImagePlus, photo_library: ImageIcon,
  videocam: Video, link: Link, code: Code, colorize: Pipette,

  // Element types
  smart_button: Square, horizontal_rule: Minus, space_bar: Space,
  star: Star, location_on: MapPin, share: Share2, tab: Layers,
  timer: Timer, contact_mail: Mail, credit_card: CreditCard, payments: CreditCard,
  campaign: Megaphone, bar_chart: BarChart3, verified: BadgeCheck,
  react: Atom, auto_awesome: Sparkles,

  // Canvas
  zoom_in: ZoomIn, zoom_out: ZoomOut, width: Ruler, line_style: Spline,
  touch_app: PointerOff, ads_click: MousePointerClick,

  // Fallbacks
  widgets: Component, description: FileText,
};

/** Lucide icon wrapper — drop-in replacement for Material Symbols MIcon */
export function MIcon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  const Icon = iconMap[name];
  if (!Icon) return <Square size={size} className={className} strokeWidth={1.5} />;
  return <Icon size={size} className={className} strokeWidth={1.75} />;
}

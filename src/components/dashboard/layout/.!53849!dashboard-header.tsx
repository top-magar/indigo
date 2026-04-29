"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Plus, ShoppingCart, Package, Users, BarChart3,
  Settings, LayoutDashboard, Layers, FolderTree, Tags, Gift,
  Warehouse, Image as ImageIcon, FileText, Star, Megaphone,
  DollarSign, Percent, Mail, CreditCard, Globe, Truck,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { useKeyboardShortcutsHelp } from "@/hooks";
import { NotificationCenter } from "@/components/dashboard/notifications/notification-center";
import { KeyboardShortcutsModal } from "@/components/dashboard/keyboard-shortcuts/keyboard-shortcuts-modal";
import type { ShortcutCategory } from "@/components/dashboard/keyboard-shortcuts/types";


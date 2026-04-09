#!/usr/bin/env tsx
/**
 * Lucide React Migration Script
 * 
 * Migrates from HugeIcons (@hugeicons/react + @hugeicons/core-free-icons) to Lucide React
 * 
 * Usage:
 *   pnpm tsx scripts/migrate-to-lucide.ts --dry-run    # Preview changes
 *   pnpm tsx scripts/migrate-to-lucide.ts              # Apply changes
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

// Complete icon mapping: HugeIcons → Lucide React
const ICON_MAPPING: Record<string, string> = {
  // A
  'Add01Icon': 'Plus',
  'AiPhone01Icon': 'Smartphone',
  'Alert01Icon': 'AlertTriangle',
  'Alert02Icon': 'AlertCircle',
  'AlertCircleIcon': 'AlertCircle',
  'AnalyticsUpIcon': 'TrendingUp',
  'Archive01Icon': 'Archive',
  'ArrowDown01Icon': 'ArrowDown',
  'ArrowDown02Icon': 'ChevronDown',
  'ArrowLeft01Icon': 'ArrowLeft',
  'ArrowLeftDoubleIcon': 'ChevronsLeft',
  'ArrowRight01Icon': 'ArrowRight',
  'ArrowRightDoubleIcon': 'ChevronsRight',
  'ArrowTurnBackwardIcon': 'Undo',
  'ArrowTurnForwardIcon': 'Redo',
  'ArrowUp01Icon': 'ArrowUp',
  'ArrowUp02Icon': 'ChevronUp',
  'ArrowUpDownIcon': 'ArrowUpDown',
  
  // B
  'Backward01Icon': 'SkipBack',
  'BarCode01Icon': 'Barcode',
  'Bookmark01Icon': 'Bookmark',
  
  // C
  'Calendar03Icon': 'Calendar',
  'Cancel01Icon': 'X',
  'ChartLineData02Icon': 'LineChart',
  'CheckmarkCircle02Icon': 'CheckCircle',
  'CheckmarkSquare02Icon': 'CheckSquare',
  'Clock01Icon': 'Clock',
  'CodeIcon': 'Code',
  'ComputerIcon': 'Monitor',
  'Copy01Icon': 'Copy',
  'CreditCardIcon': 'CreditCard',
  'Crown02Icon': 'Crown',
  'Cursor01Icon': 'MousePointer',
  
  // D
  'Database01Icon': 'Database',
  'Delete01Icon': 'Trash',
  'Delete02Icon': 'Trash2',
  'DeliveryTruck01Icon': 'Truck',
  'Download01Icon': 'Download',
  'DragDropVerticalIcon': 'GripVertical',
  
  // E
  'Edit01Icon': 'Edit',
  'Edit02Icon': 'Pencil',
  
  // F
  'FavouriteIcon': 'Heart',
  'File01Icon': 'File',
  'FilterIcon': 'Filter',
  'FlipHorizontalIcon': 'FlipHorizontal',
  'FlipVerticalIcon': 'FlipVertical',
  'Folder01Icon': 'Folder',
  'FolderIcon': 'Folder',
  'FolderLibraryIcon': 'FolderOpen',
  'FolderOpenIcon': 'FolderOpen',
  'Forward01Icon': 'SkipForward',
  
  // G
  'GridIcon': 'Grid3X3',
  
  // H
  'HardDriveIcon': 'HardDrive',
  'Heading01Icon': 'Heading1',
  'Heading02Icon': 'Heading2',
  'Heading03Icon': 'Heading3',
  'HeadphonesIcon': 'Headphones',
  'HeartCheckIcon': 'HeartHandshake',
  'HelpCircleIcon': 'HelpCircle',
  'Home01Icon': 'Home',
  
  // I
  'Image01Icon': 'Image',
  'Image02Icon': 'Images',
  'InboxIcon': 'Inbox',
  'InformationCircleIcon': 'Info',
  
  // K
  'KeyboardIcon': 'Keyboard',
  
  // L
  'LaptopIcon': 'Laptop',
  'Layers01Icon': 'Layers',
  'LayoutBottomIcon': 'PanelBottom',
  'LayoutTwoColumnIcon': 'Columns2',
  'LeftToRightListBulletIcon': 'List',
  'LeftToRightListNumberIcon': 'ListOrdered',
  'Link01Icon': 'Link',
  'LinkSquare01Icon': 'ExternalLink',
  'LinkSquare02Icon': 'Link2',
  'Loading01Icon': 'Loader',
  'Loading03Icon': 'Loader2',
  'LockIcon': 'Lock',
  'Logout01Icon': 'LogOut',
  
  // M
  'Mail01Icon': 'Mail',
  'Maximize01Icon': 'Maximize',
  'Megaphone01Icon': 'Megaphone',
  'Menu01Icon': 'Menu',
  'MessageMultiple01Icon': 'MessageSquare',
  'Minimize01Icon': 'Minimize',
  'MinusSignIcon': 'Minus',
  'Money01Icon': 'DollarSign',
  'Moon02Icon': 'Moon',
  'MoreHorizontalIcon': 'MoreHorizontal',
  'Move01Icon': 'Move',
  
  // P
  'Package01Icon': 'Package',
  'PackageIcon': 'Package',
  'PauseIcon': 'Pause',
  'PencilEdit01Icon': 'PenLine',
  'PlayIcon': 'Play',
  'PlusSignIcon': 'Plus',
  'PrinterIcon': 'Printer',
  
  // Q
  'QuoteDownIcon': 'Quote',
  'QuoteUpIcon': 'Quote',
  
  // R
  'RefreshIcon': 'RefreshCw',
  'Remove01Icon': 'X',
  'RepeatIcon': 'Repeat',
  'RotateClockwiseIcon': 'RotateCw',
  'RotateLeft01Icon': 'RotateCcw',
  
  // S
  'Search01Icon': 'Search',
  'SearchRemoveIcon': 'SearchX',
  'SecurityCheckIcon': 'ShieldCheck',
  'Settings01Icon': 'Settings',
  'Share01Icon': 'Share',
  'ShieldIcon': 'Shield',
  'ShoppingBag01Icon': 'ShoppingBag',
  'ShoppingCart01Icon': 'ShoppingCart',
  'SmartPhone01Icon': 'Smartphone',
  'SourceCodeIcon': 'Code2',
  'SparklesIcon': 'Sparkles',
  'SquareIcon': 'Square',
  'SquareUnlock02Icon': 'Unlock',
  'StarIcon': 'Star',
  'StopIcon': 'Square',
  'Store01Icon': 'Store',
  'Sun03Icon': 'Sun',
  
  // T
  'Tag01Icon': 'Tag',
  'TextAlignCenterIcon': 'AlignCenter',
  'TextAlignJustifyLeftIcon': 'AlignJustify',
  'TextAlignLeftIcon': 'AlignLeft',
  'TextAlignRightIcon': 'AlignRight',
  'TextBoldIcon': 'Bold',
  'TextItalicIcon': 'Italic',
  'TextStrikethroughIcon': 'Strikethrough',
  'TextUnderlineIcon': 'Underline',
  'Tick01Icon': 'Check',
  'Tick02Icon': 'Check',
  
  // U
  'Unlink01Icon': 'Unlink',
  'Upload01Icon': 'Upload',
  'Upload04Icon': 'UploadCloud',
  'UserAdd01Icon': 'UserPlus',
  'UserIcon': 'User',
  'UserMultipleIcon': 'Users',
  
  // V
  'Video01Icon': 'Video',
  'ViewIcon': 'Eye',
  'ViewOffIcon': 'EyeOff',
  'VolumeHighIcon': 'Volume2',
  'VolumeMute01Icon': 'VolumeX',
  
  // W
  'Wifi01Icon': 'Wifi',
  'WifiDisconnected01Icon': 'WifiOff',
}

interface MigrationResult {
  file: string
  changes: string[]
  error?: string
}

const isDryRun = process.argv.includes('--dry-run')

function findFilesRecursively(dir: string, pattern: RegExp): string[] {
  const results: string[] = []
  
  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.next') {
          walk(fullPath)
        }
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.push(fullPath)
      }
    }
  }
  
  walk(dir)
  return results
}

async function findFilesWithHugeIcons(): Promise<string[]> {
  const files = findFilesRecursively('src', /\.(ts|tsx)$/)
  
  const filesWithHugeIcons: string[] = []
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    if (content.includes('@hugeicons')) {
      filesWithHugeIcons.push(file)
    }
  }
  
  return filesWithHugeIcons
}

function extractHugeIconImports(content: string): string[] {
  const icons: string[] = []
  
  // Match imports from @hugeicons/core-free-icons
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*["']@hugeicons\/core-free-icons["']/g
  let match
  
  while ((match = importRegex.exec(content)) !== null) {
    const importList = match[1]
    const iconNames = importList.split(',').map(s => s.trim()).filter(Boolean)
    icons.push(...iconNames)
  }
  
  return icons
}

function migrateFile(filePath: string): MigrationResult {
  const result: MigrationResult = { file: filePath, changes: [] }
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8')
    const originalContent = content
    
    // Extract icons used in this file
    const hugeIcons = extractHugeIconImports(content)
    const lucideIcons: string[] = []
    
    // Map HugeIcons to Lucide icons
    for (const hugeIcon of hugeIcons) {
      const lucideIcon = ICON_MAPPING[hugeIcon]
      if (lucideIcon) {
        lucideIcons.push(lucideIcon)
        result.changes.push(`${hugeIcon} → ${lucideIcon}`)
      } else {
        result.changes.push(`⚠️ No mapping for: ${hugeIcon}`)
      }
    }
    
    if (lucideIcons.length === 0 && hugeIcons.length === 0) {
      // File might only have HugeiconsIcon import
      if (content.includes('@hugeicons/react')) {
        result.changes.push('Removed @hugeicons/react import (no icons used)')
      }
    }
    
    // Remove HugeiconsIcon wrapper import
    content = content.replace(
      /import\s*\{\s*HugeiconsIcon\s*\}\s*from\s*["']@hugeicons\/react["'];?\n?/g,
      ''
    )
    
    // Remove @hugeicons/core-free-icons imports
    content = content.replace(
      /import\s*\{[^}]+\}\s*from\s*["']@hugeicons\/core-free-icons["'];?\n?/g,
      ''
    )
    
    // Add Lucide imports if we have icons to import
    const uniqueLucideIcons = [...new Set(lucideIcons)].sort()
    if (uniqueLucideIcons.length > 0) {
      const lucideImport = `import { ${uniqueLucideIcons.join(', ')} } from "lucide-react"\n`
      
      // Find the best place to insert (after other imports)
      const lastImportIndex = content.lastIndexOf('import ')
      if (lastImportIndex !== -1) {
        const endOfLastImport = content.indexOf('\n', lastImportIndex)
        content = content.slice(0, endOfLastImport + 1) + lucideImport + content.slice(endOfLastImport + 1)
      } else {
        content = lucideImport + content
      }
    }
    
    // Replace HugeiconsIcon usage with direct Lucide components
    // Pattern: <HugeiconsIcon icon={IconName} className="..." />
    for (const [hugeIcon, lucideIcon] of Object.entries(ICON_MAPPING)) {
      // Replace <HugeiconsIcon icon={IconName} ... />
      const hugeIconPattern = new RegExp(
        `<HugeiconsIcon\\s+icon=\\{${hugeIcon}\\}([^>]*)/>`,
        'g'
      )
      content = content.replace(hugeIconPattern, `<${lucideIcon}$1/>`)
      
      // Also handle cases where icon prop comes after className
      const hugeIconPattern2 = new RegExp(
        `<HugeiconsIcon([^>]*)icon=\\{${hugeIcon}\\}([^>]*)/>`,
        'g'
      )
      content = content.replace(hugeIconPattern2, `<${lucideIcon}$1$2/>`)
    }
    
    // Clean up any remaining HugeiconsIcon references
    content = content.replace(/<HugeiconsIcon\s+icon=\{(\w+)\}/g, (match, iconVar) => {
      // This handles dynamic icon usage - keep the variable but note it
      result.changes.push(`⚠️ Dynamic icon usage found: ${iconVar} - manual review needed`)
      return match
    })
    
    // Update type imports
    content = content.replace(
      /import\s+type\s*\{\s*(\w+)\s*\}\s*from\s*["']@hugeicons\/core-free-icons["'];?\n?/g,
      'import type { LucideIcon } from "lucide-react"\n'
    )
    
    // Replace HugeIcon type with LucideIcon
    content = content.replace(/type\s+HugeIcon\s*=\s*typeof\s+\w+;?/g, '')
    content = content.replace(/HugeIcon/g, 'LucideIcon')
    
    if (content !== originalContent) {
      if (!isDryRun) {
        fs.writeFileSync(filePath, content, 'utf-8')
      }
      result.changes.push(isDryRun ? '(dry run - no changes written)' : 'File updated')
    } else {
      result.changes.push('No changes needed')
    }
    
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error)
  }
  
  return result
}

async function main() {
  console.log('🔍 Lucide React Migration Script')
  console.log(isDryRun ? '📋 DRY RUN MODE - No files will be modified\n' : '🚀 LIVE MODE - Files will be modified\n')
  
  const files = await findFilesWithHugeIcons()
  console.log(`Found ${files.length} files with HugeIcons imports\n`)
  
  const results: MigrationResult[] = []
  
  for (const file of files) {
    const result = migrateFile(file)
    results.push(result)
    
    console.log(`\n📄 ${file}`)
    for (const change of result.changes) {
      console.log(`   ${change}`)
    }
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`)
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Migration Summary')
  console.log('='.repeat(60))
  console.log(`Total files processed: ${results.length}`)
  console.log(`Files with errors: ${results.filter(r => r.error).length}`)
  console.log(`Files needing manual review: ${results.filter(r => r.changes.some(c => c.includes('⚠️'))).length}`)
  
  if (isDryRun) {
    console.log('\n💡 Run without --dry-run to apply changes')
  } else {
    console.log('\n✅ Migration complete!')
    console.log('\n📝 Next steps:')
    console.log('   1. Review files marked with ⚠️ for manual fixes')
    console.log('   2. Run: pnpm lint --fix')
    console.log('   3. Run: pnpm build')
    console.log('   4. Test the application')
    console.log('   5. Remove old dependencies: pnpm remove @hugeicons/react @hugeicons/core-free-icons')
  }
}

main().catch(console.error)

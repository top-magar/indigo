/**
 * Script to update @/lib/repositories imports to direct feature imports
 */
import * as fs from 'fs';
import * as path from 'path';

const importMappings: Record<string, string> = {
  // Repository imports
  '@/lib/repositories/analytics-types': '@/features/analytics/repositories/analytics-types',
  '@/lib/repositories/analytics': '@/features/analytics/repositories/analytics',
  '@/lib/repositories/products': '@/features/products/repositories/products',
  '@/lib/repositories/orders': '@/features/orders/repositories/orders',
  '@/lib/repositories/customers': '@/features/customers/repositories/customers',
  '@/lib/repositories/inventory': '@/features/inventory/repositories/inventory',
  '@/lib/repositories/categories': '@/features/categories/repositories/categories',
  '@/lib/repositories/collections': '@/features/collections/repositories/collections',
  '@/lib/repositories/attributes': '@/features/attributes/repositories/attributes',
  '@/lib/repositories/cart': '@/features/cart/repositories/cart',
  '@/lib/repositories/notification-preferences': '@/features/notifications/repositories/notification-preferences',
  '@/lib/repositories/dashboard-layouts': '@/features/dashboard/repositories/dashboard-layouts',
  '@/lib/repositories/store-config': '@/features/stores/repositories/store-config',
  '@/lib/repositories/base': '@/infrastructure/repositories/base',
  '@/lib/repositories': '@/features/products/repositories', // Will need manual review
  
  // Error imports
  '@/lib/errors': '@/shared/errors',
};

function findFiles(dir: string, pattern: RegExp): string[] {
  const files: string[] = [];
  
  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory() && !entry.name.includes('node_modules') && !entry.name.startsWith('.')) {
        walk(fullPath);
      } else if (entry.isFile() && pattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

function updateImports(filePath: string): { updated: boolean; changes: string[] } {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  const changes: string[] = [];
  
  for (const [oldImport, newImport] of Object.entries(importMappings)) {
    // Match both single and double quotes
    const patterns = [
      new RegExp(`from ['"]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
      new RegExp(`from ['"]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, `from "${newImport}"`);
        changes.push(`${oldImport} -> ${newImport}`);
      }
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return { updated: true, changes };
  }
  
  return { updated: false, changes: [] };
}

// Main
const srcDir = path.join(process.cwd(), 'src');
const files = findFiles(srcDir, /\.(ts|tsx)$/);

let totalUpdated = 0;
const allChanges: { file: string; changes: string[] }[] = [];

for (const file of files) {
  const { updated, changes } = updateImports(file);
  if (updated) {
    totalUpdated++;
    allChanges.push({ file: file.replace(process.cwd() + '/', ''), changes });
  }
}

console.log(`\nUpdated ${totalUpdated} files:\n`);
for (const { file, changes } of allChanges) {
  console.log(`  ${file}`);
  for (const change of changes) {
    console.log(`    - ${change}`);
  }
}

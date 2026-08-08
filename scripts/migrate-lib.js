const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const moves = {
  'src/lib/auth.ts': 'src/infrastructure/auth.ts',
  'src/lib/env.ts': 'src/infrastructure/env.ts',
  'src/lib/logger.ts': 'src/infrastructure/logger.ts',
  'src/lib/plan-limits.ts': 'src/infrastructure/plan-limits.ts',
  'src/lib/mdx.ts': 'src/shared/mdx.ts',
  'src/lib/page-utils.ts': 'src/features/editor/lib/page-utils.ts',
  'src/lib/public-actions.ts': null // delete
};

// 1. Move files
for (const [src, dest] of Object.entries(moves)) {
  const fullSrc = path.join(process.cwd(), src);
  if (!fs.existsSync(fullSrc)) continue;
  if (dest === null) {
    fs.unlinkSync(fullSrc);
    console.log(`Deleted ${src}`);
    continue;
  }
  const fullDest = path.join(process.cwd(), dest);
  fs.mkdirSync(path.dirname(fullDest), { recursive: true });
  fs.renameSync(fullSrc, fullDest);
  console.log(`Moved ${src} -> ${dest}`);
}

// 2. Global replace
// For each moved file, update its import path. We assume the imports are either `@/lib/xyz` or relative `../lib/xyz`.
// We will simply regex replace them in all .ts and .tsx files.
function getAllFiles(dir, exts = ['.ts', '.tsx'], fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file.startsWith('.')) continue;
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      getAllFiles(filepath, exts, fileList);
    } else {
      if (exts.includes(path.extname(filepath))) {
        fileList.push(filepath);
      }
    }
  }
  return fileList;
}

const allFiles = getAllFiles(path.join(process.cwd(), 'src'));
allFiles.push(path.join(process.cwd(), 'scripts', 'test', 'test-commerce.ts'));
allFiles.push(path.join(process.cwd(), 'scripts', 'test', 'test-aws-services.ts'));
// add any others if needed

const importMap = {
  '@/lib/auth': '@/infrastructure/auth',
  '@/lib/env': '@/infrastructure/env',
  '@/lib/logger': '@/infrastructure/logger',
  '@/lib/plan-limits': '@/infrastructure/plan-limits',
  '@/lib/mdx': '@/shared/mdx',
  '@/lib/page-utils': '@/features/editor/lib/page-utils',
  // Also handle double quotes if necessary
};

for (const file of allFiles) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  for (const [oldImport, newImport] of Object.entries(importMap)) {
    // Regex to match exact import path in quotes
    const regex = new RegExp(`(['"])${oldImport}['"]`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `$1${newImport}$1`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated imports in ${file.replace(process.cwd(), '')}`);
  }
}

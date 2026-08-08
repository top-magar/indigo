const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const oldDir = 'src/components/store';
const newDir = 'src/features/store/components';

if (fs.existsSync(oldDir)) {
  fs.mkdirSync('src/features/store', { recursive: true });
  fs.renameSync(oldDir, newDir);
  console.log(`Moved ${oldDir} to ${newDir}`);
}

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
let updatedCount = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Replace direct imports
  const regex = /@\/components\/store/g;
  if (regex.test(content)) {
    content = content.replace(regex, '@/features/store/components');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    updatedCount++;
    console.log(`Updated imports in ${file.replace(process.cwd(), '')}`);
  }
}
console.log(`Updated ${updatedCount} files.`);

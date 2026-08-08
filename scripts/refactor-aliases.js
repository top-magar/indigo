const fs = require('fs');
const path = require('path');

const replacements = [
    { from: /@\/lib\/editor\b/g, to: '@/features/editor' },
    { from: /@\/lib\/services\b/g, to: '@/infrastructure/services' },
    { from: /@\/lib\/currency\b/g, to: '@/shared/currency' },
    { from: /@\/lib\/i18n\b/g, to: '@/shared/i18n' },
    { from: /@\/lib\/offline\b/g, to: '@/shared/offline' },
    { from: /@\/lib\/supabase\b/g, to: '@/infrastructure/supabase' },
    { from: /@\/lib\/tenant\b/g, to: '@/infrastructure/tenant' },
    { from: /@\/lib\/db\b/g, to: '@/infrastructure/db' },
    { from: /@\/lib\/inngest\b/g, to: '@/infrastructure/inngest' },
    { from: /@\/lib\/workflows\b/g, to: '@/infrastructure/workflows' },
    { from: /@\/lib\/feature-flags\b/g, to: '@/infrastructure/feature-flags' },
    { from: /@\/lib\/utils\b/g, to: '@/shared/utils' },
    { from: /@\/lib\/errors\b/g, to: '@/shared/errors' },
    { from: /@\/lib\/constants\b/g, to: '@/shared/constants' },
    { from: /@\/lib\/dto\b/g, to: '@/shared/dto' },
    { from: /@\/lib\/lazy\b/g, to: '@/shared/lazy' },
    { from: /@\/lib\/types\b/g, to: '@/shared/types' },
    { from: /@\/lib\/media\b/g, to: '@/features/media' },
    { from: /@\/lib\/data\b/g, to: '@/features/store/data' },
    { from: /@\/lib\/store\b/g, to: '@/features/store' },
    { from: /@\/lib\/discounts\b/g, to: '@/features/discounts' },
    { from: /@\/lib\/validations\b/g, to: '@/shared/validations' }
];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    for (const r of replacements) {
        content = content.replace(r.from, r.to);
    }
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log(`Updated ${file}`);
    }
});

console.log(`\nUpdated ${changedCount} files.`);

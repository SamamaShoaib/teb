const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'front', 'src', 'pages');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace text-[9px], text-[10px], text-[11px] with text-xxs
  content = content.replace(/text-\[(9|10|11)px\]/g, 'text-xxs');

  // Replace min-h-[400px], h-[400px], h-[300px] with responsive flex classes or remove them where appropriate
  // For ImpactDashboard and SupportFunding
  if (filePath.includes('ImpactDashboard') || filePath.includes('SupportFunding')) {
    content = content.replace(/min-h-\[400px\]/g, 'flex-1 min-h-[300px]');
    content = content.replace(/h-\[400px\]/g, 'flex-1 min-h-[300px]');
    content = content.replace(/h-\[300px\]/g, 'flex-1');
  }

  // LegalAid bg fix (already done via tool, but just in case)
  content = content.replace(/bg-\[#0f172a\]/g, 'bg-slate-900');
  
  // VerificationPortal bg fix (already done)
  content = content.replace(/bg-\[#004a99\]/g, 'bg-primary');
  content = content.replace(/bg-\[#003366\]/g, 'bg-primary/90');

  // TalentHub min-w-[70px]
  content = content.replace(/min-w-\[70px\]/g, 'min-w-16');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(srcDir);
console.log('Cleanup complete!');

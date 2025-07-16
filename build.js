const fs = require('fs');
const path = require('path');
const {marked} = require('marked');

const SRC_DIR = path.join(__dirname, 'markdown');
const OUT_DIR = path.join(__dirname, 'build');

if (!fs.existsSync(SRC_DIR)) {
  throw new Error(`Missing directory: ${SRC_DIR}`);
}

function walk(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

function build() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const mdFiles = walk(SRC_DIR).filter(f => f.endsWith('.md'));
  for (const file of mdFiles) {
    const rel = path.relative(SRC_DIR, file);
    const dest = path.join(OUT_DIR, rel.replace(/\.md$/, '.html'));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const html = marked.parse(fs.readFileSync(file, 'utf8'));
    fs.writeFileSync(dest, html);
  }
}

build();

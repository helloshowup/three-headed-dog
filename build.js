const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { pack } = require('simple-scorm-packager');
const { packageCourse } = require('@openlearning/imscc-packager');

const SRC_DIR = path.join(__dirname, 'markdown');
const OUT_DIR = path.join(__dirname, 'build');
const WRAPPER_SRC = path.join(
  __dirname,
  'node_modules',
  'scorm-api-wrapper',
  'ScormWrapper.js'
);
const WRAPPER_DEST = path.join(OUT_DIR, 'ScormWrapper.js');

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

async function build() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const mdFiles = walk(SRC_DIR).filter(f => f.endsWith('.md'));
  for (const file of mdFiles) {
    const rel = path.relative(SRC_DIR, file);
    const dest = path.join(OUT_DIR, rel.replace(/\.md$/, '.html'));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const html = marked.parse(fs.readFileSync(file, 'utf8'));
    fs.writeFileSync(dest, html);
  }

  if (!fs.existsSync(WRAPPER_SRC)) {
    throw new Error(`Missing SCORM wrapper: ${WRAPPER_SRC}`);
  }
  fs.copyFileSync(WRAPPER_SRC, WRAPPER_DEST);

  const distDir = path.join(__dirname, 'dist');
  fs.mkdirSync(distDir, { recursive: true });

  const outputZip = path.join(distDir, 'course_scorm.zip');
  try {
    await pack({
      version: '1.2',
      organization: 'ShowUp',
      title: 'Course',
      source: OUT_DIR,
      package: outputZip,
    });
  } catch (err) {
    throw err;
  }

  const pages = fs
    .readdirSync(OUT_DIR)
    .filter(f => f.endsWith('.html'))
    .map(f => ({ title: path.parse(f).name, file: f }));

  try {
    await packageCourse({
      organization: 'ShowUp',
      title: 'Course',
      pages,
      output: path.join(distDir, 'course.imscc'),
    });
  } catch (err) {
    throw err;
  }
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});

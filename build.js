const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const pack = require('simple-scorm-packager');
let { packCourse, packageCourse } = require('@openlearning/imscc-packager');
if (!packCourse && packageCourse) {
  packCourse = packageCourse;
}

const COURSE_TITLE = 'Course';
const VERSION = '1.2';

module.exports = { COURSE_TITLE, VERSION };

const SRC_DIR = path.join(__dirname, 'markdown');
const OUT_DIR = path.join(__dirname, 'build');
const WRAPPER_DEST = path.join(OUT_DIR, 'ScormWrapper.js');

const WRAPPER_CANDIDATES = [
  path.join(
    __dirname,
    'node_modules',
    'pipwerks-scorm-api-wrapper',
    'src',
    'JavaScript',
    'scorm_api_wrapper.js'
  ),
  path.join(
    __dirname,
    'node_modules',
    'scorm-api-wrapper',
    'src',
    'JavaScript',
    'SCORM_API_wrapper.js'
  ),
];
const WRAPPER_SRC = WRAPPER_CANDIDATES.find(fs.existsSync);
if (!WRAPPER_SRC) {
  throw new Error(`Missing SCORM wrapper. Checked: ${WRAPPER_CANDIDATES.join(', ')}`);
}

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

  fs.copyFileSync(WRAPPER_SRC, WRAPPER_DEST);
  const srcSize = fs.statSync(WRAPPER_SRC).size;
  const destSize = fs.statSync(WRAPPER_DEST).size;
  if (srcSize !== destSize) {
    throw new Error('SCORM wrapper copy failed: size mismatch');
  }

  const distDir = path.join(__dirname, 'dist');
  fs.mkdirSync(distDir, { recursive: true });

  try {
    await new Promise((resolve, reject) => {
      pack(
        {
          version: VERSION,
          organization: 'ShowUp',
          title: COURSE_TITLE,
          source: OUT_DIR,
          package: { zip: true, outputFolder: distDir, name: 'course_scorm', version: VERSION },
        },
        msg => {
          if (msg instanceof Error) {
            reject(msg);
          } else if (msg === 'Done') {
            resolve();
          }
        }
      );
    });
    const zips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip'));
    if (zips.length) {
      const latest = zips.sort((a, b) => fs.statSync(path.join(distDir, b)).mtimeMs - fs.statSync(path.join(distDir, a)).mtimeMs)[0];
      if (latest !== 'course_scorm.zip') {
        fs.renameSync(path.join(distDir, latest), path.join(distDir, 'course_scorm.zip'));
      }
      const remaining = fs.readdirSync(distDir).filter(f => f.endsWith('.zip') && f !== 'course_scorm.zip');
      for (const f of remaining) {
        fs.unlinkSync(path.join(distDir, f));
      }
    }
  } catch (err) {
    throw err;
  }

  const htmlFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.html'));
  const pages = htmlFiles.map(f => ({
    title: path.parse(f).name,
    type: 'webcontent',
    content: fs.readFileSync(path.join(OUT_DIR, f), 'utf8'),
  }));
  const course = { title: COURSE_TITLE, description: '', modules: [{ title: COURSE_TITLE, pages }] };

  try {
    const [zip] = await packCourse(course);
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    fs.writeFileSync(path.join(distDir, 'course.imscc'), buffer);
  } catch (err) {
    throw err;
  }
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});

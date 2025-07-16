### QUICK README **String-Together Stack (clone → glue → ship)**

| Stage | Repo (clone & `npm i`) | What it does | Why it fits |
| ----- | ----- | ----- | ----- |
| 1\. Markdown → HTML | **markedjs/marked** | Fast, 100 % JS Markdown → HTML converter | One-liner in Node, no build chain needed [GitHub](https://github.com/markedjs/marked?utm_source=chatgpt.com) |
| 2\. Add SCORM runtime | **pipwerks/scorm-api-wrapper** | Drop the `scorm_api_wrapper.js` file next to each HTML page to satisfy LMS API calls | Zero config, industry-standard wrapper [GitHub](https://github.com/pipwerks/scorm-api-wrapper?utm_source=chatgpt.com) |
| 3\. Zip as SCORM | **lmihaidaniel/simple-scorm-packager** | CLI/JS lib that walks a folder, writes `imsmanifest.xml`, and outputs SCORM 1.2/2004 ZIP | No code if you use the CLI; scriptable if you want full automation [npm](https://www.npmjs.com/package/simple-scorm-packager?utm_source=chatgpt.com) |

---

### **Minimal glue script (Node)**

bash  
CopyEdit  
`# one-time setup`  
`npm init -y`  
`npm i marked simple-scorm-packager @openlearning/imscc-packager scorm-api-wrapper`

js  
CopyEdit  
`// build.js  (run: node build.js)`  
`import {readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync} from 'fs';`  
`import marked from 'marked';`  
`import pack from 'simple-scorm-packager';`  
`import {packCourse} from '@openlearning/imscc-packager';`

`// 1. convert .md to .html`  
`mkdirSync('build', {recursive: true});`  
`for (const f of readdirSync('markdown')) {`  
  `if (f.endsWith('.md')) {`  
    ``const html = marked.parse(readFileSync(`markdown/${f}`, 'utf8'));``  
    ``writeFileSync(`build/${f.replace('.md', '.html')}`, html);``  
  `}`  
`}`

`// 2. drop SCORM runtime`  
`copyFileSync('node_modules/scorm-api-wrapper/ScormWrapper.js', 'build/ScormWrapper.js');`

`// 3a. SCORM package`  
`pack({`  
  `version: '1.2',`  
  `title: 'LearnStage Course',`  
  `source: 'build',`  
  `package: {zip: true, outputFolder: 'dist'}`  
`});`

`// 3b. IMSCC package (optional)`  
`await packCourse({`  
  `source: 'build',`  
  `output: 'dist/course.imscc',`  
  `title: 'LearnStage Course'`  
`});`

Result:

* `dist/LearnStage Course_1.2.zip` → upload as SCORM.

* `dist/course.imscc` → upload as Common Cartridge.

---

### **Workflow in plain English**

1. **Write/collect Markdown** in `/markdown`.

2. **Run `node build.js`** – Codex can generate/maintain this script.

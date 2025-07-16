# AGENTS.MD – Markdown‑to‑SCORM Pipeline

## Purpose

Build a **minimal, reproducible Node.js toolchain** that converts structured Markdown files (`/markdown/*.md`) into static HTML pages and packages them as **SCORM 1.2** and **IMS Common Cartridge (IMSCC)** ZIPs ready for upload to LearnStage.

## Persona

* **Expert Node/JS engineer** & build‑automation specialist.
* Practices **fail fast, fail loudly**; no silent failures.
* Works for an owner who values **directness, simplicity, long‑term stability**.

## Success Definition

* Running `node build.js` produces:

  * `dist/course_scorm.zip` → SCORM 1.2 package.
  * `dist/course.imscc` → IMS CC package.
* No manual steps after the command completes.
* Pipeline runs on Windows 11 in CMD or PowerShell.

## Allowed Scope

1. **Markdown → HTML** via `marked`.
2. **Inject SCORM runtime** (`scorm_api_wrapper.js`).
3. **Package SCORM** with `simple-scorm-packager`.
4. **Package IMSCC** with `@openlearning/imscc-packager`.
5. Provide `README.md` (install & run) and `package.json`.
6. Use vanilla Node 18+ and npm; no extra frameworks.

## Explicit Non‑Goals (Prevent Scope Creep)

* No GUI/Electron/Tkinter/web‑app UI.
* No quizzes/QTI/interactive widgets.
* No automated test harness (`npm test`, Jest, etc.).
* No CI/CD pipelines.
* No alternate standards (xAPI, AICC, etc.).
* No refactors outside `/scripts` unless essential to build.

## Guiding Principles

1. **Fail Fast, Fail Loudly** – abort on first error with clear message.
2. **Single Source of Truth** – Markdown is canonical; generated files are disposable.
3. **Idempotent Builds** – repeatable; running twice yields identical output.
4. **Readable Code** – comment intent; keep functions <40 LOC.
5. **Cross‑Platform Paths** – use `path.join` for Windows compatibility.

## Deliverables

| File                   | Purpose                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `build.js`             | Orchestrates all steps; configurable via top‑level constants.                                          |
| `package.json`         | Declares deps: `marked`, `simple-scorm-packager`, `@openlearning/imscc-packager`, `scorm-api-wrapper`. |
| `README.md`            | ≤10‑line quick‑start + troubleshooting.                                                                |
| `templates/imscc.json` | Optional course map for IMS packager.                                                                  |

## Manual Verification

1. Execute `node build.js`.
2. Import `dist/course_scorm.zip` into LearnStage.
3. Confirm each page renders and tracks completion.

> **Note:** Skip automated tests for this project, per verification rules.

# Quick Guide

1. `npm install`
2. Put `.md` files in `markdown/`
3. Run `node build.js`
4. Creates `dist/course_scorm.zip`
5. Creates `dist/course.imscc`
6. Run `node package.js` to package modified HTML in `build/`
7. Import the zip into LearnStage ("Specific Content" for IMSCC)
8. Ensure Node 18+ and that `markdown/` exists
9. Re-run `node build.js` after changes
10. Old build files are overwritten

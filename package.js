const path = require('path');
const { packageBuild } = require('./build');

(async () => {
  const distDir = path.join(__dirname, 'dist');
  try {
    await packageBuild(distDir);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

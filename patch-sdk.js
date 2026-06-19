const fs = require('fs');
const files = [
  'node_modules/@remotion/vercel/dist/esm/index.mjs',
  'node_modules/@remotion/vercel/dist/cjs/index.cjs'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
      'const directories = collectBundleDirectories(bundleFiles);',
      'try { await sandbox.mkDir(REMOTION_SANDBOX_BUNDLE_DIR); } catch (e) {}\n  const directories = collectBundleDirectories(bundleFiles);'
    );
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
  }
}

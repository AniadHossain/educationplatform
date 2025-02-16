import { build } from "esbuild";
import fs from "fs-extra";
import path from "path";

const sourceDir = "platform";
const destDir = "platform-commonjs";

fs.ensureDirSync(destDir);

// Recursively copy all files, transforming only '.js' files
const copyAndTransform = async (src, dest) => {
  const files = fs.readdirSync(src);

  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      fs.ensureDirSync(destPath);
      await copyAndTransform(srcPath, destPath);
    } else if (file.endsWith(".js")) {
      await build({
        entryPoints: [srcPath],
        outfile: destPath, 
        bundle: false,
        format: "cjs",
        platform: "node",
        sourcemap: false,
      });
      console.log(`Converted (CJS): ${srcPath} -> ${destPath}`);
    } else {
      // Copy non-JS files directly
      fs.copySync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
};

copyAndTransform(sourceDir, destDir)
  .then(() => console.log("Build complete!"))
  .catch((err) => console.error("Build failed:", err));
// builds the HTML string that goes into the preview iframe
// handles: plain HTML, vanilla JS, and React via Babel standalone + esm.sh import maps

// extract bare npm imports from code e.g. 'import React from "react"' -> 'react'
function extractPackages(code) {
  const packages = new Set();
  const importRegex =
    /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^./][^'"]*)['"]/g;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const pkg = match[1];
    // skip relative imports and already-handled packages
    if (!pkg.startsWith(".") && !pkg.startsWith("/")) {
      // get root package name (handles scoped like @org/pkg)
      const root = pkg.startsWith("@")
        ? pkg.split("/").slice(0, 2).join("/")
        : pkg.split("/")[0];
      packages.add(root);
    }
  }
  return [...packages];
}

// build import map JSON for esm.sh
function buildImportMap(packages) {
  const imports = {};
  for (const pkg of packages) {
    imports[pkg] = `https://esm.sh/${pkg}`;
    // also map sub-paths e.g. react/jsx-runtime
    imports[`${pkg}/`] = `https://esm.sh/${pkg}/`;
  }
  return JSON.stringify({ imports }, null, 2);
}

export function buildPreviewHTML(files) {
  const indexHtml = files["index.html"] || "";
  if (!indexHtml)
    return '<h2 style="font-family:sans-serif;padding:2rem">No index.html found</h2>';

  // collect all JS/JSX file contents to scan for imports
  const allCode = Object.entries(files)
    .filter(([p]) => p.endsWith(".js") || p.endsWith(".jsx"))
    .map(([, content]) => content)
    .join("\n");

  const packages = extractPackages(allCode);
  const hasJSX =
    allCode.includes("jsx") ||
    allCode.includes("React") ||
    Object.keys(files).some((p) => p.endsWith(".jsx"));
  const importMap = packages.length > 0 ? buildImportMap(packages) : null;

  // inject scripts into the index.html
  let html = indexHtml;

  // inject import map before any scripts
  if (importMap) {
    html = html.replace(
      "</head>",
      `  <script type="importmap">${importMap}</script>\n</head>`,
    );
  }

  // if React project: inject Babel standalone for JSX transform
  if (hasJSX) {
    html = html.replace(
      "</head>",
      `  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\n</head>`,
    );
  }

  // inline all referenced JS/JSX/CSS files
  // replace <script src="..."> and <link href="..."> with inlined content
  for (const [filePath, content] of Object.entries(files)) {
    if (filePath === "index.html") continue;

    if (filePath.endsWith(".css")) {
      // replace <link rel="stylesheet" href="..."> with <style>
      const linkRegex = new RegExp(
        `<link[^>]+href=["']/?${escapeRegex(filePath)}["'][^>]*>`,
        "g",
      );
      html = html.replace(linkRegex, `<style>${content}</style>`);
    } else if (filePath.endsWith(".js")) {
      const scriptRegex = new RegExp(
        `<script[^>]+src=["']/?${escapeRegex(filePath)}["'][^>]*><\\/script>`,
        "g",
      );
      html = html.replace(
        scriptRegex,
        `<script type="module">${content}</script>`,
      );
    } else if (filePath.endsWith(".jsx")) {
      // jsx files need Babel transform type
      const scriptRegex = new RegExp(
        `<script[^>]+src=["']/?${escapeRegex(filePath)}["'][^>]*><\\/script>`,
        "g",
      );
      html = html.replace(
        scriptRegex,
        `<script type="text/babel" data-type="module">${content}</script>`,
      );

      // also handle module src references in other scripts
      // for React apps: main.jsx is usually the entry, resolve its imports inline
      html = html.replace(
        new RegExp(`src=["']/?${escapeRegex(filePath)}["']`, "g"),
        `type="text/babel" data-type="module"`,
      );
    }
  }

  // inline any remaining JSX imports inside script tags
  // replace relative imports with inlined code blocks
  html = inlineRelativeImports(html, files);

  return html;
}

function inlineRelativeImports(html, files) {
  // for each JSX/JS file content that has relative imports, inline those too
  // this is a simplified approach — handles single-level relative imports
  for (const [path, content] of Object.entries(files)) {
    if (!path.endsWith(".jsx") && !path.endsWith(".js")) continue;
    if (path === "index.html") continue;

    const dir = path.includes("/")
      ? path.split("/").slice(0, -1).join("/")
      : "";

    let inlined = content;
    inlined = inlined.replace(
      /import\s+(.*?)\s+from\s+['"](\.[^'"]+)['"]/g,
      (match, what, relPath) => {
        // resolve relative path
        const resolved = dir
          ? `${dir}/${relPath.replace(/^\.\//, "")}`
          : relPath.replace(/^\.\//, "");
        const candidates = [resolved, `${resolved}.js`, `${resolved}.jsx`];
        const found = candidates.find((c) => files[c] !== undefined);
        if (!found) return match; // can't resolve — leave as is
        // wrap the imported module content as inline
        return `// inlined: ${found}\n${files[found]}\n// end: ${found}`;
      },
    );

    if (inlined !== content) {
      // update in html
      html = html.replace(content, inlined);
    }
  }
  return html;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

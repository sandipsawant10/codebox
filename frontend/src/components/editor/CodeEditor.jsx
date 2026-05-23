import { useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { useSandboxStore } from "../../store/sandboxStore";
import EditorTabs from "./EditorTabs";

function getLanguage(path) {
  if (!path) return "plaintext";
  if (path.endsWith(".jsx")) return "javascript";
  if (path.endsWith(".js")) return "javascript";
  if (path.endsWith(".ts") || path.endsWith(".tsx")) return "typescript";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "markdown";
  return "plaintext";
}

export default function CodeEditor() {
  const { activeFile, files, updateFileContent } = useSandboxStore();

  const handleEditorMount = (editor, monaco) => {
    // configure JSX support
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: "React.createElement",
      reactNamespace: "React",
      allowNonTsExtensions: true,
      allowJs: true,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
    });

    // suppress type errors for unknown imports (esm.sh packages)
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });
  };

  const handleChange = (value) => {
    if (activeFile && value !== undefined) {
      updateFileContent(activeFile, value);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-600 text-sm">
        Select a file to start editing
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <EditorTabs />
      <div className="flex-1 min-h-0">
        <MonacoEditor
          path={activeFile}
          height="100%"
          language={getLanguage(activeFile)}
          value={files[activeFile] ?? ""}
          theme="vs-dark"
          onChange={handleChange}
          onMount={handleEditorMount}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            automaticLayout: true,
            lineNumbers: "on",
            renderLineHighlight: "line",
            suggestOnTriggerCharacters: true,
            formatOnPaste: true,
          }}
        />
      </div>
    </div>
  );
}

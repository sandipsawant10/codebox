import { X } from "lucide-react";
import { useSandboxStore } from "../../store/sandboxStore";

function getFileIcon(path) {
  if (path.endsWith(".jsx") || path.endsWith(".tsx")) return "⚛";
  if (path.endsWith(".js")) return "𝐉";
  if (path.endsWith(".css")) return "🎨";
  if (path.endsWith(".html")) return "🌐";
  if (path.endsWith(".json")) return "{}";
  return "📄";
}

export default function EditorTabs() {
  const { openTabs, activeFile, setActiveFile, closeTab } = useSandboxStore();

  if (openTabs.length === 0)
    return (
      <div className="h-9 bg-gray-900 border-b border-gray-700/50 flex items-center px-4">
        <span className="text-gray-600 text-xs">No files open</span>
      </div>
    );

  return (
    <div className="h-9 bg-gray-900 border-b border-gray-700/50 flex items-center overflow-x-auto shrink-0">
      {openTabs.map((path) => {
        const name = path.split("/").pop();
        const isActive = path === activeFile;
        return (
          <div
            key={path}
            className={`flex items-center gap-1.5 px-3 h-full border-r border-gray-700/50 cursor-pointer shrink-0 group text-xs
              ${
                isActive
                  ? "bg-gray-800 text-white border-t-2 border-t-blue-500"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
              }`}
            onClick={() => setActiveFile(path)}
            title={path}
          >
            <span>{getFileIcon(path)}</span>
            <span className="max-w-[120px] truncate">{name}</span>
            <button
              className="ml-1 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-700 text-gray-400 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(path);
              }}
            >
              <X size={10} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

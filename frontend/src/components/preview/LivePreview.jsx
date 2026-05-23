import { useEffect, useRef, useState } from "react";
import { RefreshCw, ExternalLink, AlertTriangle } from "lucide-react";
import { useSandboxStore } from "../../store/sandboxStore";
import { buildPreviewHTML } from "../../utils/previewBuilder";
import { useDebounce } from "../../hooks/useDebounce";

export default function LivePreview() {
  const { files } = useSandboxStore();
  const iframeRef = useRef(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // debounce preview refresh — don't rebuild on every keystroke
  const debouncedFiles = useDebounce(files, 600);

  useEffect(() => {
    refresh(debouncedFiles);
  }, [debouncedFiles]);

  // cleanup blob URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const refresh = (currentFiles) => {
    if (!currentFiles["index.html"]) {
      setError("No index.html found in project");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const html = buildPreviewHTML(currentFiles);
      // blob URL gives the iframe its own opaque origin — safer than srcdoc
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openInNewTab = () => {
    if (blobUrl) window.open(blobUrl, "_blank");
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* preview toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-700/50 bg-gray-900 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 bg-gray-800 rounded px-3 py-0.5 text-xs text-gray-400 truncate">
          {blobUrl ? "blob: preview" : "No preview"}
        </div>
        <button
          onClick={() => refresh(files)}
          className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
          title="Refresh preview"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
        </button>
        <button
          onClick={openInNewTab}
          className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
          title="Open in new tab"
        >
          <ExternalLink size={13} />
        </button>
      </div>

      {/* error banner */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-900/30 border-b border-red-700/50 text-red-300 text-xs">
          <AlertTriangle size={13} />
          {error}
        </div>
      )}

      {/* iframe */}
      <div className="flex-1 bg-white">
        {blobUrl ? (
          <iframe
            ref={iframeRef}
            src={blobUrl}
            className="w-full h-full border-0"
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin allow-modals allow-forms"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400 text-sm">
            {isLoading
              ? "Building preview..."
              : "Add an index.html to see the preview"}
          </div>
        )}
      </div>
    </div>
  );
}

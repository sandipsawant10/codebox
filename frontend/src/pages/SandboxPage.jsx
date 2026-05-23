import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectsApi } from "../api";
import { useSandboxStore } from "../store/sandboxStore";
import { useAutoSave } from "../hooks/useAutoSave";
import SandboxNav from "../components/layout/SandboxNav";
import FileTree from "../components/filetree/FileTree";
import CodeEditor from "../components/editor/CodeEditor";
import LivePreview from "../components/preview/LivePreview";
import toast from "react-hot-toast";

export default function SandboxPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loadProject } = useSandboxStore();
  const { save } = useAutoSave();
  const [isLoading, setIsLoading] = useState(true);
  const [splitPos, setSplitPos] = useState(50); // percent
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await projectsApi.getById(id);
        loadProject(res.data.project);
      } catch (err) {
        toast.error("Failed to load project");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  // draggable divider
  const handleDividerMouseDown = () => {
    setIsDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const container = document.getElementById("sandbox-container");
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPos(Math.min(80, Math.max(20, pct)));
    };
    const onMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400 text-sm">
        Loading project...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">
      <SandboxNav onSave={save} />

      <div id="sandbox-container" className="flex flex-1 min-h-0">
        {/* file tree - fixed width */}
        <div className="w-52 shrink-0 min-h-0">
          <FileTree />
        </div>

        {/* editor - flexible */}
        <div className="flex min-h-0" style={{ width: `${splitPos}%` }}>
          <CodeEditor />
        </div>

        {/* draggable divider */}
        <div
          className="w-1 bg-gray-700/50 hover:bg-blue-500/50 cursor-col-resize shrink-0 transition-colors"
          onMouseDown={handleDividerMouseDown}
        />

        {/* preview - fills rest */}
        <div className="flex-1 min-h-0 min-w-0">
          <LivePreview />
        </div>
      </div>
    </div>
  );
}

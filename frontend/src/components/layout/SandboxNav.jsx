import { Save, LogOut, Cloud, CloudOff, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useSandboxStore } from "../../store/sandboxStore";

export default function SandboxNav({ onSave }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { projectName, isDirty, isSaving } = useSandboxStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-4 h-11 bg-gray-900 border-b border-gray-700/60 shrink-0">
      {/* left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-400 hover:text-white flex items-center gap-1 text-sm"
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">Projects</span>
        </button>
        <span className="text-gray-600">|</span>
        <span className="text-white text-sm font-medium truncate max-w-[180px]">
          {projectName}
        </span>
        <span className="text-xs text-gray-500">
          {isSaving ? (
            "Saving..."
          ) : isDirty ? (
            <span className="flex items-center gap-1">
              <CloudOff size={11} /> unsaved
            </span>
          ) : (
            <span className="flex items-center gap-1 text-green-500">
              <Cloud size={11} /> saved
            </span>
          )}
        </span>
      </div>

      {/* right */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded"
        >
          <Save size={13} />
          Save
        </button>
        <div className="text-xs text-gray-400 hidden sm:block">
          {user?.name}
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-gray-800"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}

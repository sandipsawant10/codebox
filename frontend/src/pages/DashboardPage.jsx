import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Code2, LogOut, Clock, FolderOpen } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { projectsApi } from "../api";
import toast from "react-hot-toast";

const TEMPLATES = [
  {
    value: "react",
    label: "React",
    desc: "JSX + hooks + esm.sh packages",
    icon: "⚛",
  },
  {
    value: "vanilla",
    label: "Vanilla JS",
    desc: "Plain HTML + CSS + JavaScript",
    icon: "𝐉",
  },
  { value: "html", label: "HTML Only", desc: "Static HTML page", icon: "🌐" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    template: "react",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await projectsApi.getAll();
      setProjects(res.data.projects);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Project name required");
    setCreating(true);
    try {
      const res = await projectsApi.create(form);
      navigate(`/sandbox/${res.data.project._id}`);
    } catch {
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this project?")) return;
    try {
      await projectsApi.delete(id);
      setProjects((p) => p.filter((proj) => proj._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* navbar */}
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Code2 size={18} />
          </div>
          <span className="font-bold text-lg">CodeBox</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm hidden sm:block">
            {user?.name}
          </span>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Projects</h1>
            <p className="text-gray-400 text-sm mt-1">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            <Plus size={16} /> New Project
          </button>
        </div>

        {/* create modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-5">New Project</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Project Name
                  </label>
                  <input
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="My awesome project"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Description (optional)
                  </label>
                  <input
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="What are you building?"
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">
                    Template
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() =>
                          setForm((p) => ({ ...p, template: t.value }))
                        }
                        className={`p-3 rounded-lg border text-left transition ${form.template === t.value ? "border-blue-500 bg-blue-600/10" : "border-gray-700 hover:border-gray-500"}`}
                      >
                        <div className="text-lg mb-1">{t.icon}</div>
                        <div className="text-xs font-semibold">{t.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                          {t.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 border border-gray-700 hover:border-gray-500 text-gray-300 py-2.5 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm"
                  >
                    {creating ? "Creating..." : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* project grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 bg-gray-900 rounded-xl animate-pulse border border-gray-800"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 text-gray-600">
            <FolderOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-500">No projects yet</p>
            <p className="text-sm mt-1">Click "New Project" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <div
                key={proj._id}
                className="group bg-gray-900 border border-gray-700/50 hover:border-gray-600 rounded-xl p-5 cursor-pointer transition"
                onClick={() => navigate(`/sandbox/${proj._id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-blue-600/20 text-blue-400 p-2 rounded-lg">
                    <Code2 size={18} />
                  </div>
                  <button
                    onClick={(e) => handleDelete(proj._id, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 p-1 rounded transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h3 className="font-semibold text-white truncate">
                  {proj.name}
                </h3>
                {proj.description && (
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                    {proj.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-3 text-gray-600 text-xs">
                  <Clock size={11} />
                  <span>{new Date(proj.updatedAt).toLocaleDateString()}</span>
                  <span className="ml-auto bg-gray-800 px-2 py-0.5 rounded text-gray-500">
                    {proj.template}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import { create } from "zustand";

export const useSandboxStore = create((set, get) => ({
  projectId: null,
  projectName: "",
  files: {},
  activeFile: null,
  openTabs: [],
  isDirty: false,
  isSaving: false,

  loadProject: (project) => {
    const filesMap = {};
    for (const f of project.files) {
      filesMap[f.path] = f.content;
    }
    const firstFile = project.files[0]?.path || null;
    set({
      projectId: project._id,
      projectName: project.name,
      files: filesMap,
      activeFile: firstFile,
      openTabs: firstFile ? [firstFile] : [],
      idDirty: false,
    });
  },

  setActiveFile: (path) => {
    const { files, openTabs } = get();
    if (path && files[path] !== undefined && !openTabs.includes(path)) {
      set({ activeFile: path, openTabs: [...openTabs, path] });
      return;
    }

    set({ activeFile: path });
  },

  closeTab: (path) => {
    const { openTabs, activeFile } = get();
    const newTabs = openTabs.filter((t) => t !== path);
    let newActive = activeFile;
    if (activeFile === path) {
      const idx = openTabs.indexOf(path);
      newActive = newTabs[idx] || newTabs[idx - 1] || null;
    }
    set({ openTabs: newTabs, activeFile: newActive });
  },

  updateFileContent: (path, content) => {
    set((state) => ({
      files: { ...state.files, [path]: content },
      isDirty: true,
    }));
  },

  createFile: (path) => {
    const { files, openTabs } = get();
    if (files[path] !== undefined) return; // already exists
    set({
      files: { ...files, [path]: "" },
      openTabs: [...openTabs, path],
      activeFile: path,
      isDirty: true,
    });
  },

  renameFile: (oldPath, newPath) => {
    const { files, openTabs, activeFile } = get();
    if (files[newPath] !== undefined) return; // target already exists
    const newFiles = { ...files };
    newFiles[newPath] = newFiles[oldPath];
    delete newFiles[oldPath];

    const newTabs = openTabs.map((t) => (t === oldPath ? newPath : t));
    set({
      files: newFiles,
      openTabs: newTabs,
      activeFile: activeFile === oldPath ? newPath : activeFile,
      isDirty: true,
    });
  },

  deleteFile: (path) => {
    const { files, openTabs, activeFile } = get();
    const newFiles = { ...files };
    delete newFiles[path];

    const newTabs = openTabs.filter((t) => t !== path);
    let newActive = activeFile === path ? newTabs[0] || null : activeFile;
    set({
      files: newFiles,
      openTabs: newTabs,
      activeFile: newActive,
      isDirty: true,
    });
  },

  createFolder: (folderPath) => {
    const { files } = get();
    const keepPath = `${folderPath}/.gitkeep`;
    if (files[keepPath] !== undefined) return;
    set({
      files: { ...files, [keepPath]: "" },
      isDirty: true,
    });
  },

  markSaved: () => set({ isDirty: false }),
  setIsSaving: (v) => set({ isSaving: v }),

  getFilesArray: () => {
    const { files } = get();
    return Object.entries(files).map(([path, content]) => ({ path, content }));
  },
}));

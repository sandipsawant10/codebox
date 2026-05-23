import { useState } from 'react';
import {
  ChevronRight, ChevronDown, File, Folder, FolderOpen,
  Plus, FilePlus, FolderPlus, Trash2, Pencil
} from 'lucide-react';
import { useSandboxStore } from '../../store/sandboxStore';

// build nested tree structure from flat file map for display only
function buildTree(files) {
  const tree = {};
  for (const path of Object.keys(files)) {
    const parts = path.split('/');
    let node = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        node[part] = { __type: 'file', path };
      } else {
        if (!node[part]) node[part] = { __type: 'folder', children: {} };
        node = node[part].children;
      }
    }
  }
  return tree;
}

function TreeNode({ name, node, depth = 0 }) {
  const [open, setOpen] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const { activeFile, setActiveFile, deleteFile, renameFile } = useSandboxStore();

  const isFile = node.__type === 'file';
  const isActive = isFile && activeFile === node.path;
  const indent = depth * 12 + 8;

  const handleRename = () => {
    if (!newName.trim() || newName === name) { setRenaming(false); return; }
    if (isFile) {
      const newPath = node.path.replace(/(.*\/)?[^/]+$/, `$1${newName}`);
      renameFile(node.path, newPath);
    }
    setRenaming(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (isFile) deleteFile(node.path);
  };

  const handleClick = () => {
    if (isFile) setActiveFile(node.path);
    else setOpen((o) => !o);
  };

  return (
    <div>
      <div
        className={`group flex items-center gap-1 py-0.5 pr-2 cursor-pointer rounded text-sm select-none
          ${isActive ? 'bg-blue-600/20 text-blue-300' : 'text-gray-300 hover:bg-white/5'}`}
        style={{ paddingLeft: indent }}
        onClick={handleClick}
        onDoubleClick={() => isFile && setRenaming(true)}
      >
        {/* expand arrow for folders */}
        {!isFile && (
          <span className="text-gray-500 w-3">
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        )}

        {/* icon */}
        <span className="text-gray-400 shrink-0">
          {isFile
            ? <File size={13} />
            : open ? <FolderOpen size={13} className="text-yellow-400" /> : <Folder size={13} className="text-yellow-400" />}
        </span>

        {/* name or rename input */}
        {renaming ? (
          <input
            autoFocus
            className="bg-gray-700 text-white text-xs px-1 rounded outline-none w-full"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setRenaming(false);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate flex-1 text-xs">{name}</span>
        )}

        {/* action buttons — show on hover */}
        {isFile && !renaming && (
          <div className="hidden group-hover:flex items-center gap-1 ml-auto">
            <button
              className="text-gray-500 hover:text-blue-400 p-0.5"
              onClick={(e) => { e.stopPropagation(); setRenaming(true); setNewName(name); }}
              title="Rename"
            >
              <Pencil size={11} />
            </button>
            <button
              className="text-gray-500 hover:text-red-400 p-0.5"
              onClick={handleDelete}
              title="Delete"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>

      {/* children */}
      {!isFile && open && (
        <div>
          {Object.entries(node.children)
            .sort(([, a], [, b]) => {
              // folders first, then files
              if (a.__type !== b.__type) return a.__type === 'folder' ? -1 : 1;
              return 0;
            })
            .map(([childName, childNode]) => (
              <TreeNode key={childName} name={childName} node={childNode} depth={depth + 1} />
            ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree() {
  const { files, createFile, createFolder } = useSandboxStore();
  const [showNewFile, setShowNewFile] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');

  const tree = buildTree(files);

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    createFile(newFileName.trim());
    setNewFileName('');
    setShowNewFile(false);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim());
    setNewFolderName('');
    setShowNewFolder(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-700/50">
      {/* header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700/50">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Explorer</span>
        <div className="flex gap-1">
          <button
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/5"
            onClick={() => { setShowNewFile(true); setShowNewFolder(false); }}
            title="New File"
          >
            <FilePlus size={14} />
          </button>
          <button
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/5"
            onClick={() => { setShowNewFolder(true); setShowNewFile(false); }}
            title="New Folder"
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      {/* new file input */}
      {showNewFile && (
        <div className="px-2 py-1 border-b border-gray-700/30">
          <input
            autoFocus
            placeholder="filename.jsx"
            className="w-full bg-gray-800 text-white text-xs px-2 py-1 rounded outline-none border border-gray-600 focus:border-blue-500"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFile();
              if (e.key === 'Escape') { setShowNewFile(false); setNewFileName(''); }
            }}
            onBlur={() => { handleCreateFile(); }}
          />
        </div>
      )}

      {/* new folder input */}
      {showNewFolder && (
        <div className="px-2 py-1 border-b border-gray-700/30">
          <input
            autoFocus
            placeholder="folder-name"
            className="w-full bg-gray-800 text-white text-xs px-2 py-1 rounded outline-none border border-gray-600 focus:border-blue-500"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') { setShowNewFolder(false); setNewFolderName(''); }
            }}
            onBlur={() => { handleCreateFolder(); }}
          />
        </div>
      )}

      {/* tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {Object.keys(files).length === 0 ? (
          <p className="text-gray-600 text-xs px-4 py-4">No files yet. Create one above.</p>
        ) : (
          Object.entries(tree)
            .sort(([, a], [, b]) => {
              if (a.__type !== b.__type) return a.__type === 'folder' ? -1 : 1;
              return 0;
            })
            .map(([name, node]) => (
              <TreeNode key={name} name={name} node={node} depth={0} />
            ))
        )}
      </div>
    </div>
  );
}

import Project from "../models/Project.js";
import { ok } from "../utils/response.js";
import { AppError, asyncHandler } from "../middleware/error.js";

const MAX_FILE_SIZE = 500 * 1024;

const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ owner: req.user.userId })
    .select("-files")
    .sort({ createdAt: -1 });
  ok(res, "Projects fetched", { projects });
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new AppError("Project not found", 404);

  if (project.owner.toString() !== req.user.userId && !project.isPublic) {
    throw new AppError("Unauthorized", 403);
  }

  ok(res, "Project fetched", { project });
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description, template = "react" } = req.body;

  const defaultFiles = getDefaultFiles(template);

  const project = await Project.create({
    name,
    description,
    template,
    files: defaultFiles,
    owner: req.user.userId,
  });
  ok(res, "Project created", { project }, 201);
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) throw new AppError("Project not found", 404);

  if (project.owner.toString() !== req.user.userId) {
    throw new AppError("Unauthorized", 403);
  }

  const { name, description, files, isPublic } = req.body;

  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  if (files !== undefined) project.files = files;
  if (isPublic !== undefined) project.isPublic = isPublic;

  if (files !== undefined) {
    for (const f of files) {
      if (f.content && Buffer.byteLength(f.content, "utf8") > MAX_FILE_SIZE) {
        throw new AppError(`File ${f.path} exceeds 500KB limit`, 400);
      }
    }
    project.files = files;
  }
  await project.save();
  ok(res, "Project saved", { project });
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) throw new AppError("Project not found", 404);

  if (project.owner.toString() !== req.user.userId)
    throw new AppError("Access denied", 403);

  await project.deleteOne();
  ok(res, "Project deleted");
});

function getDefaultFiles(template) {
  if (template === "react") {
    return [
      {
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
      },
      {
        path: "src/main.jsx",
        content: `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(<App />);`,
      },

      {
        path: "src/App.jsx",
        content: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
      <h1>Hello from React!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Click me</button>
    </div>
  );
}`,
      },
      {
        path: "src/styles.css",
        content: `body {
  margin: 0;
  padding: 0;
  background: #f9fafb;
}`,
      },
    ];
  }

  if (template === "vanilla") {
    return [
      {
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Vanilla JS</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>Hello World</h1>
    <script src="main.js"></script>
  </body>
</html>`,
      },
      {
        path: "style.css",
        content: `body { font-family: sans-serif; padding: 2rem; }`,
      },
      { path: "main.js", content: `console.log('Hello from JS!');` },
    ];
  }

  // html only
  return [
    {
      path: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Page</title>
    <style>
      body { font-family: sans-serif; padding: 2rem; }
    </style>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>`,
    },
  ];
}

export {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};

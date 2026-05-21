import dotenv from "dotenv";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

dotenv.config();

import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import projectRoutes from "./src/routes/project.routes.js";
import { errorHandler } from "./src/middleware/error.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server running" });
});

app.use((req, res) =>
  res.status(404).json({
    success: false,
    message: "Route not found",
  }),
);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
};

start();

import Router from "express";
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";
import { body } from "express-validator";

const router = Router();

const createRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 80 }),
  body("description").optional().isLength({ max: 300 }),
  body("template").optional().isIn(["react", "vanilla", "html"]),
];

router.use(protect);

router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/", createRules, validate, createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;

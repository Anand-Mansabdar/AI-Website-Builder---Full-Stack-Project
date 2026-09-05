import express from "express";
import {
  createProject,
  deleteProject,
  getProject,
  getPublicProjects,
  listProjects,
  publishProject,
  updateProjectFiles,
} from "../controllers/project.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

projectRouter = express.Router();

projectRouter.get("/public/:id", getPublicProjects);

projectRouter.use(authMiddleware);
projectRouter.post("/", createProject);
projectRouter.get("/", listProjects);
projectRouter.get("/:id", getProject);
projectRouter.delete("/:id", deleteProject);
projectRouter.put("/:id/files", updateProjectFiles);
projectRouter.post("/:id/publish", publishProject);

export default projectRouter;

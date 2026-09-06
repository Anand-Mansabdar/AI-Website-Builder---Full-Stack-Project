import projectModel from "../models/project.model";
import crypto from "crypto";
import { generateProject } from "../services/ai";

function hashContent(content) {
  return crypto.createHash("md5").update(content).digest("hex").slice(0, 12);
}

export const createProject = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({
      error: "Prompt is required.",
    });
  }

  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized user.",
    });
  }

  const project = await projectModel.create({
    name: "Planning Project...",
    description: prompt,
    files: {},
    messages: [
      { role: "user", content: prompt },
      { role: "assistant", content: "Planning project structure..." },
    ],
    version: 0,
    owner: req.user.userId,
    status: "pending",
    filesPlanned: [],
    filesGenerated: [],
    currentFile: null,
    error: null,
  });

  runBackgroundGeneration(project._id.toString(), prompt).catch((err) =>
    console.error(
      `Background AI fatal generation error for project: ${project._id}`,
      err,
    ),
  );

  return res.status(201).json({
    _id: project._id,
    name: project.name,
    description: project.description,
    files: [],
    messages: project.messages,
    version: project.version,
    status: project.status,
    filesPlanned: project.filesPlanned,
    filesGenerated: project.filesGenerated,
    currentFile: project.currentFile,
    error: project.error,
    createdAt: project.createdAt,
  });
};

const runBackgroundGeneration = async (projectId, prompt) => {
  try {
    console.log(`[Background AI] Starting generation for project ${projectId}`);
    const result = await generateProject(prompt, {
      onPlan: async (plan) => {
        console.log(
          `[Background AI] Plan created for project ${projectId}. Planned ${plan.files.length} files.`,
        );

        const fileList = plan.files
          .map((f) => `- \`${f.path}\`: ${f.description}`)
          .join("\n");

        await projectModel.findByIdAndUpdate(projectId, {
          name: plan.projectName || "Generated Project",
          status: "generating",
          filesPlanned: plan.files,
          $push: {
            messages: {
              role: "assistant",
              content: `Planned website structure:\n ${fileList}`,
              timestamp: new Date(),
            },
          },
        });
      },
      onFileStart: async (path) => {
        console.log(
          `[Background AI] Starting file ${path} for project ${projectId}`,
        );
        await projectModel.findByIdAndUpdate(projectId, { currentFile: path });
      },
      onFileComplete: async (path, code) => {
        console.log(
          `[Background AI] Finished file ${path} for project ${projectId}`,
        );

        const project = await projectModel.findById(projectId);

        if (project) {
          project.files = project.files || {};
          project.files[path] = {
            content: code,
            hash: hashContent(code),
          };
          project.filesGenerated = [...(project.filesGenerated || []), path];
          project.messages.push({
            role: "assistant",
            content: `Created file "${path}"`,
            timestamp: new Date(),
          });
          project.currentFile = null;
          project.markModified("files");
          await project.save();
        }
      },
    });
    console.log(`[Background AI] Successfully generated project ${projectId}`);

    const project = await projectModel.findById(projectId);
    if (project) {
      project.status = "completed";
      project.version = 1;
      if (result.description) {
        project.name = result.description;
      }
      project.messages.push({
        role: "assistant",
        content: `Website generation complete! You can view and edit the files.`,
        timestamp: new Date(),
      });

      await project.save();
    }
  } catch (error) {
    console.error(
      `[Background AI] Fatal generation error for project ${projectId}:`,
      error,
    );
    await projectModel.findByIdAndUpdate(projectId, {
      status: "failed",
      error: error.message,
      $push: {
        messages: {
          role: "assistant",
          content: `Generation failed: ${error.message}`,
          timestamp: new Date(),
        },
      },
    });
  }
};

export const listProjects = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized user.",
    });
  }

  const projects = await projectModel
    .find(
      { owner: req.user.userId },
      { name: 1, description: 1, version: 1, createdAt: 1, updatedAt: 1 },
    )
    .sort({ updatedAt: -1 });

  return res.json(projects);
};

export const getProject = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized user.",
    });
  }

  const project = await projectModel.findOne({
    _id: req.params.id,
    owner: req.user.userId,
  });

  if (!project) {
    return res.status(404).json({
      message: "Project not found.",
    });
  }

  const filesObj = {};
  for (const [path, entry] of Object.entries(project.files)) {
    filesObj[path] = entry.content;
  }

  return res.status(200).json({
    _id: project._id,
    name: project.name,
    description: project.description,
    files: filesObj,
    messages: project.messages,
    version: project.version,
    status: project.status,
    filesPlanned: project.filesPlanned,
    filesGenerated: project.filesGenerated,
    currentFile: project.currentFile,
    error: project.error,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  });
};

export const deleteProject = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized user.",
    });
  }

  const result = await projectModel.findOneAndDelete({
    _id: req.params.id,
    owner: req.user.userId,
  });

  if (!result) {
    return res.status(404).json({
      error: "Project not found.",
    });
  }

  return res.json({
    success: true,
  });
};

export const updateProjectFiles = async (req, res) => {
  const { files } = req.body;

  if (!files || typeof files !== "object") {
    return res.status(400).json({
      error: "Files object is required.",
    });
  }

  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized user.",
    });
  }

  const project = await projectModel.findOne({
    _id: req.params.id,
    owner: req.user.userId,
  });

  if (!project) {
    return res.status(404).json({
      error: "Project not found.",
    });
  }

  const newFiles = {};
  for (const [path, content] of Object.entries(files)) {
    if (typeof content === "string") {
      newFiles[path] = { content, hash: hashContent(content) };
    }
  }
  project.files = newFiles;
  await project.save();

  const filesObj = {};
  for (const [path, entry] of Object.entries(files)) {
    if (typeof content === "string") {
      filesObj[path] = entry.content;
    }
  }

  return res.status(200).json({
    _id: project._id,
    name: project.name,
    description: project.description,
    files: filesObj,
    messages: project.messages,
    version: project.version,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  });
};

export const publishProject = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized user.",
    });
  }

  const project = await projectModel.findOneAndUpdate(
    {
      _id: req.params.id,
      owner: req.user.userId,
    },
    { published: true },
    { returnDocument: "after" },
  );

  if (!project) {
    return res.status(404).json({
      error: "Project not found.",
    });
  }

  return res.status(200).json({
    success: true,
    published: project.published,
  });
};

export const getPublicProjects = async (req, res) => {
  const project = await projectModel.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      error: "Project not found.",
    });
  }

  if (!project.published) {
    return res.status(403).json({
      error: "Project is not published yet.",
    });
  }

  const filesObj = {};

  for (const [path, entry] of Object.entries(files)) {
    filesObj[path] = entry.content;
  }

  return res.status(200).json({
    _id: project._id,
    name: project.name,
    description: project.description,
    files: filesObj,
    version: project.version,
  });
};

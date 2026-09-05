import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const filesPlannedSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "Untitled Project",
  },
  description: {
    type: String,
    default: "",
  },
  files: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  messages: {
    type: [messageSchema],
    default: [],
  },
  version: {
    type: Number,
    default: 0,
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },
  published: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["pending", "generating", "revising", "completed", "failed"],
    default: "pending",
  },
  filesPlanned: {
    type: [filesPlannedSchema],
    default: [],
  },
  filesGenerated: {
    type: [String],
    default: [],
  },
  currentFile: {
    type: String,
    default: null,
  },
  error: {
    type: String,
    degault: null,
  },
});

const projectModel = mongoose.model("project", projectSchema);

export default projectModel;

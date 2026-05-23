import mongoose, { modelNames } from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [80, "Name too long"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description too long"],
      default: "",
    },
    template: {
      type: String,
      enum: ["vanilla", "react", "html"],
      default: "react",
    },
    files: [fileSchema],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

projectSchema.index({ owner: 1, updatedAt: -1 });

export default mongoose.model("Project", projectSchema);

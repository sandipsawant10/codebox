import { validationResult } from "express-validator";

const validate = (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    const formatted = error.array().map((e) => ({
      field: e.type === "field" ? e.path : "unknown",
      message: e.msg,
    }));

    return res
      .status(400)
      .json({ success: false, message: "Validation failed", error: formatted });
  }
  next();
};

export { validate };

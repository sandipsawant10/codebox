import { verifyToken } from "../utils/jwt.js";
import { fail } from "../utils/response.js";

const protect = (req, res, next) => {
  const header = req.header.authorization;
  if (!header?.startsWith("Bearer ")) return fail(res, "Unauthorized", 401);

  try {
    req.user = verifyToken(header.split(" ")[1]);
    next();
  } catch {
    fail(res, "Invalid or expired token", 401);
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return fail(res, "Forbidden", 403);
  next();
};

export { protect, requireAdmin };

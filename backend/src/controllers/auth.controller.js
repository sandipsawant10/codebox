import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { ok } from "../utils/response.js";
import { AppError, asyncHandler } from "../middleware/error.js";

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.findOne({ email }))
    throw new AppError("User already exists", 400);

  const user = await User.create({ name, email, password });
  const token = signToken({ userId: user._id.toString(), role: user.role });
  ok(res, "Account created", { user, token }, 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password)))
    throw new AppError("Invalid credentials", 401);

  const token = signToken({ userId: user._id.toString(), role: user.role });
  const userObj = user.toObject();
  delete userObj.password;
  ok(res, "Login successful", { user: userObj, token });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);

  if (!user) throw new AppError("User not found", 404);
  ok(res, "Profile fetched", { user });
});

export { register, login, getMe };

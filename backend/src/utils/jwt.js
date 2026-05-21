import jwt from "jsonwebtoken";

const signToken = (payload) => {
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const verifyToken = (token) => {
  jwt.verify(token, process.env.JWT_SECRET);
};

export { signToken, verifyToken };

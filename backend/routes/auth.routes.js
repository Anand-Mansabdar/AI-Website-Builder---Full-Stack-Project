import { Router } from "express";
import { login, logout, me, register } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", authMiddleware, me);

export default authRouter;

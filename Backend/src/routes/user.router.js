import { Router } from "express";
import {
  LoginUser,
  logoutUser,
  registerUser,
} from "../controller/user.controller.js";
export const userRouter = Router();
import { upload } from "../middlewares/multer.middleware.js";
import { IsAuth } from "../middlewares/AuthMiddleware.js";

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "cover",
      maxCount: 1,
    },
  ]),
  registerUser
);
userRouter.route("/login").post(LoginUser);

// protected routes
userRouter.route("/logout").post(IsAuth, logoutUser);

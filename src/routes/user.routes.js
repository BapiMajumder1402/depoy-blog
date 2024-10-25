import { Router } from "express";
import {registerUser, logInUser,  getCurrentUser  } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/currentUser", verifyJWT ,getCurrentUser)
router.post("/register",registerUser)
router.post("/login",logInUser)
export default router;

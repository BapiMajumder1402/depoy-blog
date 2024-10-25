import express from "express";
import {createComment,deleteComment,getComments, updateComment, } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"; 

const router = express.Router();


router.post("/", verifyJWT, createComment); 
router.put("/:id", verifyJWT, updateComment);
router.delete("/:id", verifyJWT, deleteComment); 
router.get("/", getComments); 

export default router;

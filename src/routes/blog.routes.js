import express from "express";
import { createBlog, getSingleBlog, getBlogs, getUserBlogs, updateBlog, deleteBlog, getUniqueAuthors } from "../controllers/blog.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.post("/", verifyJWT, createBlog);          
router.get("/", getBlogs);                              
router.get("/:id", getSingleBlog);                       
router.get("/authors", getUniqueAuthors);                       
router.get("/user/blogs", verifyJWT, getUserBlogs);   
router.put("/:id", verifyJWT, updateBlog);               
router.delete("/:id", verifyJWT, deleteBlog);            

export default router;

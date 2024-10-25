import dotenv from 'dotenv';
import express from 'express';
import connectDB from './src/db/db.js';
import cookieParser from 'cookie-parser';
import cors from "cors";
import userRouter from './src/routes/user.routes.js';
import blogRoutes from './src/routes/blog.routes.js';
import commentRoutes from './src/routes/comment.routes.js';

dotenv.config({
    path: '.env'
});

const app = express();


app.use(cors({ origin: process.env.CORS }));
app.use(cookieParser());
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(express.static("public"));


app.use("/api/v1/user", userRouter);
app.use("/api/v1/blog", blogRoutes);     
app.use("/api/v1/comment", commentRoutes);


connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server listening on port ${process.env.PORT}`);
    });
}).catch((error) => {
    console.log(`Server error: ${error}`);
});

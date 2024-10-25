import { Blog } from "../modals/blog.model.js";
import { ApiError } from "../utils/apiErrorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";


export const createBlog = asyncHandler(async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        throw new ApiError(400, "Title and content are required.");
    }

    const newBlog = await Blog.create({
        title,
        content,
        author: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, newBlog, "Blog created successfully."));
});


export const getSingleBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id).populate({
        path: 'comments', 
        populate: {
            path: 'commenter', 
            select: 'fullName email'
        }
    }).populate({
        path: 'author',
        select: 'fullName email' 
    });

    if (!blog) {
        throw new ApiError(404, "Blog not found.");
    }

    return res.status(200).json(new ApiResponse(200, blog, "Blog retrieved successfully."));
});



export const getBlogs = asyncHandler(async (req, res) => {
    const { title, authorId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {
        ...(title && { title: { $regex: title, $options: 'i' } }),
        ...(authorId && { author: authorId }) 
    };


    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    const blogs = await Blog.find(query)
        .populate("author", "fullName email")
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip((pageNumber - 1) * pageSize) 
        .limit(pageSize); 


    const totalBlogs = await Blog.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, { blogs, total: totalBlogs }, "Blogs fetched successfully."));
});



export const getUserBlogs = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const userBlogs = await Blog.find({ author: userId })
        .populate("author", "fullName email")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, userBlogs, "User blogs fetched successfully."));
});


export const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
        throw new ApiError(404, "Blog not found.");
    }

    if (blog.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this blog.");
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;

    const updatedBlog = await blog.save();

    return res.status(200).json(new ApiResponse(200, updatedBlog, "Blog updated successfully."));
});


export const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
        throw new ApiError(404, "Blog not found.");
    }
    if (blog.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this blog.");
    }

    await Blog.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, null, "Blog deleted successfully."));
});





export const getUniqueAuthors = asyncHandler(async (req, res) => {
    try {
        console.log("Fetching unique authors...");
        const authors = await Blog.aggregate([
            {
                $match: {
                    author: { $type: "objectId" }
                }
            },
            {
                $group: {
                    _id: "$author", 
                    authorCount: { $sum: 1 } 
                }
            },
            {
                $lookup: {
                    from: "users", 
                    localField: "_id", 
                    foreignField: "_id",
                    as: "authorInfo"
                }
            },
            {
                $unwind: "$authorInfo"
            },
            {
                $project: {
                    _id: 0,
                    authorId: "$_id", 
                    authorName: "$authorInfo.fullName"
                }
            }
        ]);

        console.log("Authors found:", authors);
        return res.status(200).json(new ApiResponse(200, authors, "Unique authors retrieved successfully"));
    } catch (error) {
        console.error("Error retrieving authors:", error); 
        throw new ApiError(500, "Error retrieving authors");
    }
});



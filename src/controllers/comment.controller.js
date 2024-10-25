import { Comment } from "../modals/comment.model.js";
import { Blog } from "../modals/blog.model.js";
import { ApiError } from "../utils/apiErrorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";


export const createComment = asyncHandler(async (req, res) => {
    const { blogId, content } = req.body;

    if (!blogId || !content) {
        throw new ApiError(400, "Blog ID and content are required.");
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new ApiError(404, "Blog not found.");
    }

    const newComment = await Comment.create({
        blog: blogId,
        content,
        commenter: req.user._id,
    });

    blog.comments.push(newComment._id);
    await blog.save();

    return res.status(201).json(new ApiResponse(201, newComment, "Comment created successfully."));
});




export const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) {
        throw new ApiError(404, 'Comment not found.');
    }
    if (!req.user || !comment.commenter) {
        throw new ApiError(403, 'You are not authorized to delete this comment.');
    }
    if (comment.commenter.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not authorized to delete this comment.');
    }
    await Comment.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, null, 'Comment deleted successfully.'));
});



export const getComments = asyncHandler(async (req, res) => {
    const { blogId } = req.query;

    const pipeline = [
        {
            $match: { blog: blogId }
        },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "authorInfo"
            }
        },
        {
            $unwind: "$authorInfo"
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                "authorInfo.fullName": 1,
                "authorInfo.email": 1
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ];

    const comments = await Comment.aggregate(pipeline);

    return res.status(200).json(new ApiResponse(200, comments, "Comments retrieved successfully."));
});

export const updateComment = asyncHandler(async (req, res) => {
    const { id } = req.params; 
    const { content } = req.body; 

    if (!content) {
        throw new ApiError(400, "Content is required.");
    }

    const comment = await Comment.findById(id);
    if (!comment) {
        throw new ApiError(404, "Comment not found.");
    }

    if (!req.user || !comment.commenter) {
        throw new ApiError(403, "You are not authorized to update this comment.");
    }

    if (comment.commenter.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment.");
    }

    comment.content = content;
    await comment.save();

    return res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully."));
});


import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrorHandler.js";
import { User } from "../modals/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessToken = (userId,email) => {
    return jwt.sign({ _id: userId, email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
};


const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    if (await User.findOne({ email })) {
        throw new ApiError(409, "User with this email already exists.");
    }

    const user = await User.create({ fullName, email, password });

    const createdUser = await User.findById(user._id).select("-password");
    if (!createdUser) {
        throw new ApiError(500, "Error registering user");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "Successfully registered"));
});


const logInUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(401, "Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(402, "Account not found");
    }

    const verified = await user.isPasswordCorrect(password);
    if (!verified) {
        throw new ApiError(403, "Password is incorrect");
    }

    const accessToken = generateAccessToken(user._id,user.email);

    user.password = null; 

    const options = {
        httpOnly: true,
        secure: true, 
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(201, { user, accessToken }, "Successfully logged in"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(201, req.user, "Current user data"));
});

export { registerUser, logInUser, getCurrentUser };

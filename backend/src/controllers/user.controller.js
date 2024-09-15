import { User } from "../models/user.model.js";
import { Todo } from "../models/todo.model.js"; 
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found"); 
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
   
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens: " + error.message);
  }
};

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body; 
  
    if ([name, email, password].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }
  
    const existedUser = await User.findOne({
      $or: [{ email }], 
    });
  
    if (existedUser) {
      throw new ApiError(400, "User already exists");
    }
    
    const user = await User.create({
      name, 
      email,
      password,
    });

    // Exclude password and refreshToken directly
    const createdUser = user.toObject();
    delete createdUser.password;
    delete createdUser.refreshToken;
  
    return res
      .status(201)
      .json(
        new ApiResponse(200, createdUser, "User has been registered successfully")
      );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body; // Changed to only require email and password
    if (!email || !password) {
      throw new ApiError(400, "All fields are required");
    }
  
    const user = await User.findOne({ email });
  
    if (!user) {
      throw new ApiError(404, "User does not exist"); 
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
  
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
    }
  
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  
    // Fetch all tasks for the logged-in user
    const tasks = await Todo.find({ userId: user._id });

    // Use the user object directly instead of querying again
    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken, tasks }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "No user is currently logged in"));
    }

    // Find the user by the id from the authenticated request
    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "User not found, but session cleared"));
    }

    // Clear the user's refresh token from the database
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    // Clear the cookies
    res.clearCookie("accessToken", { httpOnly: true, secure: true });
    res.clearCookie("refreshToken", { httpOnly: true, secure: true });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "User has been logged out successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Error logging out");
  }
});
  


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
  
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }
  
    //verifying refresh token
    try {
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      console.log("Decoded Token:", decodedToken);

  
      const user = User.findById(decodedToken?._id);
      if (!user) {
        throw new ApiError(401, "Invalid refresh Token");
      }
  
      if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, " refresh Token expired");
      }
  
      const options = {
        httpOnly: true,
        secure: true,
      };
  
      const { accessToken, newrefreshToken } =
        await generateAccessAndRefreshTokens(user._id);
  
      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
          new ApiResponse(
            200,
            { accessToken, newrefreshToken },
            "Access token refreshed successfully"
          )
        );
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh Token");
    }
  });

export { generateAccessAndRefreshTokens, registerUser,loginUser,logoutUser,refreshAccessToken };
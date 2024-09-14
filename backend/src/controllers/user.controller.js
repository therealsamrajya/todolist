import { User } from "../models/user.model.js";
import { Todo } from "../models/todo.model.js"; // Import the Todo model
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found"); // Check if user exists
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
    const { name, email, password } = req.body; // Changed username to name
  
    if ([name, email, password].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }
  
    const existedUser = await User.findOne({
      $or: [{ email }], // Removed username check
    });
  
    if (existedUser) {
      throw new ApiError(400, "User already exists");
    }
    
    const user = await User.create({
      name, // Changed username to name
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
      throw new ApiError(404, "User does not exist"); // Corrected typo
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
      // Check if the refresh token exists in cookies
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        throw new ApiError(400, "No user is currently logged in");
      }
  
      // Decode the refresh token to find the user
      const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      // Find the user by the decoded token
      const user = await User.findById(decodedToken._id);
  
      if (!user) {
        throw new ApiError(404, "User not found");
      }
  
      // Clear the user's refresh token from the database (logout session)
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
  
      // Clear the cookies
      return res
        .status(200)
        .clearCookie("accessToken", { httpOnly: true, secure: true })
        .clearCookie("refreshToken", { httpOnly: true, secure: true })
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
import { UserModel } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponce.js";
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access tokens and refresh tokens"
    );
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, userName, password, email } = req.body;

  // check if all fields are provided
  if (
    [fullName, userName, password, email].some((field) => {
      return field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "all fields are required");
  }
  // find user to check  are  they already exist in the database or not

  const existedUser = await UserModel.findOne({
    $or: [{ email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  // add files to local storagedisk
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }

  // ⬇️⬇️⬇️⬇️⬇️⬇️ upload files to the cloudinary server

  const avatar = await uploadCloudinary(avatarLocalPath);

  const coverImage = await uploadCoverImage(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "avatar file is required");
  }

  const user = await UserModel.create({
    fullName,
    email,
    password,
    coverImage: coverImage?.url || "",
    avatar: avatar.url,
    username: user.username.toLowerCase(),
  });

  const createdUser = await UserModel.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "somthing went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

export const LoginUser = asyncHandler(async (req, res) => {
  const { email, password, userName } = req.body;
  if (!(email || userName)) {
    throw new ApiError(401, "email or userName is required");
  }

  const user = await UserModel.findOne({
    $or: [{ email, userName }],
  });
  if (!user) {
    throw new ApiError(404, `user with this  email ${email} does not exist`);
  }
  const isPaswordValid = await user.isPassowrdCorrect(password);
  if (!isPaswordValid) {
    throw new ApiError(401, "invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  const loggedinUser = await UserModel.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", options)
    .cookie("refreshToken", options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedinUser,
          accessToken,
          refreshToken,
        },

        "user logged in successfully"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.REFERSH_TOKEN_SECRET);

    const user = await UserModel.findOne(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incommingRefreshToken == user.refreshToken) {
      throw new ApiError(401, "refresh token isexpoired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { newRefreshToken, accessToken } =
      await generateAccessAndRefreshTokens(user._id);
    return res
      .status(200)
      .cookies("accessToken", accessToken)
      .cookies("refreshToken", newRefreshToken)
      .json(
        new ApiResponse(200, { accessToken, refreshToken: newRefreshToken })
      );
  } catch (error) {
    throw new ApiError(401, error?.massage || "Invalid refresh token");
  }
});

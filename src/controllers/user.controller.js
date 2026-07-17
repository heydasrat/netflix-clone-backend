import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import User from '../models/user.model.js'
import OTP from '../models/otp.model.js'
import { sendEmail } from '../service/email.service.js'
import { generateOTP, otpHTML } from '../utils/otp.util.js'
import config from '../config/config.js'
import jwt from 'jsonwebtoken'
import { uploadOnCloudinary } from '../utils/uploadOnCloudinary.js'
import { v2 as cloudinary } from "cloudinary"


const options = {
    httpOnly: true,
    secure: true
}

const generateRefreshAndAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { refreshToken, accessToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating your tokens")
    }
}

const generateResetTokenfunc = async (userId) => {
    try {
        const user = await User.findById(userId)
        const resetToken = user.generateResetToken()

        user.resetToken = resetToken
        await user.save({ validateBeforeSave: false })

        return { resetToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating your token")
    }
}



const register = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body

    if ([fullName, username, email, password].some((fields) => !fields || fields.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        if (existedUser.email === email) {
            throw new ApiError(400, "User is already registered with this email")
        } else if (existedUser.username === username) {
            throw new ApiError(400, "Username is already taken")
        }
    }

    await OTP.deleteMany({ email });

    const otp = generateOTP();

    const otpDoc = new OTP({
        email,
        otp,
    });

    await otpDoc.save();

    const emailContent = otpHTML(otp);

    // console.log(emailContent, otp)
    await sendEmail(
        email,
        "Your OTP for Registration | Advance Authentication",
        `Your OTP is ${otp}. It is valid for 5 minutes.`,
        emailContent
    );
    const user = await User.create({
        fullName,
        username,
        email,
        password,
        isVerified: false,
    });

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(201).json(
        new ApiResponse(201, loggedInUser, "User registered successfully. Please verify your email using the OTP sent to your email address.")
    )

})

const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({
        email,
        isVerified: false,
    });

    if (!user) {
        throw new ApiError(404, "User not found or already verified");
    }


    const otpDoc = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!otpDoc) {
        throw new ApiError(400, "Invalid OTP or OTP has expired");
    }

    const isMatch = await otpDoc.compareOTP(otp);

    if (!isMatch) {
        throw new ApiError(400, "Invalid OTP");
    }


    user.isVerified = true;
    await user.save();


    await OTP.deleteOne({ _id: otpDoc._id });

    return res.status(200).json(
        new ApiResponse(200, user, "OTP verified successfully")
    );
});

const login = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body
    if (!(username || email)) {
        throw new ApiError(400, "Email or username is required")
    }

    if (!password || password.trim() === "") {
        throw new ApiError(400, "Invalid Password")
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!existedUser) {
        throw new ApiError(404, "User not found")
    }

    if (!existedUser.isVerified) {
        return res.status(403).json(
            new ApiResponse(403, {}, "Please verify Your Account Before Logging")
        )
    }

    const isPasswordValid = await existedUser.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(403, "Invalid Credentials")
    }

    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(existedUser._id)

    const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken")



    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { loggedInUser, newAccessToken: accessToken, newRefreshToken: refreshToken }, "User has logged in successfully")
        )

})

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: null
        }
    },
        {
            new: true
        })


    res.status(200).clearCookie("accessToken", options)
        .clearCookie("refreshToken", options).json(
            new ApiResponse(200, {}, "User has logged out successfully")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(incomingRefreshToken, config.refreshTokenSecret)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        const { refreshToken, accessToken } = await generateRefreshAndAccessToken(user._id)

        const loggedInUser = await User.findById(user._id)

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, { loggedInUser, newAccessToken: accessToken, newRefreshToken: refreshToken }, "User tokens refreshed Successfully.")
            )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body

    if ([oldPassword, newPassword, confirmPassword].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required.")
    }

    const user = await User.findById(req.user._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid Credentials")
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "New and confirm password are not same!")
    }

    user.password = newPassword
    await user.save()

    const updatedUser = await User.findById(req.user._id)

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Current Password Changed Successfully")
    )
})

const changeCurrentEmail = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if ([email, password].some((fields) => !fields || fields.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findById(req.user._id)

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid Credentials")
    }

    const existedUserWithEmail = await User.findOne({ email, isVerified: true })

    if (existedUserWithEmail) {
        throw new ApiError(400, "The email is already registered")
    }

    const loggedInUser = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            isVerified: false,
            email: email
        }
    }, {
        new: true
    }
    )

    await OTP.deleteMany({ email });

    const otp = generateOTP();

    const otpDoc = new OTP({
        email,
        otp,
    });

    await otpDoc.save();

    const emailContent = otpHTML(otp);

    // console.log(emailContent, otp)
    await sendEmail(
        email,
        "Your OTP for Registration | Advance Authentication",
        `Your OTP is ${otp}. It is valid for 5 minutes.`,
        emailContent
    );




    return res.status(200).json(
        new ApiResponse(200, {}, "Email has registered Successfully. Please verify your email using the OTP sent to your email address.")
    )


})

const changeUserDetails = asyncHandler(async (req, res) => {
    const { username, fullName } = req.body
    const detailsToGetUpdated = {}

    if (username) {
        detailsToGetUpdated.username = username

        const user = await User.findOne({ username })

        if (user) {
            throw new ApiError(400, "Username is already taken")
        }
    }
    if (fullName) {
        detailsToGetUpdated.fullName = fullName
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: detailsToGetUpdated
    }, {
        new: true
    })

    return res.status(200).json(
        new ApiResponse(200, "", "User info updated successfully")
    )
})

const updateUserProfileImage = asyncHandler(async (req, res) => {
    const profileImageLocalPath = req.file?.path
    const user = await User.findById(req.user._id)

    if (!profileImageLocalPath) {
        throw new ApiError(400, "Profile Image is Missing!")
    }

    const profileImage = await uploadOnCloudinary(profileImageLocalPath)
    if (!profileImage) {
        throw new ApiError(500, "Something went wrong while uploading your profile Image")
    }

    if (user.profilePicture.public_id) {
        await cloudinary.uploader.destroy(user.profilePicture.public_id)
    }

    const loggedInUser = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            profilePicture: {
                url: profileImage.secure_url,
                public_id: profileImage.public_id
            }
        }
    }, {
        new: true
    })

    return res.status(200).json(
        new ApiResponse(200, {}, "User profile image updated successfully")
    )


})

const forgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body
    if (!email || email.trim() === "") {
        throw new ApiError(400, "Email is required")
    }

    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(404, "User not found!")
    }

    await OTP.deleteMany({ email });

    const otp = generateOTP();

    const otpDoc = new OTP({
        email,
        otp,
    });

    await otpDoc.save();

    const emailContent = otpHTML(otp);


    await sendEmail(
        email,
        "Reset Your Password | Advance Authentication",
        `Your OTP is ${otp}. It is valid for 5 minutes.`,
        emailContent
    );

    return res.status(200).json(
        new ApiResponse(200, {}, "We have sent you the reset password verification code at your email.")
    )

})

const verifyOTPToResetPassword = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({
        email,
        isVerified: true
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const otpDoc = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!otpDoc) {
        throw new ApiError(400, "Invalid OTP or OTP has expired");
    }

    const isMatch = await otpDoc.compareOTP(otp);

    if (!isMatch) {
        throw new ApiError(400, "Invalid OTP");
    }

    await OTP.deleteOne({ _id: otpDoc._id });

    const { resetToken } = await generateResetTokenfunc(user._id);

    return res
        .status(200)
        .cookie("resetToken", resetToken, options)
        .json(
            new ApiResponse(
                200,
                {},
                "OTP verified successfully. You can now reset your password."
            )
        );
});

const resetPassword = asyncHandler(async (req, res) => {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
        throw new ApiError(400, "All fields are required");
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "Passwords do not match");
    }

    const token =
        req.cookies?.resetToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decoded = jwt.verify(token, config.resetTokenSecret);

    const user = await User.findById(decoded._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.password = newPassword;
    user.resetToken = null;
    await user.save();

    return res
        .status(200)
        .clearCookie("resetToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "Password reset successfully"
            )
        );
});

export {
    register,
    verifyOTP,
    login,
    logout,
    refreshAccessToken,
    changeCurrentPassword,
    changeCurrentEmail,
    changeUserDetails,
    updateUserProfileImage,
    forgetPassword,
    verifyOTPToResetPassword,
    resetPassword
}
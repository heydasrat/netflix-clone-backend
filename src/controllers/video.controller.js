import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import User from '../models/user.model.js'
import Video from '../models/video.model.js'
import config from '../config/config.js'
import { uploadOnCloudinary } from '../utils/uploadOnCloudinary.js'
import { v2 as cloudinary } from 'cloudinary'
import mongoose from 'mongoose'

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if (!title.trim() || !description.trim()) {
        throw new ApiError(400, "All fields are required")
    }

    const videoFile = req.files?.video?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];



    if (!videoFile) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailFile) {
        throw new ApiError(400, "Thumbnail is required");
    }


    if (!videoFile.mimetype.startsWith("video/")) {
        throw new ApiError(400, "Only video files are allowed");
    }


    if (!thumbnailFile.mimetype.startsWith("image/")) {
        throw new ApiError(400, "Only image thumbnails are allowed");
    }

    const videoLocalPath = videoFile.path;
    const thumbnailLocalPath = thumbnailFile.path;

    const videoOnCloud = await uploadOnCloudinary(videoLocalPath)
    const thumbnailOnCloud = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoOnCloud) {
        throw new ApiError(500, "Something went wrong while uploading your video! please try again later.")
    }

    if (!thumbnailOnCloud) {
        throw new ApiError(500, "Something went wrong while uploading your thumbnail! please try again later.")
    }

    const videoDoc = await Video.create({
        title,
        description,
        videoFile: {
            url: videoOnCloud.secure_url,
            public_id: videoOnCloud.public_id
        },
        thumbnail: {
            url: thumbnailOnCloud.secure_url,
            public_id: thumbnailOnCloud.public_id
        },
        duration: videoOnCloud.duration,
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, videoDoc, "Video uploaded successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const thumbnailFile = req.file;
    const { videoId } = req.params

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video Id")
    }

    if (!title?.trim() && !description?.trim() && !thumbnailFile) {
        throw new ApiError(400, "At least one field is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const fieldsToBeUpdated = {};

    if (title?.trim()) {
        fieldsToBeUpdated.title = title.trim();
    }

    if (description?.trim()) {
        fieldsToBeUpdated.description = description.trim();
    }

    if (thumbnailFile) {
        if (!thumbnailFile.mimetype.startsWith("image/")) {
            throw new ApiError(400, "Only image thumbnails are allowed");
        }

        const thumbnailOnCloud = await uploadOnCloudinary(thumbnailFile.path);

        if (!thumbnailOnCloud) {
            throw new ApiError(500, "Something went wrong while uploading the thumbnail");
        }

        // Delete old thumbnail only if it exists
        if (video.thumbnail?.public_id) {
            await cloudinary.uploader.destroy(video.thumbnail.public_id);
        }

        fieldsToBeUpdated.thumbnail = {
            url: thumbnailOnCloud.url,
            public_id: thumbnailOnCloud.public_id,
        };
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: fieldsToBeUpdated,
        },
        {
            new: true,
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedVideo,
            "Video updated successfully"
        )
    );
});

const deleteVieoByid = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "VideoId is missing")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Video Id is not valid")
    }

    const video = await Video.findByIdAndDelete(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found!")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Video file deleted successfully")
    )

})

const togglePublish = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "VideoId is missing")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Video Id is not valid")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found!")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res.status(200).json(
        new ApiResponse(200, video, "Video isPublished successfully toggled")
    )



})

const getAllVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({ isPublished: true })
    if (videos.length <= 0) {
        throw new ApiError(404, "Videos not found")
    }
    console.log(videos)

    return res.status(200).json(
        new ApiResponse(200, videos, "All published videos fetched")
    )
})
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Invalid Video Id")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video Id")
    }

    const video = await Video.find({ id: videoId, isPublished: true })

    if (!video) {
        throw new ApiError(404, "Video not found")
    }


    return res.status(200).json(
        new ApiResponse(200, video, " Video fetched Successfully")
    )
})

export {
    publishVideo,
    updateVideo,
    deleteVieoByid,
    togglePublish,
    getAllVideos,
    getVideoById,
    getAllVideos

}
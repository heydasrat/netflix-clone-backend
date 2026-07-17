import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            url: {
                type: String,
                required: true
            },
            public_id: {
                type: String,
                required: true
            }
        },
        thumbnail: {
            url: {
                type: String,
                required: true
            },
            public_id: {
                type: String,
                required: true
            }
        },
        owner: {
            type: mongoose.Types.ObjectId,
            ref: "User"
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ""
        },
        duration: {
            type: String,
        },
        views: {
            type: Number,
            default:0
        },
        isPublished: {
            type: Boolean,
            default: true
        }
    },

    {
        timestamps: true
    })
const Video = mongoose.model("Video", videoSchema)
export default Video
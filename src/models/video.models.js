import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchemaDefinition = {
    file: {
        type: String, // Cloudinary's URL
        required: [true, "file is required"],
    },
    thumbnail: {
        type: String, // Cloudinary's URL
        required: [true, "thumbnail is required"],
    },
    title: {
        type: String,
        required: [true, "title is required"],
    },
    description: {
        type: String,
        required: [true, "description is required"],
    },
    duration: {
        type: Number,
        required: [true, "duration is required"],
    },
    views: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: String,
        enum: ["published", "private", "unlisted"],
        default: "published",
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}

const videoSchema = new Schema(videoSchemaDefinition, { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema);
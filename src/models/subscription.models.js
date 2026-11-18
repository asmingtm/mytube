import { Schema, model } from "mongoose";

const subscriptionSchemaDefinition = {
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}

const subscriptionSchemaOptions = {
    timestamps: true,
}

const subscriptionSchema = new Schema(subscriptionSchemaDefinition, subscriptionSchemaOptions);

export const Subscription = model("Subscription", subscriptionSchema);
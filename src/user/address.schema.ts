import { Schema } from "mongoose";

import IAddress from "./address.interface";

const addressSchema = new Schema<IAddress>(
    {
        city: String,
        country: String,
        street: String,
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export default addressSchema;

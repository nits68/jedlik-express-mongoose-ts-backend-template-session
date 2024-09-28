"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const addressSchema = new mongoose_1.Schema({
    city: String,
    country: String,
    street: String,
}, { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } });
exports.default = addressSchema;
//# sourceMappingURL=_address.schema.js.map
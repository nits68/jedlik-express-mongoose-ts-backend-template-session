"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const tokenSchema = new mongoose_1.Schema({
    _userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    token: { type: String, required: true },
    expireAt: { type: Date, default: Date.now, index: { expires: 86400000 } },
}, { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const tokenModel = (0, mongoose_1.model)("Token", tokenSchema);
exports.default = tokenModel;
//# sourceMappingURL=_token.model.js.map
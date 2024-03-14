/* eslint-disable @typescript-eslint/no-unused-vars */
import { Type } from "class-transformer";
import { IsArray, IsMongoId, IsOptional, IsString, ValidateNested } from "class-validator";
import { Schema } from "mongoose";

import IPost from "./post.interface";

export default class CreatePostDto implements IPost {
    @IsMongoId()
    @IsOptional()
    _id: Schema.Types.ObjectId;

    // 1:N -> N:M, lsd.: athor collection
    // @IsMongoId()
    // @IsOptional()
    // public user_id: Schema.Types.ObjectId;

    @IsString()
    content: string;

    @IsString()
    title: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @IsMongoId()
    @Type(() => Schema.Types.ObjectId)
    user_id: Schema.Types.ObjectId[];
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsMongoId, IsOptional, IsString } from "class-validator";
import { Schema } from "mongoose";

export default class CreatePostDto {
    @IsMongoId()
    @IsOptional()
    public _id: Schema.Types.ObjectId;

    @IsString()
    public content: string;

    @IsString()
    public title: string;
}

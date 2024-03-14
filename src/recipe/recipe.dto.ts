import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from "class-validator";
import { Schema } from "mongoose";

import IRecipe from "./recipe.interface";

export default class CreateRecipeDto implements IRecipe {
    @IsMongoId()
    @IsOptional()
    _id: Schema.Types.ObjectId;

    @IsNotEmpty()
    @IsString()
    recipeName: string;

    @IsNotEmpty()
    @IsUrl()
    @IsString()
    imageURL: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsArray()
    @ArrayNotEmpty()
    ingredients: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @IsMongoId()
    @Type(() => Schema.Types.ObjectId)
    user_id: Schema.Types.ObjectId[];
}

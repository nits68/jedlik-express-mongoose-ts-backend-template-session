import "reflect-metadata";

import { Type } from "class-transformer";
import {
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsDefined,
    IsEmail,
    IsMongoId,
    IsNotEmptyObject,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from "class-validator";
import { Schema } from "mongoose";

// import { Match } from "./match.decorator";
import AddressDto from "./address.dto";
import IUser from "./user.interface";

export default class CreateUserDto implements IUser {
    @IsMongoId()
    @IsOptional()
    _id: Schema.Types.ObjectId;

    @IsString()
    name: string;

    @IsEmail()
    email: string;

    // Example - compare two fields in document:
    // @IsEmail()
    // @Match("email", { message: "email and email_address_confirm don't match." })
    // public email_address_confirm: string;

    @IsBoolean()
    email_verified: boolean;

    @IsBoolean()
    auto_login: boolean;

    @IsString()
    picture: string;

    @IsString()
    password: string;

    // roles set ["user"] in handler registration
    // @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    roles: string[];

    // For validating nested object you must import reflect-metadata and define @Type:
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;
}

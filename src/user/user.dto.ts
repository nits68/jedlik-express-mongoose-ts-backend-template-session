import "reflect-metadata";
import { Type } from "class-transformer";
import { IsArray, ArrayNotEmpty, IsString, IsBoolean, IsEmail, IsOptional, ValidateNested } from "class-validator";
// import { Match } from "./match.decorator";
import CreateAddressDto from "./address.dto";
import IUser from "./user.interface";

export default class CreateUserDto implements IUser {
    @IsString()
    public name: string;

    @IsEmail()
    public email: string;

    // Example - compare two fields in document:
    // @IsEmail()
    // @Match("email", { message: "email and email_address_confirm don't match." })
    // public email_address_confirm: string;

    @IsBoolean()
    public email_verified: boolean;

    @IsBoolean()
    public auto_login: boolean;

    @IsString()
    public picture: string;

    @IsString()
    public password: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    public roles: string[];

    @IsOptional()
    // For validating nested object you must import reflect-metadata and define @Type:
    @ValidateNested()
    @Type(() => CreateAddressDto)
    public address: CreateAddressDto;
}

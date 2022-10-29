/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsOptional, IsString, IsBoolean, IsEmail, ValidateIf, ValidateNested, IsInt } from "class-validator";
import { Match } from "./match.decorator";
import CreateAddressDto from "./address.dto";

export default class CreateUserDto {
    @IsString()
    public name: string;

    @IsEmail()
    public email: string;

    @IsEmail()
    @Match("email", { message: "Password and confirm password don't match." })
    public email_address_confirm: string;

    @IsBoolean()
    public email_verifed: boolean;

    @IsBoolean()
    public auto_login: boolean;

    @IsString()
    public picture: string;

    @IsString()
    public password: string;

    @IsInt()
    public role_bits: number;

    @IsOptional()
    @ValidateNested()
    public address?: CreateAddressDto;
}

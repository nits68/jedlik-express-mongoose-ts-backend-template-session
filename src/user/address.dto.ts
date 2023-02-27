/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsString, IsOptional } from "class-validator";
import IAddress from "./address.interface";

export default class CreateAddressDto implements IAddress {
    @IsString()
    public street: string;

    @IsString()
    public city: string;

    @IsString()
    public country: string;
}

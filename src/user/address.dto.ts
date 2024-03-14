/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Schema } from "mongoose";

import IAddress from "./address.interface";

export default class CreateAddressDto implements IAddress {
    @IsMongoId()
    @IsOptional()
    _id: Schema.Types.ObjectId;

    @IsString()
    street: string;

    @MinLength(2, {
        message: "A településnév nem lehet $constraint1 karakternél rövidebb, a megadott adat ($value) ezt nem teljesíti!",
    })
    @MaxLength(21, {
        message: "A településnév nem lehet $constraint1 karakternél hosszabb, a megadott adat ($value) ezt nem teljesíti!!",
    })
    @IsString()
    city: string;

    @IsString()
    country: string;
}

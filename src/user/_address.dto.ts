/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Schema } from "mongoose";

import IAddress from "./_address.interface";

/**
 * @openapi
 * components:
 *  schemas:
 *   Address:
 *     type: object
 *     properties:
 *      _id:
 *        type: string
 *        description: 'A lakóhely adatok azonosítója, elsődleges kulcs (ObjectId)'
 *        example: 'b11111111111111111111111'
 *      country:
 *        type: string
 *        description: 'A lakóhely országa'
 *        example: 'Hungary'
 *      city:
 *        type: string
 *        description: 'A lakóhely települése'
 *        example: 'Győr'
 *      street:
 *        type: string
 *        description: 'A lakóhely egyéb adatai'
 *        example: 'Futrinka utca 13.'
 *
 */
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-unused-vars */
const class_validator_1 = require("class-validator");
const mongoose_1 = require("mongoose");
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
class CreateAddressDto {
    _id;
    street;
    city;
    country;
}
exports.default = CreateAddressDto;
tslib_1.__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", mongoose_1.Schema.Types.ObjectId)
], CreateAddressDto.prototype, "_id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateAddressDto.prototype, "street", void 0);
tslib_1.__decorate([
    (0, class_validator_1.MinLength)(2, {
        message: "A településnév nem lehet $constraint1 karakternél rövidebb, a megadott adat ($value) ezt nem teljesíti!",
    }),
    (0, class_validator_1.MaxLength)(21, {
        message: "A településnév nem lehet $constraint1 karakternél hosszabb, a megadott adat ($value) ezt nem teljesíti!!",
    }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateAddressDto.prototype, "city", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateAddressDto.prototype, "country", void 0);
//# sourceMappingURL=_address.dto.js.map
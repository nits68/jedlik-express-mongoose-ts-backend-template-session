"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("reflect-metadata");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const mongoose_1 = require("mongoose");
// import { Match } from "./match.decorator";
const address_dto_1 = tslib_1.__importDefault(require("./address.dto"));
class CreateUserDto {
    _id;
    name;
    email;
    // Example - compare two fields in document:
    // @IsEmail()
    // @Match("email", { message: "email and email_address_confirm don't match." })
    // public email_address_confirm: string;
    email_verified;
    auto_login;
    picture;
    password;
    // roles set ["user"] in handler registration
    // @IsOptional()
    roles;
    // For validating nested object you must import reflect-metadata and define @Type:
    address;
    recipe_id;
    post_id;
}
exports.default = CreateUserDto;
tslib_1.__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", mongoose_1.Schema.Types.ObjectId)
], CreateUserDto.prototype, "_id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Boolean)
], CreateUserDto.prototype, "email_verified", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], CreateUserDto.prototype, "auto_login", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "picture", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.IsString)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], CreateUserDto.prototype, "roles", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNotEmptyObject)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => address_dto_1.default),
    tslib_1.__metadata("design:type", address_dto_1.default)
], CreateUserDto.prototype, "address", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_transformer_1.Type)(() => mongoose_1.Schema.Types.ObjectId),
    tslib_1.__metadata("design:type", Array)
], CreateUserDto.prototype, "recipe_id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_transformer_1.Type)(() => mongoose_1.Schema.Types.ObjectId),
    tslib_1.__metadata("design:type", Array)
], CreateUserDto.prototype, "post_id", void 0);
//# sourceMappingURL=user.dto.js.map
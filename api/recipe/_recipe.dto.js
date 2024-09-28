"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const mongoose_1 = require("mongoose");
class CreateRecipeDto {
    _id;
    recipeName;
    imageURL;
    description;
    ingredients;
    user_id;
}
exports.default = CreateRecipeDto;
tslib_1.__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", mongoose_1.Schema.Types.ObjectId)
], CreateRecipeDto.prototype, "_id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateRecipeDto.prototype, "recipeName", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateRecipeDto.prototype, "imageURL", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateRecipeDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    tslib_1.__metadata("design:type", Array)
], CreateRecipeDto.prototype, "ingredients", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_transformer_1.Type)(() => mongoose_1.Schema.Types.ObjectId),
    tslib_1.__metadata("design:type", Array)
], CreateRecipeDto.prototype, "user_id", void 0);
//# sourceMappingURL=_recipe.dto.js.map
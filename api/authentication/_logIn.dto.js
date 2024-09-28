"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-unused-vars */
const class_validator_1 = require("class-validator");
/**
 * @openapi
 * components:
 *  schemas:
 *    LoginData:
 *      properties:
 *        email:
 *          type: string
 *          description: 'A felhasználó e-mail címe'
 *          example: 'student001@jedlik.eu'
 *        password:
 *          type: string
 *          description: 'A felhasználó jelszava'
 *          example: 'student01'
 *
 */
class LogInDto {
    email;
    password;
}
exports.default = LogInDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], LogInDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], LogInDto.prototype, "password", void 0);
//# sourceMappingURL=_logIn.dto.js.map
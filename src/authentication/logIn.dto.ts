/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsString } from "class-validator";

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
 *          example: 'nem mondom el senkinek'
 *
 */
export default class LogInDto {
    @IsString()
    public email: string;

    @IsString()
    public password: string;
}

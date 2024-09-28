"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchConstraint = exports.Match = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
function Match(property, validationOptions) {
    return (object, propertyName) => {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: MatchConstraint,
        });
    };
}
exports.Match = Match;
let MatchConstraint = class MatchConstraint {
    validate(value, args) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = args.object[relatedPropertyName];
        return value === relatedValue;
    }
};
exports.MatchConstraint = MatchConstraint;
exports.MatchConstraint = MatchConstraint = tslib_1.__decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: "Match" })
], MatchConstraint);
//# sourceMappingURL=_match.decorator.js.map
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "CustomMatchPasswords", async: false })
export class CustomMatchPasswords implements ValidatorConstraintInterface {
  validate(
    password: string,
    validationArguments?: ValidationArguments
  ): boolean | Promise<boolean> {
    if (
      password !==
      (validationArguments.object as any)[validationArguments.constraints[0]]
    )
      return false;

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return "Password's don't tMatch";
  }
}

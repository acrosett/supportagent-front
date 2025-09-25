import { IsObject, IsEmail } from "class-validator";
import { User } from "../../../../user/user.entity";

export class UpdateCustomerInvoiceEmailDto {

    @IsEmail()
    email: string;

}

//used by super-client, update me here
export type UpdateCustomerInvoiceEmailReturnDto = string;
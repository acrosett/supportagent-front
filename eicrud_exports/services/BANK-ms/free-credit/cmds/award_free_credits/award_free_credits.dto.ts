import { IsString, IsObject } from "class-validator";
import { User } from "../../../../user/user.entity";


export class AwardFreeCreditsDto {

    @IsObject()
    user: User;

    @IsString()
    reason: string; // e.g., 'email_verification', 'account_creation', etc.

}

//used by super-client, update me here
export type AwardFreeCreditsReturnDto = void;
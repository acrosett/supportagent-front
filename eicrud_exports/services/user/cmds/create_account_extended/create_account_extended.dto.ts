import { IsString, IsOptional, Equals, IsBoolean, IsEmail, IsIn, MinLength } from "class-validator";
import type { RoleType } from "../../../../eicrud.roles";


export class CreateAccountExtendedDto {

    @IsOptional()
    @IsBoolean()
    logMeIn?: boolean;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    role: RoleType;

    @Equals(true)
    acceptedEula: boolean;

    @IsBoolean()
    acceptedMarketing: boolean;

}

//used by super-client, update me here
export type CreateAccountExtendedReturnDto= {
    userId: string;
    accessToken?: string;
}
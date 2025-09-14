import { LoginResponseDto } from "@eicrud/shared/interfaces";
import { IsString, IsOptional } from "class-validator";


export class CheckJwtExtendedDto {

    @IsString()
    @IsOptional()
    myArg?: string;

}

//used by super-client, update me here
export type CheckJwtExtendedReturnDto = {
    base: Partial<LoginResponseDto>
    productId: string;
    userRole: string;
};
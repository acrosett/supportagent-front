import { IsString, IsOptional, isBoolean, IsBoolean } from "class-validator";


export class DeleteAccountDto {

    @IsBoolean()
    delete: boolean;

}

//used by super-client, update me here
export type DeleteAccountReturnDto = boolean;
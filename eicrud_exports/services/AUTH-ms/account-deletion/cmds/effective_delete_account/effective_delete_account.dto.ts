import { IsString, IsOptional } from "class-validator";


export class EffectiveDeleteAccountDto {

    @IsString()
    productId: string;

    @IsString()
    reason: string;

}

//used by super-client, update me here
export type EffectiveDeleteAccountReturnDto = string;
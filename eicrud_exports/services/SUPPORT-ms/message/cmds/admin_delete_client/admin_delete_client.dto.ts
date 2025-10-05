import { IsString, IsOptional } from "class-validator";


export class AdminDeleteClientDto {

    @IsString()
    productId: string;

    @IsString()
    clientUniqueId: string;

}

//used by super-client, update me here
export type AdminDeleteClientReturnDto = string;
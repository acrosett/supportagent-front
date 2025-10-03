import { IsString } from "class-validator";


export class DeleteClientDto {

    @IsString()
    productId: string;

    @IsString()
    clientUniqueId: string;

    @IsString()
    sharedSecret: string;

}

//used by super-client, update me here
export type DeleteClientReturnDto = string;
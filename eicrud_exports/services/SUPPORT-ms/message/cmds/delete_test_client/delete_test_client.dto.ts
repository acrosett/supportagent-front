import { IsString } from "class-validator";


export class DeleteTestClientDto {

    @IsString()
    id: string;

    @IsString()
    product: string;

}

//used by super-client, update me here
export type DeleteTestClientReturnDto = string;
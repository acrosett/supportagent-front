import { IsString, IsOptional } from "class-validator";


export class DigestFileDto {

    @IsString()
    fileText: string;

    @IsString()
    productId: string;

}

//used by super-client, update me here
export type DigestFileReturnDto = string;
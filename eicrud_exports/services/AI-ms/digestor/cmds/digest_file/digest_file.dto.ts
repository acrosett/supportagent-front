import { IsString, IsOptional, MinLength } from "class-validator";
import { FILE_MAX_SIZE } from "../../shared.utils";


export class DigestFileDto {

    @IsString()
    @MinLength(10)
    fileText: string;

    @IsString()
    productId: string;

}

//used by super-client, update me here
export type DigestFileReturnDto = string;
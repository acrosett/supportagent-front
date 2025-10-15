import { IsString, IsOptional } from "class-validator";


export class DeleteCacheDto {

    @IsString()
    product: string;

}

//used by super-client, update me here
export type DeleteCacheReturnDto = string;
import { IsString, IsOptional, IsInt } from "class-validator";
//


export class CacheMessageDto {

    @IsString()
    content: string;

    @IsString()
    replyTo: string; // Message ID to get the question from

    @IsString()
    @IsOptional()
    cacheReasoning?: string;

    @IsInt()
    cacheFor: number; // Duration in minutes for expiration

    @IsString({ each: true })
    @IsOptional()
    followUps?: string[];

    // toolContext will be passed but not validated (it's not a serialized field)
    //

}

//used by super-client, update me here
export type CacheMessageReturnDto = string;
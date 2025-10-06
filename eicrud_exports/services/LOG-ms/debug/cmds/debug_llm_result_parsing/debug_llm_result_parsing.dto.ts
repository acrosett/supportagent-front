import { IsString, IsOptional } from "class-validator";


export class DebugLlmResultParsingDto {

    @IsString()
    @IsOptional()
    trainingLogId: string;

}

//used by super-client, update me here
export type DebugLlmResultParsingReturnDto = string;
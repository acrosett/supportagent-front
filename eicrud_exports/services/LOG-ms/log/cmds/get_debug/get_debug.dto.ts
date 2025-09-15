import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class GetDebugDto {
    // No parameters needed
    @IsString()
    @IsOptional()
    myArg?: string;
}

export class GetDebugReturnDto {

    debugEnabled: boolean;
}
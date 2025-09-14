import { IsString, IsOptional } from 'class-validator';

export class GetDebugDto {
    // No parameters needed
}

export class GetDebugReturnDto {
    debugEnabled: boolean;
}
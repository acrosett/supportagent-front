import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class SetDebugDto {
    @IsBoolean()
    enableDebug: boolean;
}

export class SetDebugReturnDto {
    success: boolean;
}
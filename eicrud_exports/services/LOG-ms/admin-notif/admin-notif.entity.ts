import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsDate } from "class-validator";
import { LogType } from "../log/log.entity";

export enum NotificationStatus {
    PENDING = 'PENDING',
    SENT = 'SENT',
    FAILED = 'FAILED'
}

export class AdminNotif {

    @IsString()
    @IsOptional()
    id: string;

    @IsDate()
    startDate: Date; // Start of the 15-minute bucket

    @IsNumber()
    debug: number = 0;

    @IsNumber()
    info: number = 0;

    @IsNumber()
    warning: number = 0;

    @IsNumber()
    error: number = 0;

    @IsNumber()
    security: number = 0;

    @IsNumber()
    critical: number = 0;

    createdAt: Date;

    updatedAt: Date;

}
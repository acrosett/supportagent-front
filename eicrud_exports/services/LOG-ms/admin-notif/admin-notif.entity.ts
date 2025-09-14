import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean } from "class-validator";
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

    createdAt: Date;

    updatedAt: Date;

}
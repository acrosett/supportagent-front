import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsDate } from "class-validator";

export enum LogType {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SECURITY = 'SECURITY',
  CRITICAL = 'CRITICAL',
}

export class Log {

    @IsString()
    @IsOptional()
    id: string;

    type: LogType = LogType.INFO;

    @IsString()
    message: string;

    @IsString()
    ip: string;

    @IsString()
    currentMs: string;

    @IsString()
    data: string;

    @IsString()
    query: string;

    @IsString()
    options: string;

    @IsString()
    serviceName: string;

    @IsString()
    @IsOptional()
    cmdName?: string;

    @IsString()
    userId: string;
 
    @IsString()
    productId: string;

    @IsBoolean()
    failNotif = false;

    createdAt: Date;

    updatedAt: Date;

    @IsNumber()
    level: number;

    @IsOptional()
    @IsDate()
    expireAt?: Date;

}
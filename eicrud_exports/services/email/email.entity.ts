import { IsString, IsOptional, IsNumber, IsBoolean, Min } from "class-validator";


export class Email {

    id: string;

    hashedEmail: string;

    spamReportedCount: number = 0;

    gotFreeCredits: boolean = false;

    createdAt: Date;

    updatedAt: Date;

}
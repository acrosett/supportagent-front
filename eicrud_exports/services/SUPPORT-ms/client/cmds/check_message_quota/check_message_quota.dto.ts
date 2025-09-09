import { IsObject } from "class-validator";
import { Client } from "../../client.entity";

export class CheckMessageQuotaDto {

    @IsObject()
    client: Client;

}

export interface CheckMessageQuotaReturnDto {
    canSendMessage: boolean;
    dailyLimitExceeded: boolean;
    weeklyLimitExceeded: boolean;
    globalDailyLimitExceeded: boolean;
    globalWeeklyLimitExceeded: boolean;
    clientMessagesToday: number;
    clientMessagesThisWeek: number;
    configMessagesToday: number;
    configMessagesThisWeek: number;
    dailyLimit: number;
    weeklyLimit: number;
    globalDailyLimit: number;
    globalWeeklyLimit: number;
}
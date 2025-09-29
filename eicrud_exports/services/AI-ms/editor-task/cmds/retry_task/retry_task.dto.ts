import { IsString } from "class-validator";


export class RetryTaskDto {

    @IsString()
    taskId: string;

    @IsString()
    productId: string;

}

//used by super-client, update me here
export type RetryTaskReturnDto = string;
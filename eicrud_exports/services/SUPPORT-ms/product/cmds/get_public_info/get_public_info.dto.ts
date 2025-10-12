import { IsString, IsOptional } from "class-validator";
import { AiModelType } from "../../../../BANK-ms/spend/cmds/shared.utils";


export class GetPublicInfoDto {

    @IsString()
    productId: string;

    @IsString()
    @IsOptional()
    identifier: string;

}

//used by super-client, update me here
export type GetPublicInfoReturnDto = {
    productName: string;
    chatOn: boolean;
    quotasExceeded: boolean;
    productDeleted: boolean;
};
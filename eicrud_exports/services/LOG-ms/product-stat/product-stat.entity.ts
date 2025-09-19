import { IsString, IsOptional, IsNumber, IsDate, IsEnum } from "class-validator";
import { Product } from "../../SUPPORT-ms/product/product.entity";
import { User } from "../../user/user.entity";
import { ClientPriority } from "../../SUPPORT-ms/client/client.entity";

export class ProductStat {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    product: Product | string;

    @IsString()
    owner: User | string;

    @IsDate()
    startDate: Date;

    @IsNumber()
    messageCount: number = 0;

    @IsNumber()
    customToolUsedCount: number = 0;

    @IsEnum(ClientPriority)
    clientPriority: ClientPriority;

    createdAt: Date;

    updatedAt: Date;

}
import { IsString, IsOptional, IsEnum } from "class-validator";
import { Spend } from "../../BANK-ms/spend/spend.entity";
import { Product } from "../../SUPPORT-ms/product/product.entity";
import { User } from "../../user/user.entity";

export enum DigestorStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export class Digestor {

    @IsString()
    @IsOptional()
    id: string;

    @IsEnum(DigestorStatus)
    status: DigestorStatus;

    @IsOptional()
    spend?: Spend;

    initiator: User;

    product: Product;

    createdAt: Date;

    updatedAt: Date;

}
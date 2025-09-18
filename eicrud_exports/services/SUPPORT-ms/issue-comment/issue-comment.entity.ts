import { IsString, IsOptional, IsEnum } from "class-validator";
import { User } from "../../user/user.entity";
import { Issue } from "../issue/issue.entity";
import { Product } from "../product/product.entity";

export enum CommentFrom {
  AGENT = 'agent',
  STAFF = 'staff'
}


export class IssueComment {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    content: string;

    @IsString()
    issue: Issue | string;

    @IsEnum(CommentFrom)
    from: CommentFrom;

    @IsString()
    product: Product | string;

    @IsString()
    @IsOptional()
    identifier: string;

    createdAt: Date;

    updatedAt: Date;

}
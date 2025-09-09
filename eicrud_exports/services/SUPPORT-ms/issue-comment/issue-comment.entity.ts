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

    owner: User | string;

    @IsString()
    content: string;

    issue: Issue;

    @IsEnum(CommentFrom)
    from: CommentFrom;

    product: Product;

    @IsString()
    @IsOptional()
    identifier: string;

    createdAt: Date;

    updatedAt: Date;

}
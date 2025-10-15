import { Product } from "../product/product.entity";


export class CachedResponse {

    id: string;

    content: string;

    question: string;

    product: Product | string;

    cacheReasoning?: string;

    followUps?: string[];

    expiresAt: Date;

    createdAt: Date;

    updatedAt: Date;

}
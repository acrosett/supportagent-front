import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { ProductStat } from "./product-stat.entity";


export class ProductStatClient extends CrudClient<ProductStat> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'product-stat'});
  }
  // GENERATED START
}
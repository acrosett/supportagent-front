import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Product } from "./product.entity";


export class ProductClient extends CrudClient<Product> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'product'});
  }
  // GENERATED START
}
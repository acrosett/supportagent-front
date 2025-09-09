import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { ProductVault } from "./product-vault.entity";


export class ProductVaultClient extends CrudClient<ProductVault> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'product-vault'});
  }
  // GENERATED START
}
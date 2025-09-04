import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Spend } from "./spend.entity";


export class SpendClient extends CrudClient<Spend> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'spend'});
  }
  // GENERATED START
}
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Client } from "./client.entity";


export class ClientClient extends CrudClient<Client> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'client'});
  }
  // GENERATED START
}
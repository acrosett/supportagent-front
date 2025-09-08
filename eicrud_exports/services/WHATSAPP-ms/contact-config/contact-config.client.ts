import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { ContactConfig } from "./contact-config.entity";


export class ContactConfigClient extends CrudClient<ContactConfig> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'contact-config'});
  }
  // GENERATED START
}
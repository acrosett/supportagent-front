import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { WhatsappMessage } from "./whatsapp-message.entity";


export class WhatsappMessageClient extends CrudClient<WhatsappMessage> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'whatsapp-message'});
  }
  // GENERATED START
}
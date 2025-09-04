import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { WhatsappAgent } from "./whatsapp-agent.entity";


export class WhatsappAgentClient extends CrudClient<WhatsappAgent> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'whatsapp-agent'});
  }
  // GENERATED START
}
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { AgentMessage } from "./agent-message.entity";


export class AgentMessageClient extends CrudClient<AgentMessage> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'agent-message'});
  }
  // GENERATED START
}
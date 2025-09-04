import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { ChatAgent } from "./chat-agent.entity";


export class ChatAgentClient extends CrudClient<ChatAgent> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'chat-agent'});
  }
  // GENERATED START
}
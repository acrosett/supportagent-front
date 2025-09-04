import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { EditorAgent } from "./editor-agent.entity";


export class EditorAgentClient extends CrudClient<EditorAgent> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'editor-agent'});
  }
  // GENERATED START
}
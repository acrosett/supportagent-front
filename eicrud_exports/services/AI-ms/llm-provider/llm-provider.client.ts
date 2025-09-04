import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { LlmProvider } from "./llm-provider.entity";


export class LlmProviderClient extends CrudClient<LlmProvider> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'llm-provider'});
  }
  // GENERATED START
}
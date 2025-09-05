import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { LlmTrainingData } from "./llm-training-data.entity";


export class LlmTrainingDataClient extends CrudClient<LlmTrainingData> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'llm-training-data'});
  }
  // GENERATED START
}
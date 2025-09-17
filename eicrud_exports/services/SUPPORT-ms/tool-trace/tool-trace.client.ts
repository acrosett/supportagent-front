import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { ToolTrace } from "./tool-trace.entity";


export class ToolTraceClient extends CrudClient<ToolTrace> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'tool-trace'});
  }
  // GENERATED START
}
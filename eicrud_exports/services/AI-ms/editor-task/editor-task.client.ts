import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { EditorTask } from "./editor-task.entity";


export class EditorTaskClient extends CrudClient<EditorTask> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'editor-task'});
  }
  // GENERATED START
}
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Task } from "./task.entity";


export class TaskClient extends CrudClient<Task> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'task'});
  }
  // GENERATED START
}
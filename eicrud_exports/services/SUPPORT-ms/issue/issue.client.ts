import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Issue } from "./issue.entity";


export class IssueClient extends CrudClient<Issue> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'issue'});
  }
  // GENERATED START
}
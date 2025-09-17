import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { IssueTag } from "./issue-tag.entity";


export class IssueTagClient extends CrudClient<IssueTag> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'issue-tag'});
  }
  // GENERATED START
}
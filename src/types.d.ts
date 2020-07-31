type GPH_code = string;
type GPH_name = string;

interface CSVLink {
  GPH_code: string;
  GPH_name: string;
  end_year: string;
  start_year: string;
  GPH_status: string;
  sovereign_GPH_code: string;
  sovereign_GPH_name: string;  
}

interface WLink {
  readonly id: string;
  readonly GPH_code: GPH_code;
  readonly GPH_name: GPH_name;
  start_year: Date;
  end_year: Date;
  readonly status: Status;
  sovereign: {
    readonly GPH_code: GPH_code;
    readonly GPH_name: GPH_name;
  }
}

interface Link extends WLink {
  readonly sovereign: Entity
}

interface WEntity {
  readonly id: GPH_code;
  readonly name: GPH_name;
  readonly start: Date;
  readonly end: Date;
  // campains: MultiMap<Entity, Link>()
  occupations: {[key: GPH_code]: Link[]};
  campains: {[key: GPH_code]: Link[]};
}

interface Entity extends WEntity {
  readonly campains: MultiMap<Entity, Link>
  readonly occupations: MultiMap<Entity, Link>
  readonly campainsMap: {[key: string]: Link[]}
}

interface Status {
  readonly GPH_status: string,
  readonly slug: string,
  readonly priority: number
}

interface GlobalState {
  readonly links: Link[],
  readonly entities: Entity[],
  readonly status: {[key:string]: Status}
}

declare module 'd3-timeline-chart';
declare module 'ramda';

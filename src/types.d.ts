type COW_code = string;
type COW_name = string;

interface CSVLink {
  COW_code: string;
  COW_name: string;
  end_year: string;
  start_year: string;
  link_type: string;
  sovereign_COW_code: string;
  sovereign_COW_name: string;  
}

interface WLink {
  readonly id: string;
  readonly COW_code: COW_code;
  readonly COW_name: COW_name;
  readonly start_year: Date;
  readonly end_year: Date;
  readonly status: {
    readonly slug: STATUS_SLUG;
    readonly priority: number;
  }
  sovereign: {
    readonly COW_code: COW_code;
    readonly COW_name: COW_name;
  }
}

interface Link extends WLink {
  readonly sovereign: Entity
}

interface WEntity {
  readonly id: COW_code;
  readonly name: COW_name;
  readonly start: Date;
  readonly end: Date;
  // campains: MultiMap<Entity, Link>()
  occupations: {[key: COW_code]: Link[]};
  campains: {[key: COW_code]: Link[]};
}

interface Entity extends WEntity {
  readonly campains: MultiMap<Entity, Link>
  readonly occupations: MultiMap<Entity, Link>
}

interface GlobalState {
  readonly links: Link[],
  readonly entities: Entity[],
}

declare module 'd3-timeline-chart';
declare module 'ramda';

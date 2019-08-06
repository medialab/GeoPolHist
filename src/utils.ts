
export const xCowName = (link: Link) => link.COW_name;
// export const xSovereignCowName = (link: Link) => link.sovereign_COW_name;
// export const xType = (link: Link) => link.link_type === 'Sovereign';
export const translate_link_type: any = {
  "Became part of" : {"slug":"part","priority":2},
  "Became colony of": {"slug":"col","priority":3},
  "Became possession of": {"slug":"poss","priority":3},
  "Claimed by": {"slug":"claim","priority":0},
  "Became protectorate of": {"slug":"prot","priority":3},
  "Became associated state of": {"slug":"assoc","priority":0},
  "Occupied by": {"slug":"occ","priority":1},
  "Leased to": {"slug":"leas","priority":0},
  "Became neutral or demilitarized zone of": {"slug":"neut","priority":0},
  "Mandated to": {"slug":"mand","priority":0},
  "Sovereign": {"slug":"SOV","priority":4},
  "Unincorporated territory": {"slug":"uninc","priority":0},
  "Autonomous constituent country of": {"slug":"autonom","priority":0},
  "Sovereign (unrecognised)": {"slug":"SOV_U","priority":0},
  "Sovereign (limited)": {"slug":"SOV_L","priority":1},
  "Protected area of": {"slug":"protected","priority":0},
  "Unknown": {"slug":"N/A","priority":0},
  "": {"slug": "alliance", "priority": 0}
}

export const translate = (x: number, y: number) => `translate(${x}, ${y})`

export enum STATUS_SLUG {
  part = "part",
  col = "col",
  poss = "poss",
  claim = "claim",
  prot = "prot",
  assoc = "assoc",
  occ = "occ",
  leas = "leas",
  neut = "neut",
  mand = "mand",
  SOV = "SOV",
  uninc = "uninc",
  autonom = "autonom",
  SOV_U = "SOV_U",
  SOV_L = "SOV_L",
  protected = "protected",
  NA = "N/A",
  alliance = "alliance",
}

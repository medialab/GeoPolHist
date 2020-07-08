
export const xCowName = (link: Link) => link.COW_name;
// export const xSovereignCowName = (link: Link) => link.sovereign_COW_name;
// export const xType = (link: Link) => link.link_type === 'Sovereign';
export const translate_link_type: any =  {
  "Dissolved into":  {"slug":"dis","priority":6},
  "Became vassal of": {"slug":"vas","priority":2},
  "Became discovered" : {"slug":"disc","priority":0},
  "Became part of" : {"slug":"part","priority":0},
  "Became colony of": {"slug":"col","priority":3},
  "Became possession of": {"slug":"poss","priority":3},
  "Became dependency of": {"slug":"dep", "priority":3},
  "Claimed by": {"slug":"claim","priority":1},
  "Became protectorate of": {"slug":"prot","priority":3},
  "Became associated state of": {"slug":"assoc","priority":4},
  "Occupied by": {"slug":"occ","priority":2},
  "Leased to": {"slug":"leas","priority":2},
  "Became neutral or demilitarized zone of": {"slug":"neut","priority":1},
  "Mandated to": {"slug":"mand","priority":2},
  "Sovereign": {"slug":"SOV","priority":5},
  "Sovereign (unrecognized)": {"slug":"SOV_U","priority":4},
  "Sovereign (limited)": {"slug":"SOV_L","priority":4},
  "International":  {"slug":"int","priority":-1},
  "Informal":  {"slug":"inf","priority":-1},
  "Unknown": {"slug":"N/A","priority":0},
}

export const translate = (x: number, y: number) => `translate(${x}, ${y})`

export enum STATUS_SLUG {
  disc = "disc",
  dis = "dis",
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
  SOV_U = "SOV_U",
  SOV_L = "SOV_L",
  NA = "N/A",
  alliance = "alliance",
  inf = "informal",
  int = "international",
  dep = "dependency"
}

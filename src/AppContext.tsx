import { csv, DSVRowArray, max, min, values } from "d3";
import { MultiMap } from "mnemonist";
import equals from "ramda/es/equals";
import filter from "ramda/es/filter";
import flatten from "ramda/es/flatten";
import groupBy from "ramda/es/groupBy";
import map from "ramda/es/map";
import mapObjIndexed from "ramda/es/mapObjIndexed";
import pipe from "ramda/es/pipe";
import React, { createContext, useEffect, useReducer } from "react";
import { action, ActionType } from "typesafe-actions";
import uuid from "uuid";

const initialState: GlobalState = {
  links: [],
  entities: [],
  status: {},
};

interface AppContext {
  state: any;
  dispatch: (action: any) => any;
}

export const AppContext = createContext<AppContext>({
  state: initialState,
  dispatch: (arg) => {
    console.log("not la bonne fonction poto", arg);
  },
});

const groupByGPHCode = groupBy((link: Link) => link.GPH_code);

const toMap = (
  object: { [key: string]: Link[] },
  entities: { [key: string]: Entity }
) => {
  const map = new MultiMap<Entity, Link>();
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const links = object[key];
      const entity = entities[key];
      if (entity === undefined) {
        continue;
      }
      for (let index = 0; index < links.length; index++) {
        const link = links[index];
        map.set(entity, link);
      }
    }
  }
  return map;
};

const reducer = (state: GlobalState, action: ActionType<any>) => {
  switch (action.type) {
    case "LOADED": {
      const linkPayload = action.payload[0];
      const statusPayload = action.payload[1];
      const links: WLink[] = linkPayload.map((csvLink: CSVLink) => {
        const l = {
          id: uuid() as string,
          GPH_code: csvLink.GPH_code,
          GPH_name: csvLink.GPH_name,
          continent: csvLink.continent,
          end_year: new Date(csvLink.end_year),
          start_year: new Date(csvLink.start_year),
          status: statusPayload[csvLink.GPH_status],
          sovereign: {
            GPH_code: csvLink.sovereign_GPH_code,
            GPH_name: csvLink.sovereign_GPH_name,
          },
        } as WLink;
        if (!l.status) console.error("unknown link type", csvLink);
        return l;
      });
      const entitiesMap = groupByGPHCode(links);
      const wEntities: { [key: string]: Entity } = mapObjIndexed(
        (ownLinks: Link[], GPH_code: GPH_code) => {
          const selectOccupations = pipe(
            filter((link: WLink) => equals(link.GPH_code, GPH_code)),
            groupBy((link: WLink) => link.sovereign.GPH_code || GPH_code)
          );
          const selectCampains = pipe(
            filter((link: WLink) => equals(link.sovereign.GPH_code, GPH_code)),
            groupByGPHCode
          );
          const occ = selectOccupations(ownLinks);
          const campains = selectCampains(links);
          const capMap = groupBy(
            (link) => link.status.slug,
            flatten(values(campains))
          );
          return {
            id: GPH_code,
            name: entitiesMap[GPH_code][0].GPH_name,
            continent: entitiesMap[GPH_code][0].continent,
            start: min(ownLinks, (d) => d.start_year),
            end: max(ownLinks, (d) => d.end_year),
            occupations: occ,
            campains: campains,
            campainsMap: capMap,
          };
        },
        entitiesMap
      );
      const wMapEntities = map(
        (entity: WEntity) => ({
          ...entity,
          occupations: toMap(entity.occupations, wEntities),
          campains: toMap(entity.campains, wEntities),
        }),
        wEntities
      );
      links.forEach((link: WLink) => {
        link.sovereign = wMapEntities[link.sovereign.GPH_code];
      });
      return {
        links: links as unknown as Link[],
        entities: values(wMapEntities),
        status: statusPayload,
      };
    }
  }
  return state;
};

const loadedActionCreator = (data: DSVRowArray<string>) =>
  action("LOADED", data);

const entitiesStatusPromise = csv(
  "./data/GeoPolHist_entities_status_over_time.csv"
);
const statusPromise = fetch("./data/GPH_status.json").then((response) =>
  response.json()
);
const dataPromise = Promise.all([entitiesStatusPromise, statusPromise]);
const AppContextProvider: React.FC = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState as never);
  useEffect(() => {
    dataPromise.then(pipe(loadedActionCreator, dispatch));
  }, []);
  return (
    <AppContext.Provider value={{ state, dispatch: dispatch }}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;

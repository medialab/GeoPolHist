import React, { useEffect } from 'react';
import { csv, DSVRowArray, max, min, values } from 'd3';
import { useReducer, createContext } from "react";
import { action, ActionType } from 'typesafe-actions';
import uuid from 'uuid';
import { translate_link_type, STATUS_SLUG } from './utils';
import groupBy from 'ramda/es/groupBy';
import flatten from 'ramda/es/flatten';
import map from 'ramda/es/map';
import equals from 'ramda/es/equals';
import filter from 'ramda/es/filter';
import pipe from 'ramda/es/pipe';
import mapObjIndexed from 'ramda/es/mapObjIndexed';
import { MultiMap } from 'mnemonist';

const initialState: GlobalState = {
  links: [],
  entities: [],
}

interface AppContext {
  state: any;
  dispatch: (action: any) => any;
}

export const AppContext = createContext<AppContext>({
  state: initialState,
  dispatch: (arg) => {
    console.log('not la bonne fonction poto', arg);
  }
});

const groupByCOWCode = groupBy((link: Link) => link.COW_code);

const SOV = [STATUS_SLUG.SOV, STATUS_SLUG.SOV_U, STATUS_SLUG.SOV_L]

const toMap = (object: {[key: string]: Link[]}, entities: {[key: string]: Entity}) => {
  const map = new MultiMap<Entity, Link>();
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const links = object[key];
      const entity = entities[key]
      if (entity === undefined) {
        continue
      }
      for (let index = 0; index < links.length; index++) {
        const link = links[index];
        map.set(entity, link);
      }
    }
  }
  return map;
}

const reducer = (state: GlobalState, action: ActionType<any>) => {
  switch (action.type) {
    case 'LOADED': {
      const links: WLink[] = action.payload.map((csvLink: CSVLink) => {
        const l = {
          id: uuid() as string,
          COW_code: csvLink.COW_code,
          COW_name: csvLink.COW_name,
          end_year: new Date(csvLink.end_year),
          start_year: new Date(csvLink.start_year),
          status: translate_link_type[csvLink.link_type],
          sovereign: {
            COW_code: csvLink.sovereign_COW_code,
            COW_name: csvLink.sovereign_COW_name,
          }
        } as WLink
        if (!l.status)
          console.error("unknown link type", csvLink)
        return l;
      });
      const entitiesMap = groupByCOWCode(links);
      const wEntities: {[key: string]: Entity} = mapObjIndexed((ownLinks: Link[], COW_code: COW_code) => {
        const selectOccupations = pipe(
          filter((link: WLink) => equals(link.COW_code, COW_code)),
          // groupByCOWCode,
          groupBy((link: WLink) => link.sovereign.COW_code || COW_code),
        );
        const selectCampains = pipe(
          filter((link: WLink) => equals(link.sovereign.COW_code, COW_code)),
          groupByCOWCode,
        );
        const occ = selectOccupations(ownLinks);
        const campains = selectCampains(links);
        const capMap = groupBy(link => link.status.slug, flatten(values(campains)));
        return {
          id: COW_code,
          name: entitiesMap[COW_code][0].COW_name,
          start: min(ownLinks, d => d.start_year),
          end: max(ownLinks, d => d.end_year),
          occupations: occ,
          campains: campains,
          campainsMap: capMap,
        };
      }, entitiesMap);
      const wMapEntities = map((entity: WEntity) => ({
        ...entity,
        occupations: toMap(entity.occupations, wEntities),
        campains: toMap(entity.campains, wEntities)
      }), wEntities);
      links.forEach((link: WLink) => {
        link.sovereign = wMapEntities[link.sovereign.COW_code];
      });
      return {
        links: links as unknown as Link[],
        entities: values(wMapEntities)
      }
    }
  }
  return state;
}

const loadedActionCreator = (data: DSVRowArray<string>) => action('LOADED', data);

const dataPromise = csv('data/COW_Entities_extended.csv');
const AppContextProvider: React.FC = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState as never);
  useEffect(() => {
    dataPromise.then(pipe(loadedActionCreator, dispatch));
  }, []);
  return (
    <AppContext.Provider value={{state, dispatch: dispatch}}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContextProvider;

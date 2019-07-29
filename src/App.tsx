import React, { useEffect, useReducer, useCallback } from 'react';
import { csv } from 'd3';
import { map, set, lensProp, filter } from 'ramda';
import { action } from 'typesafe-actions';
import uniqBy from 'ramda/es/uniqBy';

import './App.css';
import Select from 'react-select';

interface AppState {
  countries: any[];
}
const initialState = {
  countries: []
}
interface Link {
  COW_code: number;
  COW_name: string;
  end_year: Date;
  start_year: Date;
  link_type: string;
  sovereign_COW_code: number;
}
const onDataLoadedAction = (data: Link[]) => action('DATA_LOADED', data);
function onFirstLoad (dispatch: React.Dispatch<any>) {
  return () => {
    csv('/data/RICentities_links.csv')
      .then((res) => {
        dispatch(onDataLoadedAction(
          map((rawRow: any) => ({
            ...rawRow,
            COW_code: +rawRow.COW_code,
            end_year: new Date(rawRow.end_year),
            start_year: new Date(rawRow.start_year),
            sovereign_COW_code: +rawRow.sovereign_COW_code
          }), res)
        ));
    });
  }
}
const xCountries = lensProp('countries');
const xCowName = (link: Link) => link.COW_name;
const xType = (link: Link) => link.link_type === 'Sovereign';
const reducer: React.Reducer<AppState, any> = (state, action) => {
  switch (action.type) {
    case 'DATA_LOADED':
      // On first load, we only propose countries that has a 'Sovereign' link type.
      return set(
        xCountries,
        uniqBy(
          xCowName,
          filter(xType, action.payload)
        ),
        state
      )
  }
  return state;
}
function countryToOption (country: Link) {
  return {
    value: country.COW_code,
    label: country.COW_name,
  }
}
const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  console.log(state.countries);
  useEffect(onFirstLoad(dispatch), []);
  const onChange = useCallback((event) => {
    console.log('onChange', event);
  }, []);
  return (
    <div className="App">
      <Select onChange={onChange} options={map(countryToOption, state.countries)} />
    </div>
  );
}

export default App;

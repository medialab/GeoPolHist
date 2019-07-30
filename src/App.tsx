import React, { useCallback, Suspense } from 'react';
import { csv } from 'd3';
import { map, filter } from 'ramda';
import { mount, route } from 'navi';
import { Router, View, useNavigation, useCurrentRoute } from 'react-navi';
import uniqBy from 'ramda/es/uniqBy';

import './App.css';
import Select from 'react-select';
import Country from './Country';
import { xCowName, xType } from './utils';

function onFirstLoad () {
  return csv('/data/RICentities_links.csv')
    .then((res) => map((rawRow: any) => ({
      ...rawRow,
      COW_code: +rawRow.COW_code,
      end_year: new Date(rawRow.end_year),
      start_year: new Date(rawRow.start_year),
      sovereign_COW_code: +rawRow.sovereign_COW_code
    }), res)
  );
}
const dataPromise = onFirstLoad();

const countriesToOptions = map((country: Link) => ({
  value: country.COW_code, label: country.COW_name,
}));

const Home: React.FC = () => {
  const navigation = useNavigation();
  const state = useCurrentRoute();
  const onChange = useCallback((event) => {
    navigation.navigate(`/country/${event.value}`);
  }, [navigation]);
  return (
    <Select
      onChange={onChange}
      options={countriesToOptions(state.data.data)}
    />
  );
}

const routes = mount({
  '/': route({
    title: 'Welcome',
    view: <Home />,
    getData: () => dataPromise.then(res => {
      return {
        data: uniqBy(
          xCowName,
          filter(xType, res)
        )
      }
    }),
  }),
  '/country/:id': route(async req => {
    let data = await dataPromise;
    const mapWocToName = new Map();
    data.forEach((link) => {
      mapWocToName.set(link.COW_code, link.COW_name);
    });
    data = data.map(link => ({
      ...link,
      sovereign_COW_name: mapWocToName.get(link.sovereign_COW_code)
    }));
    return {
      title: 'Coutry',
      view: <Country id={+req.params.id} data={data} />,
    }
  })
});

const App: React.FC = () => {
  return (
    <div className="App">
      <Router routes={routes}>
        <Suspense fallback={null}>
          <View />
        </Suspense>
      </Router>
    </div>
  );
}

export default App;

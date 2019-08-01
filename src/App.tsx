import React, { useCallback, Suspense, useContext } from 'react';
import { map } from 'ramda';
import { mount, route } from 'navi';
import { Router, View, useNavigation} from 'react-navi';
import Select from 'react-select';

import './App.css';
import Country from './Country';
import AppContextProvider, { AppContext } from './AppContext';

const countriesToOptions = map((country: Entity) => ({
  value: country.id, label: country.name,
}));

const Home: React.FC = () => {
  const navigation = useNavigation();
  const { state }: {state: GlobalState} = useContext(AppContext);
  const onChange = useCallback((event) => {
    navigation.navigate(`/country/${event.value}`);
  }, [navigation]);
  return (
    <Select
      onChange={onChange}
      options={countriesToOptions(state.entities)}
    />
  );
}

const routes = mount({
  '/': route({
    title: 'Welcome',
    view: <Home />,
  }),
  '/country/:id': route(async req => {
    return {
      title: 'Coutry',
      view: <Country id={req.params.id} />,
    }
  })
});

const App: React.FC = () => {
  return (
    <div className="App">
      <AppContextProvider>
        <Router routes={routes}>
          <Suspense fallback={null}>
            <View />
          </Suspense>
        </Router>
      </AppContextProvider>
    </div>
  );
}

export default App;

import React, { useCallback, useContext } from 'react';
import { map } from 'ramda';
import { HashRouter as Router, Route } from "react-router-dom";
import Select from 'react-select';

import './App.css';
import Country from './Country';
import AppContextProvider, { AppContext } from './AppContext';
import { RouterProps } from 'react-router';
// import createMemoryHistory from 'history/createMemoryHistory';

const countriesToOptions = map((country: Entity) => ({
  value: country.id, label: country.name,
}));

const Home: React.FC<RouterProps> = (props) => {
  console.log(props);
  const { state }: {state: GlobalState} = useContext(AppContext);
  const onChange = useCallback((event) => {
    props.history.push(`/country/${event.value}`);
  }, [props.history]);
  return (
    <Select
      onChange={onChange}
      options={countriesToOptions(state.entities)}
    />
  );
}

const App: React.FC = () => {
  return (
    <div className="App">
      <AppContextProvider>
        <Router basename={process.env.NODE_ENV === 'production' ? '/ric_entities_timelines' : '/'}>
          <Route path='/' exact component={Home} />
          <Route path='/country/:id' component={Country} />
        </Router>
      </AppContextProvider>
    </div>
  );
}

export default App;

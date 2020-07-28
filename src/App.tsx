import React, { useCallback, useContext } from 'react';
import { map } from 'ramda';
import { HashRouter as Router, Route, Link } from "react-router-dom";
import Select from 'react-select';
import sort from 'ramda/es/sort';
import take from 'ramda/es/take';
import values from 'ramda/es/values';
import pathOr from 'ramda/es/pathOr';

import './App.css';
import Country from './Country';
import AppContextProvider, { AppContext } from './AppContext';
import { RouterProps } from 'react-router';

const countriesToOptions = map((country: Entity) => ({
  value: country.id, label: country.name,
}));

const sortByBiggestEmpire = sort((entityA: Entity, entityB: Entity) =>
  entityB.campains.size - entityA.campains.size
)

const sortByOccupation = sort((a: Entity, b: Entity) =>
  b.occupations.size - a.occupations.size
)

const getCol = pathOr(0, ['campainsMap', 'col', 'length'])

const sortByColonyNumber = sort((a: Entity, b: Entity) => 
  getCol(b) - getCol(a)
)

const takeTop5 = take(5)

const Examples: React.FC<{entities: Entity[]}> = (props) => {
  const orderByBiggest: Entity[] = takeTop5(sortByBiggestEmpire(props.entities));
  const mostOccupied: Entity[] = takeTop5(sortByOccupation(props.entities));
  const mostCollonies: Entity[] = takeTop5(sortByColonyNumber(props.entities));

  const {state}: {state: GlobalState} = useContext(AppContext);
  return (
    <div>
      <h2>Some examples:</h2>
      <div className='line'>
        <div className='grow'>
          <h3>Most aggresive empires:</h3>
          <ol>
            {orderByBiggest.map(entity =>
              <li key={entity.id}><Link to={`/country/${entity.id}`}>{entity.name}</Link></li>
            )}
          </ol>
        </div>
        <div className='grow'>
          <h3>Occupied by most different countries:</h3>
          <ol>
            {mostOccupied.map(entity =>
              <li key={entity.id}><Link to={`/country/${entity.id}`}>{entity.name}</Link></li>
            )}
          </ol>
        </div>
        <div className='grow'>
          <h3>Most colonies:</h3>
          <ol>
            {mostCollonies.map(entity =>
              <li key={entity.id}><Link to={`/country/${entity.id}`}>{entity.name}</Link></li>
            )}
          </ol>
        </div>
      </div>
      <h3>Countries by status</h3>
      <div className='line'>
        {values(state.status).map(status => {
          const getNb = pathOr(0, ['campainsMap', status.slug, 'length']);
          const sortByStatus = sort((a, b) => getNb(b) - getNb(a));
          return (
            <div key={status.slug} className='grow'>
              <h3>counties with most {status.GPH_status}:</h3>
              <ol>
                {takeTop5(sortByStatus(props.entities)).map(entity => {
                  return <li key={entity.id}><Link to={`/country/${entity.id}`}>{entity.name}</Link></li>
                })}
              </ol>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const Home: React.FC<RouterProps> = (props) => {
  const { state }: {state: GlobalState} = useContext(AppContext);
  const onChange = useCallback((event) => {
    props.history.push(`/country/${event.value}`);
  }, [props.history]);
  return (
    <div className='container container--home'>
      <h1>Welcome</h1>
      <h3>To the correlates of war time series explorer</h3>
      <p>Type a country or a territorial name in the above text input :</p>
      <Select
        placeholder={state.entities.length ? 'Type in' : 'Still loading'}
        onChange={onChange}
        options={countriesToOptions(state.entities)}
      />
      {state.entities.length ? <Examples entities={state.entities} /> : <p>Data is still loading...</p>}
    </div>
  );
}

const App: React.FC = () => {
  return (
    <div className="App">
      <AppContextProvider>
        <Router basename={process.env.NODE_ENV === 'production' ? '/GeoPolHist' : '/'}>
          <Route path='/' exact component={Home} />
          <Route path='/country/:id' component={Country} />
        </Router>
      </AppContextProvider>
    </div>
  );
}

export default App;

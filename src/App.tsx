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

const filterSortByDis = (entities: Entity[]) => {
  const sortByOccEndDate = sort((a: WLink, b: WLink) =>
    b.end_year > a.end_year
  )
  const sortByEndDate = sort((a: Entity, b: Entity) =>
    b.end > a.end
  )
  return sortByEndDate(entities.filter(e => sortByOccEndDate([...e.occupations.values()])[0].status.slug === 'dis'))
}



const takeTop5 = take(5)

const Examples: React.FC<{entities: Entity[]}> = (props) => {
  const orderByBiggest: Entity[] = takeTop5(sortByBiggestEmpire(props.entities));
  const mostOccupied: Entity[] = takeTop5(sortByOccupation(props.entities));
  const mostCollonies: Entity[] = takeTop5(sortByColonyNumber(props.entities));
  const disapeared: Entity[] = takeTop5(filterSortByDis(props.entities))

  const {state}: {state: GlobalState} = useContext(AppContext);
  const yearFormat = new Intl.DateTimeFormat('en-GB', {year:'numeric'})
  return (
    <div>
      
      <div className='line'>
        <div className='grow'>
          <h3>Biggest number of sovereigns</h3>
          <ol>
            {mostOccupied.map(entity =>
              <li key={entity.id}><Link to={`/country/${entity.id}`}>{entity.name} - {entity.occupations.size} sovereigns</Link></li>
            )}
          </ol>
        </div>
        <div className='grow'>
          <h3>Biggest number of colonies</h3>
          <ol>
            {mostCollonies.map(entity =>
              <li key={entity.id}><Link to={`/country/${entity.id}`}>{entity.name} - {getCol(entity)} colonies</Link></li>
            )}
          </ol>
        </div>
        <div className='grow'>
          <h3>Most recently disolved</h3>
          <ol>
            {disapeared.map(entity =>
              <li key={entity.id}><Link to={`/country/${entity.id}`}>{entity.name} - {yearFormat.format(entity.end)}</Link></li>
            )}
          </ol>
        </div>
      </div>
      {/* <h3>Countries by status</h3>
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
      </div> */}
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
      <h1>GeoPolHist<br></br>
      Geo-Political entities History from 1816 to 2020</h1>
      <p>Paragraph about the data set.</p>
      <h2>Visualise a Geo-Political entities political history</h2>
      <Select
        placeholder={state.entities.length ? 'Search for a Geo-Political entity' : 'Still loading'}
        onChange={onChange}
        options={countriesToOptions(state.entities)}
      />
      {state.entities.length ? <Examples entities={state.entities} /> : <p>Data is still loading...</p>}
      <h2>References</h2>
      <p>See our data paper for more information about how and why we built this data set:</p>
      <p>Dedinger Béatrice, Girard Paul, "GeoPolHist, a new data set of the geo-political entities of the world (1816-2020)" 2020 (in review)</p>
      <p>Download the data set from <a href="https://github.com/medialab/GeoPolHist">GeoPolHist datapackage repository</a></p>
      <iframe src="./sankey.html"></iframe>
      <p><a href="./sankey.html">open the diagram in full page</a></p>
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

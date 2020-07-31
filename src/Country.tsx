import React, { useContext, useCallback, useMemo } from 'react';
import sort from 'ramda/es/sort';

import equals from 'ramda/es/equals';
import { AppContext } from './AppContext';
import Timelines from './timeline';
import { Link as RLink, RouteComponentProps } from 'react-router-dom';
import { min, max, scaleTime, scaleOrdinal } from 'd3';

const dateReducer = (accumulator, link: Link) => accumulator + (+link.end_year) - +link.start_year
const sortByDuration = sort(([, aLinks], [, bLinks]) => bLinks.reduce(dateReducer, 0) - aLinks.reduce(dateReducer, 0));

const Country: React.FC<{
  id: string,
  country: Entity,
} & RouteComponentProps<{
  id: string
}>> = (props) => {
  const {history, country} = props;
  const onEntityClick = useCallback(GPH_code => {
    history.push(`/country/${GPH_code}`);
  }, [history]);
  const occupations: [Entity, Link[]][] = Array.from(country.occupations.associations());
  const campains: [Entity, Link[]][] = Array.from(country.campains.associations());
  const data: [Entity, Link[]][] = useMemo(() => sortByDuration([
    ...occupations,
    ...campains,
  ]), [occupations, campains]);
  const minDate = min(data, ([{start}]) => start);
  const maxDate = max(data, ([{end}]) => end);
  const xScale = scaleTime().domain([minDate, maxDate]);
  // color scale generated thanks to @jacomyma tools iwanthue
  const {state}: {state: GlobalState} = useContext(AppContext);
  const colorScale = scaleOrdinal(["#cd7f3d",
  "#af49d8",
  "#65da57",
  "#d84397",
  "#cbe240",
  "#6c6cd4",
  "#a3ca63",
  "#ad63ab",
  "#489046",
  "#d74433",
  "#6cdaaf",
  "#c15b67",
  "#86c5d8",
  "#d8b94f",
  "#6779a8",
  "#787938",
  "#d4a8cc",
  "#4f8178",
  "#cdcea7",
  "#997462"]).domain(Object.keys(state.status).map(s => state.status[s].slug));
  return (
    <div>
      <aside>
        <RLink to='/'>GeoPolHist</RLink>
      </aside>
      <h1>{country.name}</h1>
      <p>GPH_code : {country.id}</p>
      <h2>Status</h2>
      <Timelines
        onEntityClick={onEntityClick}
        intervalMinWidth={5}
        data={occupations}
        nbLines={country.occupations.dimension}
        lineHeight={20}
        width={1000}
        xScale={xScale}
        colorScale={colorScale}
      />
      {/* <Histogram width={1000} height={300} data={Array.from(country.campains.values())} /> */}
      <h2>Sovereign of {country.campains.dimension} entities</h2>
      <Timelines
        onEntityClick={onEntityClick}
        intervalMinWidth={5}
        data={campains}
        nbLines={country.campains.dimension}
        lineHeight={20}
        width={1000}
        xScale={xScale}
        colorScale={colorScale}
      />
    </div>
  );
}

const Loader = (props) => {
  const id = props.match.params.id;
  const {state}: {state: GlobalState} = useContext(AppContext);
  const country = state.entities.find(entity => equals(entity.id, id));
  if (country === undefined) {
    return (<div>Loading</div>);
  }
  return <Country {...props} country={country} />
}

export default Loader;

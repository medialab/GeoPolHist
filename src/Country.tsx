import React, { useContext, useCallback, useMemo } from 'react';
import sort from 'ramda/es/sort';

import equals from 'ramda/es/equals';
import { AppContext } from './AppContext';
import Timelines from './timeline';
import { Link as RLink, RouteComponentProps } from 'react-router-dom';
import { min, max, scaleTime } from 'd3';

const dateReducer = (accumulator, link: Link) => accumulator + (+link.end_year) - +link.start_year
const sortByDuration = sort(([, aLinks], [, bLinks]) => bLinks.reduce(dateReducer, 0) - aLinks.reduce(dateReducer, 0));

const Country: React.FC<{
  id: string,
  country: Entity,
} & RouteComponentProps<{
  id: string
}>> = (props) => {
  const {history, country} = props;
  const onOccupiedLinkClick = useCallback(link => {
    history.push(`/country/${link.sovereign.id}`);
  }, [history]);
  const onCampainsLinkClick = useCallback(link => {
    history.push(`/country/${link.COW_code}`);
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
  return (
    <div>
      <aside>
        <RLink to='/'>Home</RLink>
      </aside>
      <h1>{country.name} ({country.id})</h1>
      <h2>Status</h2>
      <Timelines
        onLinkClick={onOccupiedLinkClick}
        intervalMinWidth={5}
        data={occupations}
        nbLines={country.occupations.dimension}
        lineHeight={20}
        width={1000}
        xScale={xScale}
      />
      {/* <Histogram width={1000} height={300} data={Array.from(country.campains.values())} /> */}
      <h2>Sovereign of</h2>
      <Timelines
        onLinkClick={onCampainsLinkClick}
        intervalMinWidth={5}
        data={campains}
        nbLines={country.campains.dimension}
        lineHeight={20}
        width={1000}
        xScale={xScale}
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

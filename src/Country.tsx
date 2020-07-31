import React, { useContext, useCallback, useMemo, useState } from 'react';
import sort from 'ramda/es/sort';
import sortBy from 'ramda/es/sortBy';
import equals from 'ramda/es/equals';
import reduce from 'ramda/es/reduce';

import { AppContext } from './AppContext';
import Timelines from './timeline';
import { Link as RLink, RouteComponentProps } from 'react-router-dom';
import { min, max, scaleTime, scaleOrdinal } from 'd3';

import './Country.css'

import Select from 'react-select'


const sortDate = sort((a:Date, b:Date) => a > b);
const countYears = reduce( (acc:number,l:Link) => +l.end_year - +l.start_year + acc, 0)
const orderMethods = {
  'duration': sort(([, aLinks], [, bLinks]) => countYears(bLinks) - countYears(aLinks)),
  'year': sort(([, aLinks], [, bLinks])=> +sortDate(aLinks.map(l => l.start_year))[0] - +sortDate(bLinks.map(l => l.start_year))[0]),
  'name': sortBy(([entity,])=> entity.name)
}
const sortByStartYear = sort((a:Link, b:Link) => a.start_year > b.start_year)
const deOverlapLinks = (os:[Entity, Link[]][]) => os.map( (o:[Entity, Link[]]) =>
      // rewrite links for every object
      [o[0], sortByStartYear(o[1]).reduce((acc:Link[], l:Link) => {
        if (!acc || acc.length === 0)
          return [{...l}];
        else {        
          const previous:Link = acc[acc.length-1]
          if(previous.end_year > l.start_year){
            // manage overlap
            if (previous.status.priority >= l.status.priority) {

              const start_year = previous.end_year
              if ((+start_year === +previous.end_year && +l.end_year === +previous.end_year) || +start_year > +l.end_year)
                console.warn("one overlapping status removed", l)  
              else
                // add l but modify start_year
                acc.push({...l, start_year})
            }
            else {
              // previous is a copy we can mute it
              previous.end_year = l.start_year
              acc.push({...l})
            } 
          }
          else
            acc.push({...l})
          return acc  
        }
      }, [])]
    );

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
 
  const occupations: [Entity, Link[]][] = deOverlapLinks(Array.from(country.occupations.associations())) as [Entity, Link[]][];
  const campains: [Entity, Link[]][] = deOverlapLinks(Array.from(country.campains.associations())) as [Entity, Link[]][];

  // deoverlap links
  const data: [Entity, Link[]][] = useMemo(() => [
    ...occupations,
    ...campains,
  ], [occupations, campains]);
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
  // sort select handler
  const [orderBy, setOrderBy] = useState<any>();
  const orderedCampains = orderMethods[orderBy || 'year'](campains)

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
      <div style={{width:'1000px', margin: '0 auto'}}>
        <h2>Sovereign of {country.campains.dimension} entities</h2>
        <span >sort by <Select className='inlineSelect' onChange={e => setOrderBy(e.value)} defaultValue={{value:"year", label:"first date"}}
           theme={theme => ({
            ...theme,
            borderRadius: 5,
            colors: {
              ...theme.colors,
              primary25: "lightgrey",
              primary: "grey",
              background: "white",
              color:"black",
            }
          })}
          isSearchable={false}
          options={[
            {value:'year', label:'first date'},
            {value:'duration', label:'duration'},
            {value:'name', label:"entity name"}]}/></span></div>
      
      <Timelines 
        onEntityClick={onEntityClick}
        intervalMinWidth={5}
        data={orderedCampains}
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

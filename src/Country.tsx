import React, { useRef, useEffect, useContext } from 'react';

import equals from 'ramda/es/equals';
import { scaleTime, scaleOrdinal, schemeAccent, axisTop, select } from 'd3';
import { Link, useNavigation } from 'react-navi';
import TimelineChart from './timeline';
import { AppContext } from './AppContext';
import MultiMap from 'mnemonist/multi-map';
import Timelines from './timeline-r';
import { translate } from './utils';

const width = 1000;
const height = 100;

const margins = {
  left: 20,
  top: 55,
  right: 20,
  bottom: 20,
}

const innerWidth = width - margins.left - margins.right;
// const innerHeight = height - margins.top - margins.bottom;

const colorScale = scaleOrdinal(schemeAccent);
const firstYear = new Date('1816-01-01T00:00:00.000Z');
const lastYear = new Date();
const xScale = scaleTime()
  .domain([firstYear, lastYear])
  .range([0, innerWidth]);
const xAxis = axisTop(xScale);

const Mainland: React.FC<{
  data: Link[]
}> = (props) => {
  let data = props.data;
  // Add black bar if data is unknown.
  // if (first && first.start_year > firstYear) {
  //   data = [...data, {
  //     ...first,
  //     start_year: firstYear,
  //     end_year: first.start_year,
  //     sovereign: {
  //       COW_code: ''
  //     }
  //   }];
  // }
  const navigation = useNavigation();
  return (
    <g transform={translate(margins.left, margins.top)}>
      {[...data].reverse().map((link, index) => {
        const x = xScale(link.start_year);
        const y = 0;
        const color = link.sovereign ? colorScale(`${link.sovereign.id}`) : 'black';
        const width = xScale(link.end_year) - xScale(link.start_year);
        const onClick = () => {
          navigation.navigate(`/country/${link.sovereign.id}`);
        }
        return (
          <g key={index} transform={translate(x, y)} onClick={onClick}>
            <text transform={`rotate(45) translate(45, 0)`}>{link.status.slug} {link.sovereign && link.sovereign.name}</text>
            <rect
              x={0}
              width={width}
              stroke='black'
              y={0}
              height={20}
              fill={color}
            />
          </g>
        );
      })}
      <g transform={translate(0, 0)} ref={element => {
        if (element) {
          select(element).call(xAxis);
        }
      }} />
    </g>
  );
}

const Conquetes: React.FC<{
  data: MultiMap<Entity, Link>,
}> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    new TimelineChart(ref.current as HTMLDivElement, props.data, {
      height: 25 * props.data.size + 100,
      width: width
    });
  }, [props.data]);
  return <div ref={ref} />;
}

const Country: React.FC<{
  id: string,
}> = ({id}) => {
  const {state}: {state: GlobalState} = useContext(AppContext);
  const country = state.entities.find(entity => equals(entity.id, id));
  if (country === undefined) {
    return (<div>Loading</div>);
  }
  const occupations = Array.from(country.occupations.values());
  return (
    <div>
      <aside>
        <Link href='/'>Home</Link>
      </aside>
      <h1>{country.name}</h1>
      <h2>Territory masters</h2>
      <svg width={width} height={height + 200}>
        <Mainland data={occupations as Link[]} />
      </svg>
      <Timelines
        intervalMinWidth={8}
        data={country.campains as MultiMap<Entity, Link>}
        lineHeight={25}
      />
      <h2>Occupying territories</h2>
    </div>
  );
}

export default Country;

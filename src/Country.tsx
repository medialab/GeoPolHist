import React, { useRef, useEffect } from 'react';

import filter from 'ramda/es/filter';
import { xCowName, xSovereignCowName } from './utils';
import equals from 'ramda/es/equals';
import map from 'ramda/es/map';
import length from 'ramda/es/length';
import { scaleTime, scaleOrdinal, schemeAccent, axisTop, select } from 'd3';
import { Link, useNavigation } from 'react-navi';
import head from 'ramda/es/head';
import TimelineChart from './timeline';

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

const translate = (x: number, y: number) => `translate(${x}, ${y})`
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
  let first = head(props.data);
  let data = props.data;
  // Add black bar if data is unknown.
  if (first && first.start_year > firstYear) {
    data = [...data, {
      ...first,
      start_year: firstYear,
      end_year: first.start_year,
      sovereign_COW_code: ''
    }];
  }
  const navigation = useNavigation();
  return (
    <g transform={translate(margins.left, margins.top)}>
      {[...data].reverse().map((link, index) => {
        const x = xScale(link.start_year);
        const y = 0;
        const color = link.sovereign_COW_code === '' ? 'black' : colorScale(`${link.sovereign_COW_code}`);
        const width = xScale(link.end_year) - xScale(link.start_year);
        const onClick = () => {
          navigation.navigate(`/country/${link.sovereign_COW_code}`);
        }
        return (
          <g key={index} transform={translate(x, y)} onClick={onClick}>
            <text transform={`rotate(45) translate(45, 0)`}>{link.link_type} {link.sovereign_COW_name}</text>
            <rect
              x={0}
              width={width}
              stroke='black'
              y={0}
              height={20}
              fill={color}
            />
            {/* <text y={20}>{link.sovereign_COW_name}</text> */}
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
  data: Link[]
}> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    new TimelineChart(ref.current as HTMLDivElement, props.data, {
      height: 25 * props.data.length + 100,
      width: width
    });
  }, [props.data]);
  return <div ref={ref} />;
}

const Country: React.FC<{
  id: string,
  data: Link[],
}> = ({id, data}) => {
  const upperLinks = filter(
    (link: Link) => link.link_type !== 'Sovereign' && equals(link.COW_code, id)
  )(data);
  const lowerLinks = filter((link: Link) => equals(link.sovereign_COW_code, id))(data);
  console.log(upperLinks, lowerLinks);
  const country = data.find(link => equals(link.COW_code, id)) as Link;
  const print = (lens: (link: any) => any) => map((link: Link) => 
    <li key={Math.random()}>{link.link_type} <Link href={`/country/${link.COW_code}`}>{lens(link)}</Link></li>
  );
  return <div>
    <aside>
      <Link href='/'>Home</Link>
    </aside>
    <h1>{country.COW_name}</h1>
    <h2>Territory masters</h2>
    <ul>
      {print(xSovereignCowName)(upperLinks)}
    </ul>
    <svg width={width} height={height + 200}>
      <Mainland data={upperLinks} />
    </svg>
    {length(lowerLinks) >= 1 && <Conquetes data={lowerLinks} />}
    <h2>Occupying territories</h2>
    <ul>
      {print(xCowName)(lowerLinks)}
    </ul>
  </div>;
}

export default Country;

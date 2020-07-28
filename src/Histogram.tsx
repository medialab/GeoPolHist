/**
 *
 * Linechart
 *
 */

import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';

import { scaleTime, scaleLinear } from 'd3-scale';
import { area as areaCreator } from 'd3-shape';
import { extent, max, min } from 'd3-array';
import {
  stack as stackCreator,
  scaleOrdinal,
  select,
  zoom as zoomCreator,
  event as d3event,
  zoomIdentity,
  curveStep,
} from 'd3';
import { axisBottom, axisLeft } from 'd3-axis';
import { forEachObjIndexed, countBy, values, groupBy, map, pipe, head } from 'ramda';
//import { STATUS_SLUG } from './utils';
import { MultiMap } from 'mnemonist';
import { link } from 'fs';

const VizContainer: React.FC = props => <div {...props} className='histogram-container' />

const ONE_DAY = 86400000;

const whenElement = callback => element => {
  if (element) {
    callback(element);
  }
};

const color = scaleOrdinal().range([
  '#be5926',
  '#686cc8',
  '#57b14b',
  '#ae56c2',
  '#a6b447',
  '#ce4685',
  '#52ae88',
  '#d64546',
  '#5b9ed4',
  '#df8b30',
  '#c681bd',
  '#c49c40',
  '#aa5159',
  '#6d7631',
  '#d88c6c',
]);

// const slugs = values(STATUS_SLUG);
// const stack = stackCreator().keys(slugs);
const groupByYears = groupBy(
  (d: Link) => d.start_year.getFullYear()
);

// const agregateByYears = (xLens, keys) => {
//   // const defaultIndexes
//   return pipe(
//     groupByYears,
//     values,
//   )
// }

const Linechart: React.FC<{
  width: number;
  height: number;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }
  data: Link[]
}> = (props) => {
  const {
    width,
    height,
    margins = {
      top: 15,
      right: 0,
      bottom: 24,
      left: 35,
    },
  } = props;

  const data: Link[] = props.data;

  const minDate = min(data, (link) => link.start_year);
  const maxDate = max(data, (link) => link.end_year);

  const xScale = scaleTime()
    .rangeRound([0, width - margins.left - margins.right])
    .domain([minDate, maxDate]);
  
  const datum = pipe(
    groupByYears,
    map((links: Link[]) => ({
      ...countBy((link: Link) => link.status.slug, links),
      year: head(links).start_year
    })),
    values,
    )(data);
  //console.log(datum)
  
  //console.log(stack(datum))

  // const area = areaCreator()

  return <div />;

  // const area = areaCreator<Link>()
  //   .curve(curveStep)
  //   .x0(d => xScale(d.start_year))
  //   .x1(d => xScale(d.end_year));
  
  // const counter: {[key: string]: number} = countBy((link: Link) => link.status.slug)

  // const yScale = scaleLinear()
  //   .range([height - margins.top - margins.bottom, 0])
  //   .domain([0, max(values(counter) as number[])]);

  // let xAxisElement;
  // const xAxis = axisBottom(xScale);
  // const stacked = stack(counter as any);

  // return (
  //   <VizContainer>
  //     <svg width={width} height={height}>
  //       <g
  //         className="grid-container"
  //         transform={`translate(${margins.left + width}, ${margins.top})`}
  //         ref={
  //           whenElement(element => select(element).call(axisLeft(yScale).tickSize(width)))
  //         }
  //       />
  //       <g
  //         transform={`translate(${margins.left}, ${margins.top})`}
  //       >
  //         {stacked.map((data, i) => (
  //           <path
  //             key={data.key}
  //             className={`line-${data.key}`}
  //             fillOpacity="1"
  //             d={area(data)}
  //             fill={color(data.key) as string}
  //           />
  //         ))}
  //       </g>
  //       <g
  //         transform={`translate(${margins.left}, ${height - margins.bottom})`}
  //         ref={whenElement(element => {
  //           xAxisElement = select(element).call(xAxis);
  //         })}
  //       />
  //       <g
  //         transform={`translate(${margins.left}, ${margins.top})`}
  //         ref={whenElement(element => select(element).call(axisLeft(yScale)))}
  //       />
  //     </svg>
  //   </VizContainer>
  // );
}

export default memo(Linechart);

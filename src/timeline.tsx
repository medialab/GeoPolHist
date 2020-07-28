import React, { useState, useEffect, useMemo, useContext } from 'react';
import { scaleOrdinal, axisBottom, select, scaleLinear, timeFormat, ScaleTime, axisTop } from 'd3';
import values from 'ramda/es/values';
import reduce from 'ramda/es/reduce';
import countBy from 'ramda/es/countBy';
import mapObjIndexed from 'ramda/es/mapObjIndexed';
import pipe from 'ramda/es/pipe';
import cx from 'classnames';
import { translate } from './utils';
import './timeline.css'
import uuid from 'uuid';
import { AppContext } from './AppContext';


const legend = {
  height: 50,
}
const margins = {
  top: 0,
  right: 0,
  bottom: 50,
  left: 0
};
const formater = timeFormat('%Y');

const countByStatus = pipe(
  reduce((acc, [, links]: [Entity, Link[]]) => [...acc, ...links], []),
  countBy((link: Link) => link.status.slug),
);

const Timelines: React.FC<{
  data: [Entity, Link[]][];
  hideGroupLabels?: boolean;
  intervalMinWidth: number;
  lineHeight: number;
  width: number;
  onLinkClick: (link: Link) => void;
  xScale: ScaleTime<number, number>;
  nbLines: number;
}> = props => {

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

  // useWhyDidYouUpdate('timeline', props);
  const { xScale, data, nbLines } = props;
  const id = useMemo(uuid, []);
  const width = props.width - margins.left - margins.right;
  const elHeight = nbLines * props.lineHeight + margins.top + margins.bottom;
  const height = elHeight - margins.top - margins.bottom;
  const groupWidth = props.hideGroupLabels ? 0 : 200;
  const groupHeight = height / data.length;
  const intervalRectWidth = (d: Link) => Math.max(props.intervalMinWidth, xScale(d.end_year) - xScale(d.start_year))
  xScale.range([groupWidth, width]);
  const yScale = scaleLinear()
    .domain([0, nbLines])
    .range([0, height]);
  const xAxisTop = axisTop(xScale);
  const xAxisBottom = axisBottom(xScale);
  const intervalBarHeight = 0.8 * groupHeight;
  const intervalBarMargin = (groupHeight - intervalBarHeight) / 2;
  const [hover, setHover] = useState<{link: Link, index: number}>();
  const [status, setStatus] = useState<any>();
  const countedByStatus = useMemo(() => countByStatus(data), [data]);
  useEffect(() => () => {setHover(null); setStatus(null)}, [props.data]);
  return (
    <div className='timelines-container' style={{width: width}} onMouseLeave={() => setHover(null)}>
      {hover && <div className='tooltip-container' style={{
        transform: `translate(${xScale(hover.link.start_year)}px, ${yScale(hover.index) + legend.height + margins.top + props.lineHeight + 20}px)`,
        minWidth: intervalRectWidth(hover.link)
      }}>
        <span className='tooltip'>{hover.link.GPH_name} was a {hover.link.status.slug} from {formater(hover.link.start_year)} to {formater(hover.link.end_year)}</span>
      </div>}
      <div className="legend">
        <div className='legend-container'>
          {values(mapObjIndexed((number, label) => 
            <button onClick={() => status === label ? setStatus(null) : setStatus(label)} className={cx({
              'legend-item': true,
              'legend-item--hidden': status && status !== label,
            })} key={label} style={{backgroundColor: colorScale(label)}}>{label} : {number}</button>
          , countedByStatus))}
        </div>
        <svg height={20} width={props.width}>
          <g transform={translate(margins.left, margins.top)}>
            <g transform={translate(0, 17)} ref={element => {
              if (element) {
                select(element).call(xAxisTop);
              }
            }} />
          </g>
        </svg>
      </div>
      <svg height={elHeight} width={props.width}>
        <g transform={translate(margins.left, margins.top)}>
          <defs>
            <pattern id={`diagonalHatch-${id}`} patternUnits="userSpaceOnUse" width="4" height="4">
              <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" style={{stroke: 'black', strokeWidth: 1}} />
            </pattern>
            <clipPath id={`name-area-${id}`}>
              <rect x={0} y={0} height={height} width={groupWidth} />
            </clipPath>
          </defs>
          <g transform={translate(0, height)} ref={element => {
            if (element) {
              select(element).call(xAxisBottom);
            }
          }} />
          <g className={cx({
            group: true,
            has_status: !!status
          }, status)}>
            {data.map(([entity, links], index) => {
              return (
                <g key={entity.name} className={entity.name} transform={translate(0, yScale(index))}>
                  <line className='group-separator' x1={0} x2={width} y1={0} y2={0} stroke='black' strokeOpacity={0.1} />
                  <text className='entity-label' style={{clipPath: `url(#name-area-${id})`}} fontSize={props.lineHeight} dy='1em'>{entity.name}</text>
                  <g>
                    {links.map((link: Link) => {
                      const w = intervalRectWidth(link);
                      return (
                        <g key={link.id} transform={translate(xScale(link.start_year), intervalBarMargin)}>
                          <rect
                            rx='5'
                            className={cx('link-rect', link.status.slug)}
                            onClick={() => props.onLinkClick(link)}
                            onMouseEnter={() => setHover({link: link, index: index})}
                            fill={isNaN(w) ? `url(#diagonalHatch-${id})` : colorScale(link.status.slug)}
                            stroke={hover && hover.link === link ? 'white' : 'black'}
                            strokeOpacity={hover && hover.link === link ? 1 : 0.2}
                            strokeWidth={hover && hover.link === link ? 2 : 1}
                            width={isNaN(w) ? '100%' : w}
                            height={intervalBarHeight}
                            y={0}
                            x={0}
                          />
                        </g>
                      )
                    })}
                  </g>
                </g>
              )
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}

export default Timelines;

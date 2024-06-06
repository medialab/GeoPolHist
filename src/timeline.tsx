import cx from "classnames";
import {
  ScaleOrdinal,
  ScaleTime,
  axisBottom,
  axisTop,
  scaleLinear,
  select,
  timeFormat,
} from "d3";
import sortBy from "ramda/es/sortBy";
import values from "ramda/es/values";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import uuid from "uuid";
import "./timeline.css";
import { translate } from "./utils";

const margins = {
  top: 0,
  right: 0,
  bottom: 50,
  left: 0,
};
const formater = timeFormat("%Y");

const Timelines: React.FC<{
  data: [Entity, Link[]][];
  hideGroupLabels?: boolean;
  intervalMinWidth: number;
  lineHeight: number;
  width: number;
  onEntityClick: (GPH_code: string) => void;
  xScale: ScaleTime<number, number>;
  nbLines: number;
  colorScale: ScaleOrdinal<string, string>;
  groupBy?: "continent";
}> = (props) => {
  // useWhyDidYouUpdate('timeline', props);
  const { xScale, data, nbLines, colorScale } = props;
  const id = useMemo(uuid, []);
  const width = props.width - margins.left - margins.right;
  const elHeight = nbLines * props.lineHeight + margins.top + margins.bottom;
  const height = elHeight - margins.top - margins.bottom;
  const groupWidth = props.hideGroupLabels ? 0 : 200;
  const groupHeight = height / data.length;
  const intervalRectWidth = (d: Link) =>
    Math.max(props.intervalMinWidth, xScale(d.end_year) - xScale(d.start_year));
  xScale.range([groupWidth, width - 15]);

  const continentsLabels =
    props.groupBy === "continent"
      ? data.reduce((continents, [entity]) => {
          continents.add(entity.continent);
          return continents;
        }, new Set<string>())
      : undefined;
  const yScale = scaleLinear()
    .domain([0, nbLines + (continentsLabels ? continentsLabels.size : 0)])
    .range([0, height]);

  const xAxisTop = axisTop(xScale);
  const xAxisBottom = axisBottom(xScale);
  const intervalBarHeight = 0.8 * groupHeight;
  const intervalBarMargin = (groupHeight - intervalBarHeight) / 2;
  const [hover, setHover] = useState<{ link: Link; index: number }>();
  const [status, setStatus] = useState<any>();
  const sortStatus = sortBy((e) => e.priority + e.GPH_status);
  const groupedByStatus = sortStatus(
    values(
      data
        .reduce((acc, [, links]: [Entity, Link[]]) => [...acc, ...links], [])
        .reduce((acc, link: Link) => {
          acc[link.status.slug] = link.status;
          return acc;
        }, {})
    )
  ).reverse();

  useEffect(
    () => () => {
      setHover(null);
      setStatus(null);
    },
    [props.data]
  );

  // shift line when inserting continent labels
  let indexShift = 0;

  return (
    <div
      className="timelines-container"
      style={{ width: width }}
      onMouseLeave={() => setHover(null)}
    >
      <div className="legend">
        <div className="legend-container">
          {groupedByStatus.map((s: Status) => (
            <span
              key={s.slug}
              onClick={() => {
                status === s.slug ? setStatus(null) : setStatus(s.slug);
              }}
              className={cx({
                "legend-item": true,
                "legend-item--hidden": status && status !== s.slug,
              })}
            >
              <div
                className="colorLegendItem"
                style={
                  { backgroundColor: colorScale(s.slug) } as React.CSSProperties
                }
              ></div>
              <span>{s.GPH_status}</span>
            </span>
          ))}
        </div>
        <svg height={20} width={props.width}>
          <g transform={translate(margins.left, margins.top)}>
            <g
              transform={translate(0, 17)}
              ref={(element) => {
                if (element) {
                  select(element).call(xAxisTop);
                }
              }}
            />
          </g>
        </svg>
      </div>
      <div className="timeline">
        <svg height={elHeight} width={props.width}>
          <g transform={translate(margins.left, margins.top)}>
            <defs>
              <pattern
                id={`diagonalHatch-${id}`}
                patternUnits="userSpaceOnUse"
                width="4"
                height="4"
              >
                <path
                  d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2"
                  style={{ stroke: "black", strokeWidth: 1 }}
                />
              </pattern>
              <clipPath id={`name-area-${id}`}>
                <rect x={0} y={0} height={height} width={groupWidth} />
              </clipPath>
            </defs>
            <g
              transform={translate(0, height)}
              ref={(element) => {
                if (element) {
                  select(element).call(xAxisBottom);
                }
              }}
            />
            <g
              className={cx(
                {
                  group: true,
                  has_status: !!status,
                },
                status
              )}
            >
              {data.map(([entity, links], index) => {
                const showContinent =
                  props.groupBy === "continent" &&
                  (index === 0 ||
                    entity.continent !== data[index - 1][0].continent);

                if (showContinent && props.groupBy === "continent") {
                  indexShift += 1;
                }
                return (
                  <Fragment key={entity.name}>
                    {props.groupBy === "continent" && showContinent && (
                      <g
                        key={entity.continent}
                        className="continent"
                        transform={translate(0, yScale(index + indexShift - 1))}
                      >
                        {" "}
                        <rect fill="#ccc" width="100%" height="1.2em" />
                        <line
                          className="group-separator"
                          x1={0}
                          x2={width}
                          y1={0}
                          y2={0}
                          stroke="black"
                          strokeOpacity={0.1}
                        />
                        <text
                          x="50%"
                          textAnchor="middle"
                          fontSize="1em"
                          dy="1em"
                          className="continentLabel"
                        >
                          {entity.continent}
                          <title>{entity.continent}</title>
                        </text>
                      </g>
                    )}
                    <g
                      key={entity.name}
                      className={entity.name}
                      transform={translate(0, yScale(index + indexShift))}
                    >
                      <line
                        className="group-separator"
                        x1={0}
                        x2={width}
                        y1={0}
                        y2={0}
                        stroke="black"
                        strokeOpacity={0.1}
                      />
                      <text
                        className="entity-label"
                        style={{
                          clipPath: `url(#name-area-${id})`,
                          cursor: "pointer",
                        }}
                        fontSize="1em"
                        dy="1em"
                        width={groupWidth}
                        onClick={() => props.onEntityClick(entity.id)}
                      >
                        {entity.name.length <= 22
                          ? entity.name
                          : entity.name.slice(0, 22) + "…"}
                        <title>{entity.name}</title>
                      </text>
                      <g>
                        {links.map((link: Link) => {
                          const w = intervalRectWidth(link);
                          return (
                            <g
                              key={link.id}
                              transform={translate(
                                xScale(link.start_year),
                                intervalBarMargin
                              )}
                            >
                              <rect
                                rx="5"
                                className={cx("link-rect", link.status.slug)}
                                onClick={() => props.onEntityClick(entity.id)}
                                onMouseEnter={() =>
                                  setHover({ link: link, index: index })
                                }
                                fill={
                                  isNaN(w)
                                    ? `url(#diagonalHatch-${id})`
                                    : colorScale(link.status.slug)
                                }
                                stroke={
                                  hover && hover.link === link
                                    ? "white"
                                    : "black"
                                }
                                strokeOpacity={
                                  hover && hover.link === link ? 1 : 0.2
                                }
                                strokeWidth={
                                  hover && hover.link === link ? 2 : 1
                                }
                                width={isNaN(w) ? "100%" : w}
                                height={intervalBarHeight}
                                y={0}
                                x={0}
                              />
                            </g>
                          );
                        })}
                      </g>
                    </g>
                  </Fragment>
                );
              })}
            </g>
          </g>
        </svg>
        {hover && (
          <div
            className="tooltip-container"
            style={{
              transform: `translate(${xScale(hover.link.start_year)}px, ${
                yScale(hover.index) - props.lineHeight
              }px)`,
              //minWidth: intervalRectWidth(hover.link)
            }}
          >
            <span className="tooltip">
              {hover.link.GPH_name} - {hover.link.status.GPH_status} -{" "}
              {formater(hover.link.start_year)} to{" "}
              {formater(hover.link.end_year)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timelines;

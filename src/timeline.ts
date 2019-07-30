import { min, max } from "d3-array";
import { scaleTime, scaleOrdinal } from "d3-scale";
import { axisBottom, zoom, select, Selection, schemeAccent, event } from "d3";
import './chart.css'

interface TimelineOption {
  intervalMinWidth: number;
  tip?: Date;
  textTruncateThreshold: number;
  enableLiveTimer: boolean;
  timerTickInterval: number;
  hideGroupLabels: boolean;
  width?: number;
  height?: number;
}

class Timeline {
  now?: Selection<SVGLineElement, unknown, null, undefined>;
  constructor (element: HTMLElement, data: Link[], options: any) {
    if (data.length <= 0) {
      throw new Error('Your data is empty !');
    }
    const colorScale = scaleOrdinal(schemeAccent);
    const defaultOptions = {
      intervalMinWidth: 8, // px
      tip: undefined,
      textTruncateThreshold: 30,
      enableLiveTimer: false,
      timerTickInterval: 1000,
      hideGroupLabels: false
    };
    options = {...defaultOptions, ...options} as TimelineOption;
    element.classList.add('timeline-container');
    const minDate = min(data, d => d.start_year) as Date;
    const maxDate = max(data, d => d.end_year) as Date;
    const elWidth = options.width || element.clientWidth;
    const elHeight = options.height || element.clientHeight;
    const margins = {
      top: 0,
      right: 0,
      bottom: 20,
      left: 0
    };
    const width = elWidth - margins.left - margins.right;
    const height = elHeight - margins.top - margins.bottom;
    const groupWidth = options.hideGroupLabels ? 0 : 200;
    const groupHeight = height / data.length;

    const xScale = scaleTime()
      .domain([minDate, maxDate])
      .range([groupWidth, width]);
    const xAxis = axisBottom(xScale);
    const zoomed = () => {
      const res = svg.select<SVGGElement>('all-item-group')
      console.log('ouizoom', res);
      res.attr('transform', event.transform as any);
      // svg.select<SVGGElement>('.x.axis').call(xAxis)
      // svg
      //   .selectAll<SVGRectElement, Link>('rect.interval')
      //   .attr('x', (d) => xScale(d.start_year))
      //   .attr('width', d => Math.max(options.intervalMinWidth, xScale(d.end_year) - xScale(d.start_year)))
    };
    const zooming = zoom()
      .extent([[0, 0], [width, height]])
      .on('zoom', zoomed as any);
    console.log(width + margins.left + margins.right);
    const svg = select(element).append('svg')
      .attr('width', width + margins.left + margins.right)
      .attr('height', height + margins.top + margins.bottom)
      .append('g')
      .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')')
      .call(zooming as any)
    console.log(width - groupWidth);
    svg.append('defs')
      .append('clipPath')
      .attr('id', 'chart-content')
      .append('rect')
      .attr('x', groupWidth)
      .attr('y', 0)
      .attr('height', height)
      .attr('width', width - groupWidth);

    // svg.append('rect')
    //   .attr('class', 'chart-bounds')
    //   .attr('x', groupWidth)
    //   .attr('y', 0)
    //   .attr('height', height)
    //   .attr('width', width - groupWidth);

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);
    
    if (options.enableLiveTimer) {
      this.now = svg.append('line')
        .attr('clip-path', 'url(#chart-content)')
        .attr('class', 'vertical-marker now')
        .attr("y1", 0)
        .attr("y2", height);
    }

    svg.selectAll('.group-section')
      .data(data)
      .enter()
      .append('line')
      .attr('class', 'group-section')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d, i) =>
        groupHeight * (i + 1)
      )
      .attr('y2', (d, i) => 
        groupHeight * (i + 1)
      );
    if (!options.hideGroupLabels) {
      // Moyen chaud pour toute cette partie
      svg
        .selectAll('.group-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'group-label')
        .attr('x', 0)
        .attr('y', (d, i) => {
            return (groupHeight * i) + (groupHeight / 2) + 5.5;
        })
        .attr('dx', '0.5em')
        .text(d => d.COW_name);

      svg
        .append('line')
        .attr('x1', groupWidth)
        .attr('x2', groupWidth)
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', 'black');
    }

    // Intervals.
    const groupIntervalItems = svg
      .append('g')
      .attr('class', 'all-item-group')
      .selectAll<SVGGElement, Link>('.group-interval-item')
      .data(data)
      .enter()
      .append('g')
      .attr('clip-path', 'url(#chart-content)')
      .attr('class', 'item')
      .attr('transform', (d, i) => `translate(0, ${groupHeight * i})`)
      .attr('fill', link => colorScale(`${link.COW_code}`))
    
    const intervalBarHeight = 0.8 * groupHeight;
    const intervalBarMargin = (groupHeight - intervalBarHeight) / 2;

    groupIntervalItems
      .append('rect')
      .attr('class', 'interval')
      .attr('width', (d) => {
        console.log('ojoazeuaz', d)
        return Math.max(options.intervalMinWidth, xScale(d.end_year) - xScale(d.start_year))
      })
      .attr('height', intervalBarHeight)
      .attr('y', intervalBarMargin)
      .attr('x', (d: any) => xScale(d.start_year));

    groupIntervalItems
      .append('text')
      .text((d: any) => d.COW_name)
      .attr('fill', 'white')
      .attr('class', 'interval-text')
      .attr('y', (groupHeight / 2) + 5)
      .attr('x', (d: any) => xScale(d.start_year));
  }
}

export default Timeline;

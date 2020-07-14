//inspired from https://observablehq.com/@mbostock/flow-o-matic



colors = {
    part_of:"#7aacd6",
    sovereign:"#95ca6d",
    nonSovereign:"#dc9056",
    miscellaneous:"#d774c1"}

agg_link_type = {
    "Dissolved into":  "nonSovereign",
    "Became vassal of": "nonSovereign",
    "Became discovered" : "miscellaneous",
    "Became part of" : "part_of",
    "Became colony of": "nonSovereign",
    "Became possession of": "nonSovereign",
    "Became dependency of": "nonSovereign",
    "Claimed by": "nonSovereign",
    "Became protectorate of": "nonSovereign",
    "Became associated state of": "sovereign",
    "Occupied by": "nonSovereign",
    "Leased to": "nonSovereign",
    "Became neutral or demilitarized zone of": "nonSovereign",
    "Mandated to": "nonSovereign",
    "Sovereign": "sovereign",
    "Unincorporated territory": "nonSovereign",
    "Sovereign (unrecognized)": "sovereign",
    "Sovereign (limited)": "sovereign",
    "International": "nonSovereign",
    "Informal": "nonSovereign",
    "Unknown": "miscellaneous"
}
    



  
fetch('./data/status_flows.csv')
  .then(response => response.text())
  .then(data => {
      const color = "#DDDDDD";
        const ls = d3.csvParseRows(data, ([source, target, value, linkColor = color]) => (source && target ? {source, target, value: !value || isNaN(value = +value) ? 1 : value, color: linkColor} : null));
        const nodeByName = new Map;
        for (const link of ls) {
            if (!nodeByName.has(link.source)) nodeByName.set(link.source, {name: link.source});
            if (!nodeByName.has(link.target)) nodeByName.set(link.target, {name: link.target});
        }
        const sankeyData = {nodes: Array.from(nodeByName.values()), links:ls};
        const width = 1300 
        const height = 800 
        const padding = 10
        const align="justify" 
        const inputOrder = false
        const nodeWidth = 15

        const sankey = d3.sankey()
            .nodeId(d => d.name)
            .nodeAlign(d3[`sankey${align[0].toUpperCase()}${align.slice(1)}`])
            .nodeSort(inputOrder ? null : undefined)
            .nodeWidth(15)
            .nodePadding(padding)
            .extent([[0, 18], [width, height - 18]])
            .nodeWidth(nodeWidth)


        const svg = d3.select(document.getElementById('statusSankey'))
            .style("background", "#fff")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", `0 0 ${width} ${height}`);
        
        const {nodes, links} = sankey({
            nodes: sankeyData.nodes.map(d => Object.assign({}, d)),
            links: sankeyData.links.map(d => Object.assign({}, d))
        });
        periods = nodes.reduce( (acc, n) => { 
            
            if (!acc.map(p => p.x0).includes(n.x0)) {
                acc.push({x0: n.x0, label:n.name.match(/(.*) (\d{4})-\d{4}/)[2]});
            }
            return acc;}, [])
            
        

        svg.append("g")
            .selectAll("rect")
            .data(nodes)
            .join("rect")
            .attr("x", d => d.x0 + 1)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0 - 2)
            .attr("fill", d => {
                const meta = d.name.match(/(.*) (\d{4}-\d{4})/);
                const type = meta[1];
                return colors[agg_link_type[type]];
            })
            .append("title")
            .text(d => `${d.name}\n${d.value.toLocaleString()}`);
        
        const link = svg.append("g")
            .attr("fill", "none")
            .selectAll("g")
            .data(links)
            .join("g")
            .attr("stroke", d => {
                const targetType = d.target.name.match(/(.*) \d{4}-\d{4}/)[1]
                return colors[agg_link_type[targetType]]
            })
            .attr("opacity",0.4)
            .style("mix-blend-mode", "multiply");
        
        link.append("path")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", d => Math.max(1, d.width));
        
        link.append("title")
            .text(d => `${d.source.name} → ${d.target.name}\n${d.value.toLocaleString()}`);
        
        svg.append("g")
            .style("font", "0.85em sans-serif")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
            .text(d =>  d.name.match(/(.*) (\d{4}-\d{4})/)[1])
            .append("tspan")
            .attr("fill-opacity", 0.9)
            .text(d => ` ${d.value.toLocaleString()}`);

        
        svg.append("g")
            .style("font", "0.95em sans-serif")
            .selectAll("text")
            .data(periods)
            .join('text')
            .attr("x", p =>  {
                if (p.x0 < nodeWidth*2)
                    return p.x0;
                if (p.x0 >= width - nodeWidth)
                    return p.x0 + nodeWidth;
                return p.x0 + nodeWidth/2;
            })
            .attr("y", 0 )
            .attr("dy", "1em")
            .attr("text-anchor", p => {
                if (p.x0 < nodeWidth*2)
                    return "start";
                if (p.x0 >= width - nodeWidth)
                    return "end";
                return "middle";
            })
            .text(p => p.label)
            .append("tspan")
            .attr("fill-opacity", 0.7);

        svg.node();
}
);


      
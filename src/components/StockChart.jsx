import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const StockChart = ({ data, ticker }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle responsive dimensions
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        setDimensions({
          width: containerWidth,
          height: Math.max(containerHeight, 300) // Minimum height of 300px
        });
      }
    };

    // Initial size calculation
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data || !data.length || !dimensions.width || !dimensions.height) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Responsive margins
    const isMobile = dimensions.width < 640;
    const margin = { 
      top: 20, 
      right: isMobile ? 20 : 30, 
      bottom: isMobile ? 50 : 40, 
      left: isMobile ? 50 : 60 
    };
    
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse dates and prepare data
    const parseDate = d3.timeParse("%Y-%m-%d");
    const chartData = data.map(d => ({
      ...d,
      date: parseDate(d.date),
      open: +d.open,
      high: +d.high,
      low: +d.low,
      close: +d.close,
      volume: +d.volume
    })).sort((a, b) => a.date - b.date);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(chartData, d => d.date))
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(chartData, d => d.close))
      .nice()
      .range([chartHeight, 0]);

    // Line generator
    const line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.close))
      .curve(d3.curveMonotoneX);

    // Add gradient
    const gradient = g.append("defs")
      .append("linearGradient")
      .attr("id", `gradient-${ticker}`)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", chartHeight)
      .attr("x2", 0).attr("y2", 0);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0.1);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0.8);

    // Add grid lines (fewer on mobile)
    const gridTickCount = isMobile ? 3 : 5;
    
    g.selectAll(".grid-line-x")
      .data(xScale.ticks(gridTickCount))
      .enter()
      .append("line")
      .attr("class", "grid-line-x")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1);

    g.selectAll(".grid-line-y")
      .data(yScale.ticks(gridTickCount))
      .enter()
      .append("line")
      .attr("class", "grid-line-y")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1);

    // Add area under the line
    const area = d3.area()
      .x(d => xScale(d.date))
      .y0(chartHeight)
      .y1(d => yScale(d.close))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(chartData)
      .attr("fill", `url(#gradient-${ticker})`)
      .attr("d", area);

    // Add the line
    g.append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", isMobile ? 2 : 3)
      .attr("d", line);

    // Add dots (smaller and fewer on mobile)
    const dotRadius = isMobile ? 2 : 4;
    const dotsData = isMobile ? 
      chartData.filter((d, i) => i % Math.ceil(chartData.length / 10) === 0) : 
      chartData;

    g.selectAll(".dot")
      .data(dotsData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.close))
      .attr("r", dotRadius)
      .attr("fill", "#3b82f6")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseover", function(event, d) {
        // Tooltip on hover
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0)
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "8px")
          .style("border-radius", "4px")
          .style("font-size", isMobile ? "10px" : "12px")
          .style("z-index", "1000");

        tooltip.transition()
          .duration(200)
          .style("opacity", .9);

        tooltip.html(`
          <strong>Date:</strong> ${d3.timeFormat("%Y-%m-%d")(d.date)}<br/>
          <strong>Close:</strong> $${d.close.toFixed(2)}<br/>
          <strong>Volume:</strong> ${d.volume.toLocaleString()}
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.selectAll(".tooltip").remove();
      });

    // Add x-axis
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(isMobile ? 3 : 5)
        .tickFormat(d3.timeFormat("%m/%d")))
      .selectAll("text")
      .style("font-size", isMobile ? "10px" : "12px")
      .style("fill", "#6b7280");

    // Add y-axis
    g.append("g")
      .call(d3.axisLeft(yScale)
        .ticks(gridTickCount)
        .tickFormat(d => `$${d.toFixed(2)}`))
      .selectAll("text")
      .style("font-size", isMobile ? "10px" : "20px")
      .style("fill", "#6b7280");
      

    // Add axis labels (smaller on mobile)
g.append("text")
  .attr("y", chartHeight / 2) // middle of Y axis
  .attr("x", -margin.left ) // shift left of the axis
  .style("text-anchor", "start") // align left edge of text
  .style("font-size", isMobile ? "10px" : "16px")
  .style("fill", "#6b7280")
  .text("Price ($)");


    g.append("text")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", isMobile ? "10px" : "20px")
      .style("fill", "#6b7280")
      .text("Date");

  }, [data, ticker, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default StockChart;
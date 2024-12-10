import React, { Component } from "react";
import * as d3 from "d3";

class Visualization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorBy: "Sentiment",
      selectedTweets: [],
    };
    this.renderChart = this.renderChart.bind(this);
    this.toggleTweetSelection = this.toggleTweetSelection.bind(this);
  }

  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.csv_data !== this.props.csv_data) {
      this.renderChart();
    }
    if (prevState.colorBy !== this.state.colorBy) {
      this.updateColors();
      const svg = d3.select("#chart").select("svg").select("g");
      const colorScale =
        this.state.colorBy === "Sentiment"
          ? d3.scaleLinear().domain([-1, 0, 1]).range(["red", "#ECECEC", "green"])
          : d3.scaleLinear().domain([0, 1]).range(["#ECECEC", "#4467C4"]);
      svg.selectAll(".legend-group").remove();
      this.renderLegend(svg, colorScale);
    }
  }

  toggleTweetSelection(tweet, element) {
    this.setState((prevState) => {
      const isSelected = prevState.selectedTweets.includes(tweet);
      const updatedTweets = isSelected
        ? prevState.selectedTweets.filter((t) => t !== tweet)
        : [tweet, ...prevState.selectedTweets];

      d3.select(element)
        .attr("stroke", isSelected ? "none" : "black")
        .attr("stroke-width", isSelected ? 0.5 : 2);

      return { selectedTweets: updatedTweets };
    });
  }

  updateColors() {
    const { colorBy } = this.state;

    const sentimentColorScale = d3
      .scaleLinear()
      .domain([-1, 0, 1])
      .range(["red", "#ECECEC", "green"]);

    const subjectivityColorScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range(["#ECECEC", "#4467C4"]);

    const colorScale =
      colorBy === "Sentiment" ? sentimentColorScale : subjectivityColorScale;

    d3.selectAll("circle")
      .transition()
      .duration(500)
      .attr("fill", (d) => colorScale(d[colorBy]));
  }

  renderChart() {
    const rawData = this.props.csv_data || [];
    const data = this.validateData(rawData).slice(0, 300);

    if (data.length === 0) {
      d3.select("#chart").selectAll("*").remove();
      d3.select("#chart").append("text").text("No valid data to display.");
      return;
    }

    const svgWidth = 1200;
    const svgHeight = 700;
    const margin = { top: 20, right: 150, bottom: 50, left: 150 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    d3.select("#chart").selectAll("*").remove();

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const months = ["March", "April", "May"];
    const yScale = d3
      .scalePoint()
      .domain(months)
      .range([0, height * 0.8])
      .padding(0.5);

    const sentimentColorScale = d3
      .scaleLinear()
      .domain([-1, 0, 1])
      .range(["red", "#ECECEC", "green"]);

    const subjectivityColorScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range(["#ECECEC", "#4467C4"]);

    const colorScale =
      this.state.colorBy === "Sentiment"
        ? sentimentColorScale
        : subjectivityColorScale;

    const simulation = d3
      .forceSimulation(data)
      .force(
        "x",
        d3.forceX(width / 2).strength(0.1)
      )
      .force(
        "y",
        d3.forceY((d) => yScale(d["Month"])).strength(0.8)
      )
      .force("collide", d3.forceCollide(6))
      .stop();

    for (let i = 0; i < 300; ++i) simulation.tick();

    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 5)
      .attr("fill", (d) => colorScale(d[this.state.colorBy]))
      .attr("stroke", "none")
      .attr("stroke-width", 0.5)
      .on("click", (event, d) => {
        this.toggleTweetSelection(d, event.currentTarget);
      });

    svg
      .selectAll(".month-label")
      .data(months)
      .enter()
      .append("text")
      .attr("x", -80)
      .attr("y", (d) => yScale(d))
      .attr("dy", "0.8em")
      .attr("text-anchor", "end")
      .attr("font-size", "22px")
      .attr("font-weight", "bold")
      .text((d) => d);

    this.renderLegend(svg, colorScale);
  }

  renderLegend(svg, colorScale) {
    const legendHeight = 400;
    const legendWidth = 20;
    const scatterplotWidth = 950;

    const legendGroup = svg
      .append("g")
      .attr("class", "legend-group")
      .attr("transform", `translate(${scatterplotWidth + 10}, 50)`);

    const gradient = legendGroup
      .append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScale(1));

    gradient
      .append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#ECECEC");

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScale(-1));

    legendGroup
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

    const topLabel =
      this.state.colorBy === "Sentiment" ? "Positive" : "Subjective";
    legendGroup
      .append("text")
      .attr("x", legendWidth + 10)
      .attr("y", 10)
      .attr("text-anchor", "start")
      .attr("font-size", "12px")
      .text(topLabel);

    const bottomLabel =
      this.state.colorBy === "Sentiment" ? "Negative" : "Objective";
    legendGroup
      .append("text")
      .attr("x", legendWidth + 10)
      .attr("y", legendHeight)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .attr("font-size", "12px")
      .text(bottomLabel);
  }

  validateData(data) {
    return data.filter(
      (d) =>
        d["Dimension 1"] !== undefined &&
        d["Dimension 2"] !== undefined &&
        d[this.state.colorBy] !== undefined &&
        d["Month"] !== undefined
    );
  }

  render() {
    const { selectedTweets } = this.state;

    return (
      <div>
        <div>
          <label>Color By:</label>
          <select
            onChange={(e) => this.setState({ colorBy: e.target.value })}
            value={this.state.colorBy}
          >
            <option value="Sentiment">Sentiment</option>
            <option value="Subjectivity">Subjectivity</option>
          </select>
        </div>
        <div id="chart" style={{ margin: "20px auto" }}></div>
        <div style={{ marginTop: "-200px" }}> {/* Adjust position */}
          <h4>Selected Tweets:</h4>
          <ul>
            {selectedTweets.map((tweet, index) => (
              <li key={index}>{tweet.RawTweet}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default Visualization;

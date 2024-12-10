import React, { Component } from "react";
import "./App.css";
import FileUpload from "./FileUpload";
import Visualization from "./Visualization";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null, // Holds the JSON data
    };

    this.set_data = this.set_data.bind(this); // Bind the set_data function
  }

  // Function to update the state with uploaded data
  set_data(json_data) {
    this.setState({ data: json_data });
  }

  render() {
    return (
      <div>
        {/* Pass the set_data function as a prop */}
        <FileUpload set_data={this.set_data} />
        {/* Conditionally render Visualization only when data is available */}
        {this.state.data && <Visualization csv_data={this.state.data} />}
      </div>
    );
  }
}

export default App;

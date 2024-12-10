import React, { Component } from "react";

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null, // Stores the uploaded file
    };

    this.handleFileSubmit = this.handleFileSubmit.bind(this); // Bind the function
  }

  // Handles the file upload and reads its content
  handleFileSubmit(event) {
    event.preventDefault(); // Prevent default form submission
    const { file } = this.state; // Get the file from the state

    if (file) {
      const reader = new FileReader(); // Create a FileReader instance
      reader.onload = (e) => {
        try {
          // Parse the JSON data
          const jsonData = JSON.parse(e.target.result);
          console.log("Parsed JSON Data:", jsonData); // Debugging log
          this.props.set_data(jsonData); // Pass the data to the parent component
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Invalid JSON file. Please upload a valid file.");
        }
      };
      reader.readAsText(file); // Read the file as text
    } else {
      alert("Please select a file before submitting.");
    }
  }

  render() {
    return (
      <div style={{ backgroundColor: "#f0f0f0", padding: 20 }}>
        <h2>Upload a JSON File</h2>
        <form onSubmit={this.handleFileSubmit}>
          <input
            type="file"
            accept=".json"
            onChange={(event) => this.setState({ file: event.target.files[0] })}
          />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default FileUpload;

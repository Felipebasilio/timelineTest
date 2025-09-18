import React from "react";
import ReactDOM from "react-dom/client";
import timelineItems from "./timelineItems.js";
import TimelineContainer from "./components/TimelineContainer.js";

/**
 * App component - root component of the application
 * Renders the main timeline with sample data
 */
function App() {
  return (
    <div className="app">
      <TimelineContainer items={timelineItems} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
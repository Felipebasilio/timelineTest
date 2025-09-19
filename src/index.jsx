import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import timelineItems from "./timelineItems.js";
import { TimelineContainer } from "./components";

/**
 * App component - root component of the application
 * Renders the main timeline with sample data and handles item updates
 */
function App() {
  const [items, setItems] = useState(timelineItems);

  const handleItemsChange = (updatedItems) => {
    setItems(updatedItems);
  };

  return (
    <div className="app">
      <TimelineContainer items={items} onItemsChange={handleItemsChange} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
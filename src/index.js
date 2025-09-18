import React from "react";
import ReactDOM from "react-dom/client";
import timelineItems from "./timelineItems.js";
import assignLanes from "./assignLanes.js";

const dayInMs = 1000 * 60 * 60 * 24;

function Timeline({ items }) {
  // Calculate timeline boundaries
  const allDates = items.flatMap(item => [item.start, item.end]);
  const minDate = new Date(Math.min(...allDates.map(date => new Date(date))));
  const maxDate = new Date(Math.max(...allDates.map(date => new Date(date))));
  
  // Add some padding to the timeline
  const timelineStart = new Date(minDate);
  timelineStart.setDate(timelineStart.getDate() - 2);
  const timelineEnd = new Date(maxDate);
  timelineEnd.setDate(timelineEnd.getDate() + 2);
  
  const totalDays = Math.ceil((timelineEnd - timelineStart) / (1000 * 60 * 60 * 24));
  
  // Assign items to lanes
  const lanes = assignLanes(items);
  
  // Calculate position and width for each item
  const getItemStyle = (item) => {
    const startDate = new Date(item.start);
    const endDate = new Date(item.end);
    const startOffset = Math.ceil((startDate - timelineStart) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // +1 to include end date
    
    const leftPercent = (startOffset / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;
    
    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };
  
  // Generate month markers for the timeline
  const generateMonthMarkers = () => {
    const markers = [];
    const current = new Date(timelineStart);
    current.setDate(1); // Start at beginning of month
    
    while (current <= timelineEnd) {
      const offset = Math.ceil((current - timelineStart) / (1000 * 60 * 60 * 24));
      const leftPercent = (offset / totalDays) * 100;
      
      markers.push({
        date: new Date(current),
        left: leftPercent
      });
      
      current.setMonth(current.getMonth() + 1);
    }
    
    return markers;
  };
  
  const monthMarkers = generateMonthMarkers();
  
  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2>Project Timeline</h2>
        <p>{items.length} timeline items arranged in {lanes.length} lanes</p>
      </div>
      
      {/* Timeline ruler */}
      <div className="timeline-ruler">
        {monthMarkers.map((marker, index) => (
          <div 
            key={index}
            className="month-marker"
            style={{ left: `${marker.left}%` }}
          >
            <div className="month-line"></div>
            <div className="month-label">
              {marker.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Timeline lanes */}
      <div className="timeline-lanes">
        {lanes.map((lane, laneIndex) => (
          <div key={laneIndex} className="timeline-lane">
            <div className="lane-number">Lane {laneIndex + 1}</div>
            <div className="lane-content">
              {lane.map((item) => {
                const style = getItemStyle(item);
                return (
                  <div
                    key={item.id}
                    className="timeline-item"
                    style={style}
                    title={`${item.name} (${item.start} to ${item.end})`}
                  >
                    <div className="item-content">
                      <div className="item-name">{item.name}</div>
                      <div className="item-dates">
                        {item.start} → {item.end}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <Timeline items={timelineItems} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
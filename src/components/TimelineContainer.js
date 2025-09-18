import React from 'react';
import assignLanes from '../assignLanes.js';
import { calculateTimelineBoundaries, calculateTotalDays } from '../utils.js';
import TimelineHeader from './TimelineHeader.js';
import TimelineRuler from './TimelineRuler.js';
import TimelineLanesContainer from './TimelineLanesContainer.js';

/**
 * TimelineContainer component - main container for the entire timeline
 * Handles data processing and coordinates all timeline sub-components
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of timeline items
 */
const TimelineContainer = ({ items }) => {
  // Calculate timeline boundaries and total days
  const { timelineStart, timelineEnd } = calculateTimelineBoundaries(items);
  const totalDays = calculateTotalDays(timelineStart, timelineEnd);
  
  // Assign items to lanes using the provided algorithm
  const lanes = assignLanes(items);

  return (
    <div className="timeline-container">
      <TimelineHeader 
        itemCount={items.length} 
        laneCount={lanes.length} 
      />
      
      <TimelineRuler 
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        totalDays={totalDays}
      />
      
      <TimelineLanesContainer 
        lanes={lanes}
        timelineStart={timelineStart}
        totalDays={totalDays}
      />
    </div>
  );
};

export default TimelineContainer;

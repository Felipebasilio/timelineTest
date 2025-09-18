import React from 'react';
import TimelineLane from './TimelineLane.js';

/**
 * TimelineLanesContainer component - container for all timeline lanes
 * @param {Object} props - Component props
 * @param {Array} props.lanes - Array of lanes, each containing timeline items
 * @param {Date} props.timelineStart - Start date of the timeline
 * @param {number} props.totalDays - Total number of days in the timeline
 */
const TimelineLanesContainer = ({ lanes, timelineStart, totalDays }) => {
  return (
    <div className="timeline-lanes">
      {lanes.map((lane, laneIndex) => (
        <TimelineLane
          key={laneIndex}
          lane={lane}
          laneIndex={laneIndex}
          timelineStart={timelineStart}
          totalDays={totalDays}
        />
      ))}
    </div>
  );
};

export default TimelineLanesContainer;

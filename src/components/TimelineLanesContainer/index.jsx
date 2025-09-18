import React from 'react';
import { TimelineLane } from '../index';

/**
 * TimelineLanesContainer component - container for all timeline lanes with zoom support
 * @param {Object} props - Component props
 * @param {Array} props.lanes - Array of lanes, each containing timeline items
 * @param {Date} props.timelineStart - Original timeline start date
 * @param {Date} props.visibleStart - Visible timeline start date (for zoom)
 * @param {number} props.visibleDays - Number of visible days (for zoom)
 * @param {number} props.zoomLevel - Current zoom level
 */
const TimelineLanesContainer = ({ lanes, timelineStart, visibleStart, visibleDays, zoomLevel }) => {
  return (
    <div className="timeline-lanes">
      {lanes.map((lane, laneIndex) => (
        <TimelineLane
          key={laneIndex}
          lane={lane}
          laneIndex={laneIndex}
          timelineStart={timelineStart}
          visibleStart={visibleStart}
          visibleDays={visibleDays}
          zoomLevel={zoomLevel}
        />
      ))}
    </div>
  );
};

export default TimelineLanesContainer;

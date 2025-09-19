import React from 'react';
import { TimelineItem } from '../index';

/**
 * TimelineLane component - represents a single lane containing timeline items with zoom support
 * @param {Object} props - Component props
 * @param {Array} props.lane - Array of timeline items in this lane
 * @param {number} props.laneIndex - Index of this lane (0-based)
 * @param {Date} props.timelineStart - Original timeline start date
 * @param {Date} props.visibleStart - Visible timeline start date (for zoom)
 * @param {number} props.visibleDays - Number of visible days (for zoom)
 * @param {number} props.totalDays - Total number of days in timeline
 * @param {number} props.zoomLevel - Current zoom level
 */
const TimelineLane = ({ lane, laneIndex, timelineStart, visibleStart, visibleDays, totalDays, zoomLevel }) => {
  return (
    <div className="timeline-lane">
      <div className="lane-number">Lane {laneIndex + 1}</div>
      <div className="lane-content">
        {lane.map((item) => (
          <TimelineItem
            key={item.id}
            item={item}
            timelineStart={timelineStart}
            visibleStart={visibleStart}
            visibleDays={visibleDays}
            totalDays={totalDays}
            zoomLevel={zoomLevel}
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineLane;

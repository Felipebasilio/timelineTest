import React from 'react';
import TimelineItem from './TimelineItem.js';

/**
 * TimelineLane component - represents a single lane containing timeline items
 * @param {Object} props - Component props
 * @param {Array} props.lane - Array of timeline items in this lane
 * @param {number} props.laneIndex - Index of this lane (0-based)
 * @param {Date} props.timelineStart - Start date of the timeline
 * @param {number} props.totalDays - Total number of days in the timeline
 */
const TimelineLane = ({ lane, laneIndex, timelineStart, totalDays }) => {
  return (
    <div className="timeline-lane">
      <div className="lane-number">Lane {laneIndex + 1}</div>
      <div className="lane-content">
        {lane.map((item) => (
          <TimelineItem
            key={item.id}
            item={item}
            timelineStart={timelineStart}
            totalDays={totalDays}
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineLane;

import React from 'react';

/**
 * TimelineHeader component - displays timeline title and statistics
 * @param {Object} props - Component props
 * @param {number} props.itemCount - Number of timeline items
 * @param {number} props.laneCount - Number of lanes
 */
const TimelineHeader = ({ itemCount, laneCount }) => {
  return (
    <div className="timeline-header">
      <h2>Project Timeline</h2>
      <p>{itemCount} timeline items arranged in {laneCount} lanes</p>
    </div>
  );
};

export default TimelineHeader;

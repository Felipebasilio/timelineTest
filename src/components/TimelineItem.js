import React from 'react';
import { calculateItemPosition, createItemTooltip } from '../utils.js';

/**
 * TimelineItem component - represents a single item on the timeline
 * @param {Object} props - Component props
 * @param {Object} props.item - Timeline item data
 * @param {Date} props.timelineStart - Start date of the timeline
 * @param {number} props.totalDays - Total number of days in the timeline
 */
const TimelineItem = ({ item, timelineStart, totalDays }) => {
  const style = calculateItemPosition(item, timelineStart, totalDays);
  const tooltip = createItemTooltip(item);

  return (
    <div
      className="timeline-item"
      style={style}
      title={tooltip}
    >
      <div className="item-content">
        <div className="item-name">{item.name}</div>
        <div className="item-dates">
          {item.start} → {item.end}
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;

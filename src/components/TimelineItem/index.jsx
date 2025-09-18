import React from 'react';
import { calculateItemPosition, calculateItemPositionWithZoom, createItemTooltip } from '../../utils.js';

/**
 * TimelineItem component - represents a single item on the timeline with zoom support
 * @param {Object} props - Component props
 * @param {Object} props.item - Timeline item data
 * @param {Date} props.timelineStart - Original timeline start date
 * @param {Date} props.visibleStart - Visible timeline start date (for zoom)
 * @param {number} props.visibleDays - Number of visible days (for zoom)
 * @param {number} props.zoomLevel - Current zoom level
 */
const TimelineItem = ({ item, timelineStart, visibleStart, visibleDays, zoomLevel }) => {
  // Use zoom-aware positioning if zoom is not at default level
  const style = zoomLevel === 1.0 
    ? calculateItemPosition(item, timelineStart, visibleDays)
    : calculateItemPositionWithZoom(item, timelineStart, visibleStart, visibleDays);
    
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

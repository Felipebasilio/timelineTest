import React from 'react';
import { generateMonthMarkers, generateMonthMarkersWithZoom, formatMonthLabel } from '../../utils.js';

/**
 * TimelineRuler component - displays month markers for the timeline with zoom support
 * @param {Object} props - Component props
 * @param {Date} props.timelineStart - Original timeline start date
 * @param {Date} props.timelineEnd - Original timeline end date
 * @param {Date} props.visibleStart - Visible timeline start date (for zoom)
 * @param {Date} props.visibleEnd - Visible timeline end date (for zoom)
 * @param {number} props.visibleDays - Number of visible days (for zoom)
 * @param {number} props.totalDays - Total number of days in timeline
 * @param {number} props.zoomLevel - Current zoom level
 */
const TimelineRuler = ({ 
  timelineStart, 
  timelineEnd, 
  visibleStart, 
  visibleEnd, 
  visibleDays, 
  totalDays,
  zoomLevel 
}) => {
  // Use zoom-aware month markers if zoom is not at default level
  const monthMarkers = zoomLevel === 1.0 
    ? generateMonthMarkers(timelineStart, timelineEnd, visibleDays)
    : generateMonthMarkersWithZoom(visibleStart, visibleEnd, visibleDays);

  return (
    <div className="timeline-ruler">
      {monthMarkers.map((marker, index) => (
        <div 
          key={index}
          className="month-marker"
          style={{ left: `${marker.left}%` }}
        >
          <div className="month-line"></div>
          <div className="month-label">
            {formatMonthLabel(marker.date)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineRuler;

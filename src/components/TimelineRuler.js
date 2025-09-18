import React from 'react';
import { generateMonthMarkers, formatMonthLabel } from '../utils.js';

/**
 * TimelineRuler component - displays month markers for the timeline
 * @param {Object} props - Component props
 * @param {Date} props.timelineStart - Start date of the timeline
 * @param {Date} props.timelineEnd - End date of the timeline
 * @param {number} props.totalDays - Total number of days in the timeline
 */
const TimelineRuler = ({ timelineStart, timelineEnd, totalDays }) => {
  const monthMarkers = generateMonthMarkers(timelineStart, timelineEnd, totalDays);

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

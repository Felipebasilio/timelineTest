import React from 'react';
import { ZoomControls } from '../index';

/**
 * TimelineHeader component - displays timeline title, statistics, and zoom controls
 * @param {Object} props - Component props
 * @param {number} props.itemCount - Number of timeline items
 * @param {number} props.laneCount - Number of lanes
 * @param {number} props.zoomLevel - Current zoom level
 * @param {Function} props.onZoomIn - Callback for zoom in action
 * @param {Function} props.onZoomOut - Callback for zoom out action
 * @param {Function} props.onZoomReset - Callback for zoom reset action
 * @param {Function} props.onZoomChange - Callback for direct zoom level change
 */
const TimelineHeader = ({ 
  itemCount, 
  laneCount, 
  zoomLevel, 
  onZoomIn, 
  onZoomOut, 
  onZoomReset, 
  onZoomChange 
}) => {
  return (
    <div className="timeline-header">
      <div className="timeline-header-info">
        <h2>Project Timeline</h2>
        <p>{itemCount} timeline items arranged in {laneCount} lanes</p>
      </div>
      
      <ZoomControls
        zoomLevel={zoomLevel}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onZoomReset={onZoomReset}
        onZoomChange={onZoomChange}
      />
    </div>
  );
};

export default TimelineHeader;

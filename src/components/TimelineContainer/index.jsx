import React, { useState, useEffect, useCallback, useRef } from 'react';
import assignLanes from '../../assignLanes.js';
import { 
  calculateTimelineBoundaries, 
  calculateTotalDays, 
  calculateVisibleRange,
  calculateVisibleRangeWithMouse,
  handleMouseWheelZoom,
  ZOOM_LEVELS,
  clampZoomLevel
} from '../../utils.js';
import { TimelineHeader, TimelineRuler, TimelineLanesContainer } from '../index';

/**
 * TimelineContainer component - main container for the entire timeline with zoom functionality
 * Handles data processing, zoom state management, and coordinates all timeline sub-components
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of timeline items
 * @param {Function} props.onItemsChange - Callback when items are updated
 */
const TimelineContainer = ({ items, onItemsChange }) => {
  // Calculate timeline boundaries and total days
  const { timelineStart, timelineEnd } = calculateTimelineBoundaries(items);
  const totalDays = calculateTotalDays(timelineStart, timelineEnd);
  
  // Zoom state management
  const [zoomLevel, setZoomLevel] = useState(ZOOM_LEVELS.DEFAULT);
  const [centerPercent, setCenterPercent] = useState(50); // Center of zoom view
  
  // Ref for timeline container to track mouse position
  const timelineContainerRef = useRef(null);
  
  // Calculate visible range based on zoom level
  const { visibleStart, visibleEnd } = calculateVisibleRange(
    timelineStart, 
    timelineEnd, 
    zoomLevel, 
    centerPercent
  );
  const visibleDays = calculateTotalDays(visibleStart, visibleEnd);
  
  // Assign items to lanes using the provided algorithm
  const lanes = assignLanes(items);
  
  // Zoom control handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => clampZoomLevel(prev + ZOOM_LEVELS.STEP));
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => clampZoomLevel(prev - ZOOM_LEVELS.STEP));
  }, []);
  
  const handleZoomReset = useCallback(() => {
    setZoomLevel(ZOOM_LEVELS.DEFAULT);
    setCenterPercent(50);
  }, []);
  
  const handleZoomChange = useCallback((newZoomLevel) => {
    setZoomLevel(clampZoomLevel(newZoomLevel));
  }, []);
  
  // Mouse wheel zoom handler
  const handleWheelZoom = useCallback((event) => {
    if (timelineContainerRef.current) {
      handleMouseWheelZoom(
        event,
        timelineContainerRef.current,
        timelineStart,
        timelineEnd,
        zoomLevel,
        handleZoomChange,
        setCenterPercent
      );
    }
  }, [timelineStart, timelineEnd, zoomLevel, handleZoomChange]);
  
  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '=':
          case '+':
            event.preventDefault();
            handleZoomIn();
            break;
          case '-':
            event.preventDefault();
            handleZoomOut();
            break;
          case '0':
            event.preventDefault();
            handleZoomReset();
            break;
          default:
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleZoomReset]);
  
  // Mouse wheel zoom event listener
  useEffect(() => {
    const container = timelineContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheelZoom, { passive: false });
      return () => container.removeEventListener('wheel', handleWheelZoom);
    }
  }, [handleWheelZoom]);

  // Handle item updates from drag operations
  const handleItemUpdate = useCallback((itemId, newDates) => {
    console.log('TimelineContainer handleItemUpdate called:', { itemId, newDates });
    if (onItemsChange) {
      const updatedItems = items.map(item => 
        item.id === itemId 
          ? { ...item, ...newDates }
          : item
      );
      console.log('Calling onItemsChange with updated items');
      onItemsChange(updatedItems);
    } else {
      console.log('onItemsChange is not available');
    }
  }, [items, onItemsChange]);

  return (
    <div className="timeline-container" ref={timelineContainerRef}>
      <TimelineHeader 
        itemCount={items.length} 
        laneCount={lanes.length}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onZoomChange={handleZoomChange}
      />
      
      <TimelineRuler 
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        visibleStart={visibleStart}
        visibleEnd={visibleEnd}
        visibleDays={visibleDays}
        totalDays={totalDays}
        zoomLevel={zoomLevel}
      />
      
      <TimelineLanesContainer 
        lanes={lanes}
        timelineStart={timelineStart}
        visibleStart={visibleStart}
        visibleDays={visibleDays}
        totalDays={totalDays}
        zoomLevel={zoomLevel}
        onItemUpdate={handleItemUpdate}
      />
    </div>
  );
};

export default TimelineContainer;

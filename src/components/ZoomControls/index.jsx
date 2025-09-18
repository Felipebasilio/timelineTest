import React from 'react';
import { ZOOM_LEVELS, clampZoomLevel, formatZoomLevel } from '../../utils.js';

/**
 * ZoomControls component - provides zoom in/out controls and zoom level display
 * @param {Object} props - Component props
 * @param {number} props.zoomLevel - Current zoom level
 * @param {Function} props.onZoomIn - Callback for zoom in action
 * @param {Function} props.onZoomOut - Callback for zoom out action
 * @param {Function} props.onZoomReset - Callback for zoom reset action
 * @param {Function} props.onZoomChange - Callback for direct zoom level change
 */
const ZoomControls = ({ 
  zoomLevel, 
  onZoomIn, 
  onZoomOut, 
  onZoomReset, 
  onZoomChange 
}) => {
  const handleZoomIn = () => {
    const newZoomLevel = clampZoomLevel(zoomLevel + ZOOM_LEVELS.STEP);
    onZoomChange(newZoomLevel);
  };

  const handleZoomOut = () => {
    const newZoomLevel = clampZoomLevel(zoomLevel - ZOOM_LEVELS.STEP);
    onZoomChange(newZoomLevel);
  };

  const handleZoomReset = () => {
    onZoomReset();
  };

  const handleSliderChange = (event) => {
    const newZoomLevel = parseFloat(event.target.value);
    onZoomChange(newZoomLevel);
  };

  const isZoomInDisabled = zoomLevel >= ZOOM_LEVELS.MAX;
  const isZoomOutDisabled = zoomLevel <= ZOOM_LEVELS.MIN;
  const isResetDisabled = zoomLevel === ZOOM_LEVELS.DEFAULT;

  return (
    <div className="zoom-controls">
      <div className="zoom-controls-group">
        <button
          className="zoom-button zoom-out"
          onClick={handleZoomOut}
          disabled={isZoomOutDisabled}
          title="Zoom Out (Ctrl + -)"
          aria-label="Zoom out"
        >
          <span className="zoom-icon">−</span>
        </button>
        
        <div className="zoom-level-display">
          <span className="zoom-level-text">{formatZoomLevel(zoomLevel)}</span>
        </div>
        
        <button
          className="zoom-button zoom-in"
          onClick={handleZoomIn}
          disabled={isZoomInDisabled}
          title="Zoom In (Ctrl + +)"
          aria-label="Zoom in"
        >
          <span className="zoom-icon">+</span>
        </button>
      </div>
      
      <div className="zoom-controls-group">
        <input
          type="range"
          min={ZOOM_LEVELS.MIN}
          max={ZOOM_LEVELS.MAX}
          step={ZOOM_LEVELS.STEP}
          value={zoomLevel}
          onChange={handleSliderChange}
          className="zoom-slider"
          title="Zoom Level"
          aria-label="Zoom level slider"
        />
      </div>
      
      <div className="zoom-controls-group">
        <button
          className="zoom-button zoom-reset"
          onClick={handleZoomReset}
          disabled={isResetDisabled}
          title="Reset Zoom (Ctrl + 0)"
          aria-label="Reset zoom"
        >
          <span className="zoom-icon">⌂</span>
        </button>
      </div>
      
      <div className="zoom-controls-group">
        <div className="mouse-zoom-hint">
          <span className="mouse-zoom-icon">🖱️</span>
          <span className="mouse-zoom-text">Ctrl + scroll to zoom</span>
        </div>
      </div>
    </div>
  );
};

export default ZoomControls;

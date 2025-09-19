import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  calculateItemPosition, 
  calculateItemPositionWithZoom, 
  createItemTooltip,
  validateItemName,
  sanitizeItemName,
  handleInlineEditKeyDown,
  createDebouncedFunction
} from '../../utils.js';

/**
 * TimelineItem component - represents a single item on the timeline with zoom support and drag functionality
 * @param {Object} props - Component props
 * @param {Object} props.item - Timeline item data
 * @param {Date} props.timelineStart - Original timeline start date
 * @param {Date} props.visibleStart - Visible timeline start date (for zoom)
 * @param {number} props.visibleDays - Number of visible days (for zoom)
 * @param {number} props.zoomLevel - Current zoom level
 * @param {Function} props.onItemUpdate - Callback when item dates are updated
 */
const TimelineItem = ({ item, timelineStart, visibleStart, visibleDays, zoomLevel, onItemUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null); // 'start' or 'end'
  const [dragStartX, setDragStartX] = useState(0);
  const [originalDates, setOriginalDates] = useState({ start: item.start, end: item.end });
  const [previewDates, setPreviewDates] = useState({ start: item.start, end: item.end });
  
  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.name);
  const [validationError, setValidationError] = useState(null);
  
  const itemRef = useRef(null);
  const inputRef = useRef(null);

  // Use zoom-aware positioning if zoom is not at default level
  const style = zoomLevel === 1.0 
    ? calculateItemPosition(item, timelineStart, visibleDays)
    : calculateItemPositionWithZoom(item, timelineStart, visibleStart, visibleDays);
    
  const tooltip = createItemTooltip(item);

  // Calculate pixel to date conversion
  const getDateFromPixel = useCallback((pixelX, containerWidth) => {
    const totalDays = calculateTotalDays(timelineStart, new Date(item.end));
    const daysPerPixel = totalDays / containerWidth;
    const daysFromStart = (pixelX / containerWidth) * totalDays;
    const newDate = new Date(timelineStart);
    newDate.setDate(newDate.getDate() + Math.round(daysFromStart));
    return newDate;
  }, [timelineStart, item.end]);

  // Calculate total days between two dates
  const calculateTotalDays = (start, end) => {
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  // Format date to YYYY-MM-DD string
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Parse date string to Date object
  const parseDate = (dateString) => {
    return new Date(dateString + 'T00:00:00');
  };

  // Handle mouse down on drag handles
  const handleMouseDown = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Mouse down on drag handle:', type);
    
    setIsDragging(true);
    setDragType(type);
    setDragStartX(e.clientX);
    setOriginalDates({ start: item.start, end: item.end });
  }, [item.start, item.end]);

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !itemRef.current) return;

    console.log('Mouse move during drag, isDragging:', isDragging, 'dragType:', dragType);

    const deltaX = e.clientX - dragStartX;
    
    // Simple approach: 50 pixels = 1 day
    const daysDelta = Math.round(deltaX / 50);
    
    console.log('Simple drag info:', {
      deltaX,
      daysDelta,
      dragType
    });
    
    if (Math.abs(daysDelta) < 1) {
      console.log('Days delta too small:', daysDelta);
      return;
    }

    const startDate = parseDate(originalDates.start);
    const endDate = parseDate(originalDates.end);
    
    let newStart = new Date(startDate);
    let newEnd = new Date(endDate);
    
    if (dragType === 'start') {
      newStart.setDate(startDate.getDate() + daysDelta);
      // Prevent start from going beyond end
      if (newStart >= endDate) {
        newStart = new Date(endDate);
        newStart.setDate(newStart.getDate() - 1);
      }
    } else if (dragType === 'end') {
      newEnd.setDate(endDate.getDate() + daysDelta);
      // Prevent end from going before start
      if (newEnd <= startDate) {
        newEnd = new Date(startDate);
        newEnd.setDate(newEnd.getDate() + 1);
      }
    }
    
    // Update preview dates instead of immediately updating the item
    const newPreviewDates = {
      start: formatDate(newStart),
      end: formatDate(newEnd)
    };
    
    console.log('Preview dates:', {
      original: { start: originalDates.start, end: originalDates.end },
      preview: newPreviewDates
    });
    
    setPreviewDates(newPreviewDates);
  }, [isDragging, dragType, dragStartX, originalDates]);

  // Handle mouse up to end drag
  const handleMouseUp = useCallback(() => {
    console.log('Mouse up - ending drag');
    
    // Apply the preview dates to the actual item
    if (onItemUpdate && (previewDates.start !== originalDates.start || previewDates.end !== originalDates.end)) {
      console.log('Applying preview dates:', previewDates);
      onItemUpdate(item.id, previewDates);
    }
    
    setIsDragging(false);
    setDragType(null);
    setDragStartX(0);
    setPreviewDates({ start: item.start, end: item.end });
  }, [onItemUpdate, previewDates, originalDates, item.id, item.start, item.end]);

  // Add/remove event listeners based on dragging state
  React.useEffect(() => {
    if (isDragging) {
      console.log('Adding event listeners for drag');
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      console.log('Removing event listeners');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // ===== INLINE EDITING FUNCTIONS =====

  // Auto-save function with debouncing
  const debouncedSave = useCallback(
    createDebouncedFunction((value) => {
      if (value !== item.name) {
        handleSave(value);
      }
    }, 2000),
    [item.name]
  );

  // Handle starting edit mode
  const handleStartEdit = useCallback((e) => {
    e.stopPropagation();
    if (!isDragging && !isEditing) {
      setIsEditing(true);
      setEditValue(item.name);
      setValidationError(null);
    }
  }, [isDragging, isEditing, item.name]);

  // Handle saving changes
  const handleSave = useCallback((value = editValue) => {
    const sanitizedValue = sanitizeItemName(value);
    const validation = validateItemName(sanitizedValue);
    
    if (validation.isValid) {
      if (sanitizedValue !== item.name && onItemUpdate) {
        onItemUpdate(item.id, { name: sanitizedValue });
      }
      setIsEditing(false);
      setValidationError(null);
    } else {
      setValidationError(validation.error);
    }
  }, [editValue, item.name, item.id, onItemUpdate]);

  // Handle canceling edit
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditValue(item.name);
    setValidationError(null);
  }, [item.name]);

  // Handle input change
  const handleInputChange = useCallback((event) => {
    const value = event.target.value;
    setEditValue(value);
    
    // Clear validation error as user types
    if (validationError) {
      setValidationError(null);
    }
    
    // Trigger debounced save
    debouncedSave(value);
  }, [validationError, debouncedSave]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event) => {
    const handled = handleInlineEditKeyDown(event, handleSave, handleCancel);
    if (handled) {
      event.stopPropagation();
    }
  }, [handleSave, handleCancel]);

  // Handle blur (click outside)
  const handleBlur = useCallback(() => {
    handleSave();
  }, [handleSave]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Update edit value when item name changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditValue(item.name);
    }
  }, [item.name, isEditing]);

  return (
    <div
      ref={itemRef}
      className={`timeline-item ${isDragging ? 'dragging' : ''}`}
      style={style}
      title={tooltip}
    >
      {/* Start drag handle */}
      <div 
        className="drag-handle drag-handle-start"
        onMouseDown={(e) => {
          console.log('Start handle clicked');
          handleMouseDown(e, 'start');
        }}
        style={{ 
          position: 'absolute', 
          left: 0, 
          top: 0, 
          bottom: 0, 
          width: '8px',
          background: 'rgba(255, 255, 255, 0.3)',
          cursor: 'ew-resize',
          zIndex: 2
        }}
      />
      
      <div className="item-content">
        <div className="item-name" onClick={handleStartEdit}>
          {isEditing ? (
            <div className="inline-edit-container">
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className={`inline-edit-input ${validationError ? 'error' : ''}`}
                maxLength={100}
                placeholder="Enter item name..."
              />
              {validationError && (
                <div className="validation-error">{validationError}</div>
              )}
            </div>
          ) : (
            <span className="item-name-text">{item.name}</span>
          )}
        </div>
        <div className="item-dates">
          {isDragging ? (
            <div className="preview-dates">
              <div className="preview-start">Start: {previewDates.start}</div>
              <div className="preview-end">End: {previewDates.end}</div>
            </div>
          ) : (
            <div className="normal-dates">
              <div className="date-start">{item.start}</div>
              <div className="date-end">{item.end}</div>
            </div>
          )}
        </div>
      </div>
      
      {/* End drag handle */}
      <div 
        className="drag-handle drag-handle-end"
        onMouseDown={(e) => {
          console.log('End handle clicked');
          handleMouseDown(e, 'end');
        }}
        style={{ 
          position: 'absolute', 
          right: 0, 
          top: 0, 
          bottom: 0, 
          width: '8px',
          background: 'rgba(255, 255, 255, 0.3)',
          cursor: 'ew-resize',
          zIndex: 2
        }}
      />
    </div>
  );
};

export default TimelineItem;

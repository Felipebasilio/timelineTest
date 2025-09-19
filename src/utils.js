/**
 * Utility functions for timeline calculations and date operations
 */

export const DAY_IN_MS = 1000 * 60 * 60 * 24;

/**
 * Calculates the number of days between two dates
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @returns {number} Number of days between the dates
 */
export const calculateDaysBetween = (startDate, endDate) => {
  return Math.ceil((endDate - startDate) / DAY_IN_MS);
};

/**
 * Calculates timeline boundaries with padding
 * @param {Array} items - Array of timeline items
 * @param {number} paddingDays - Number of days to add as padding (default: 2)
 * @returns {Object} Object containing timelineStart and timelineEnd dates
 */
export const calculateTimelineBoundaries = (items, paddingDays = 2) => {
  const allDates = items.flatMap(item => [item.start, item.end]);
  const minDate = new Date(Math.min(...allDates.map(date => new Date(date))));
  const maxDate = new Date(Math.max(...allDates.map(date => new Date(date))));
  
  const timelineStart = new Date(minDate);
  timelineStart.setDate(timelineStart.getDate() - paddingDays);
  
  const timelineEnd = new Date(maxDate);
  timelineEnd.setDate(timelineEnd.getDate() + paddingDays);
  
  return { timelineStart, timelineEnd };
};

/**
 * Calculates the total number of days in the timeline
 * @param {Date} timelineStart - Start date of the timeline
 * @param {Date} timelineEnd - End date of the timeline
 * @returns {number} Total number of days
 */
export const calculateTotalDays = (timelineStart, timelineEnd) => {
  return calculateDaysBetween(timelineStart, timelineEnd);
};

/**
 * Calculates the position and width for a timeline item
 * @param {Object} item - Timeline item with start and end dates
 * @param {Date} timelineStart - Start date of the timeline
 * @param {number} totalDays - Total number of days in the timeline
 * @returns {Object} Object containing left and width percentages
 */
export const calculateItemPosition = (item, timelineStart, totalDays) => {
  const startDate = new Date(item.start);
  const endDate = new Date(item.end);
  
  const startOffset = calculateDaysBetween(timelineStart, startDate);
  const duration = calculateDaysBetween(startDate, endDate) + 1; // +1 to include end date
  
  const leftPercent = (startOffset / totalDays) * 100;
  const widthPercent = (duration / totalDays) * 100;
  
  return {
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
  };
};

/**
 * Generates month markers for the timeline ruler
 * @param {Date} timelineStart - Start date of the timeline
 * @param {Date} timelineEnd - End date of the timeline
 * @param {number} totalDays - Total number of days in the timeline
 * @returns {Array} Array of month marker objects with date and left position
 */
export const generateMonthMarkers = (timelineStart, timelineEnd, totalDays) => {
  const markers = [];
  const current = new Date(timelineStart);
  current.setDate(1); // Start at beginning of month
  
  while (current <= timelineEnd) {
    const offset = calculateDaysBetween(timelineStart, current);
    const leftPercent = (offset / totalDays) * 100;
    
    markers.push({
      date: new Date(current),
      left: leftPercent
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return markers;
};

/**
 * Formats a date for display in month markers
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatMonthLabel = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

/**
 * Creates a tooltip text for a timeline item
 * @param {Object} item - Timeline item
 * @returns {string} Tooltip text
 */
export const createItemTooltip = (item) => {
  return `${item.name} (${item.start} to ${item.end})`;
};

// ===== ZOOM FUNCTIONALITY =====

/**
 * Zoom levels configuration
 */
export const ZOOM_LEVELS = {
  MIN: 0.1,    // 10% - very zoomed out
  MAX: 5.0,    // 500% - very zoomed in
  DEFAULT: 1.0, // 100% - normal view
  STEP: 0.1    // 10% increment per zoom step
};

/**
 * Calculates the visible timeline range based on zoom level and center point
 * @param {Date} timelineStart - Original timeline start date
 * @param {Date} timelineEnd - Original timeline end date
 * @param {number} zoomLevel - Current zoom level (1.0 = 100%)
 * @param {number} centerPercent - Center point as percentage (0-100)
 * @returns {Object} Object containing visibleStart and visibleEnd dates
 */
export const calculateVisibleRange = (timelineStart, timelineEnd, zoomLevel, centerPercent = 50) => {
  const totalDays = calculateDaysBetween(timelineStart, timelineEnd);
  const visibleDays = totalDays / zoomLevel;
  
  // Calculate center point in days from timeline start
  const centerDays = (totalDays * centerPercent) / 100;
  
  // Calculate visible range
  const visibleStartDays = centerDays - (visibleDays / 2);
  const visibleEndDays = centerDays + (visibleDays / 2);
  
  const visibleStart = new Date(timelineStart);
  visibleStart.setDate(visibleStart.getDate() + Math.max(0, visibleStartDays));
  
  const visibleEnd = new Date(timelineStart);
  visibleEnd.setDate(visibleEnd.getDate() + Math.min(totalDays, visibleEndDays));
  
  return { visibleStart, visibleEnd, visibleDays };
};

/**
 * Calculates the position and width for a timeline item with zoom support
 * @param {Object} item - Timeline item with start and end dates
 * @param {Date} timelineStart - Original timeline start date
 * @param {Date} visibleStart - Visible timeline start date
 * @param {number} visibleDays - Number of visible days
 * @returns {Object} Object containing left and width percentages
 */
export const calculateItemPositionWithZoom = (item, timelineStart, visibleStart, visibleDays) => {
  const startDate = new Date(item.start);
  const endDate = new Date(item.end);
  
  const startOffset = calculateDaysBetween(visibleStart, startDate);
  const duration = calculateDaysBetween(startDate, endDate) + 1; // +1 to include end date
  
  const leftPercent = (startOffset / visibleDays) * 100;
  const widthPercent = (duration / visibleDays) * 100;
  
  return {
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
  };
};

/**
 * Generates month markers for the timeline ruler with zoom support
 * @param {Date} visibleStart - Visible timeline start date
 * @param {Date} visibleEnd - Visible timeline end date
 * @param {number} visibleDays - Number of visible days
 * @returns {Array} Array of month marker objects with date and left position
 */
export const generateMonthMarkersWithZoom = (visibleStart, visibleEnd, visibleDays) => {
  const markers = [];
  const current = new Date(visibleStart);
  current.setDate(1); // Start at beginning of month
  
  while (current <= visibleEnd) {
    const offset = calculateDaysBetween(visibleStart, current);
    const leftPercent = (offset / visibleDays) * 100;
    
    markers.push({
      date: new Date(current),
      left: leftPercent
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return markers;
};

/**
 * Clamps zoom level within defined bounds
 * @param {number} zoomLevel - Zoom level to clamp
 * @returns {number} Clamped zoom level
 */
export const clampZoomLevel = (zoomLevel) => {
  return Math.max(ZOOM_LEVELS.MIN, Math.min(ZOOM_LEVELS.MAX, zoomLevel));
};

/**
 * Formats zoom level for display
 * @param {number} zoomLevel - Zoom level to format
 * @returns {string} Formatted zoom percentage
 */
export const formatZoomLevel = (zoomLevel) => {
  return `${Math.round(zoomLevel * 100)}%`;
};

// ===== MOUSE WHEEL ZOOM FUNCTIONALITY =====

/**
 * Mouse wheel zoom configuration
 */
export const MOUSE_ZOOM_CONFIG = {
  WHEEL_SENSITIVITY: 0.001, // How sensitive the wheel zoom is
  MIN_ZOOM: ZOOM_LEVELS.MIN,
  MAX_ZOOM: ZOOM_LEVELS.MAX,
  ZOOM_STEP: 0.1, // Step size for wheel zoom
  DEBOUNCE_DELAY: 16 // Debounce delay in milliseconds (60fps)
};

/**
 * Calculates the mouse position percentage within a container
 * @param {MouseEvent} event - Mouse event
 * @param {HTMLElement} container - Container element
 * @returns {number} Mouse position as percentage (0-100)
 */
export const getMousePositionPercentage = (event, container) => {
  const rect = container.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const percentage = (x / rect.width) * 100;
  return Math.max(0, Math.min(100, percentage));
};

/**
 * Calculates the visible timeline range based on zoom level and mouse position
 * @param {Date} timelineStart - Original timeline start date
 * @param {Date} timelineEnd - Original timeline end date
 * @param {number} zoomLevel - Current zoom level (1.0 = 100%)
 * @param {number} mousePercent - Mouse position as percentage (0-100)
 * @returns {Object} Object containing visibleStart and visibleEnd dates
 */
export const calculateVisibleRangeWithMouse = (timelineStart, timelineEnd, zoomLevel, mousePercent) => {
  const totalDays = calculateDaysBetween(timelineStart, timelineEnd);
  const visibleDays = totalDays / zoomLevel;
  
  // Calculate center point based on mouse position
  const centerDays = (totalDays * mousePercent) / 100;
  
  // Calculate visible range centered on mouse position
  const visibleStartDays = centerDays - (visibleDays / 2);
  const visibleEndDays = centerDays + (visibleDays / 2);
  
  const visibleStart = new Date(timelineStart);
  visibleStart.setDate(visibleStart.getDate() + Math.max(0, visibleStartDays));
  
  const visibleEnd = new Date(timelineStart);
  visibleEnd.setDate(visibleEnd.getDate() + Math.min(totalDays, visibleEndDays));
  
  return { visibleStart, visibleEnd, visibleDays };
};

/**
 * Calculates new zoom level based on wheel delta
 * @param {number} currentZoom - Current zoom level
 * @param {number} deltaY - Wheel delta Y value
 * @param {number} sensitivity - Zoom sensitivity (optional)
 * @returns {number} New zoom level
 */
export const calculateWheelZoom = (currentZoom, deltaY, sensitivity = MOUSE_ZOOM_CONFIG.WHEEL_SENSITIVITY) => {
  const zoomFactor = 1 - (deltaY * sensitivity);
  const newZoom = currentZoom * zoomFactor;
  return clampZoomLevel(newZoom);
};

/**
 * Handles mouse wheel zoom event
 * @param {WheelEvent} event - Wheel event
 * @param {HTMLElement} container - Timeline container element
 * @param {Date} timelineStart - Original timeline start date
 * @param {Date} timelineEnd - Original timeline end date
 * @param {number} currentZoom - Current zoom level
 * @param {Function} onZoomChange - Callback for zoom change
 * @param {Function} onCenterChange - Callback for center position change
 */
export const handleMouseWheelZoom = (event, container, timelineStart, timelineEnd, currentZoom, onZoomChange, onCenterChange) => {
  // Prevent default scroll behavior
  event.preventDefault();
  
  // Only handle wheel events with Ctrl/Cmd key (standard zoom behavior)
  if (!event.ctrlKey && !event.metaKey) {
    return;
  }
  
  // Calculate new zoom level
  const newZoom = calculateWheelZoom(currentZoom, event.deltaY);
  
  // Don't update if zoom level hasn't changed significantly
  if (Math.abs(newZoom - currentZoom) < 0.01) {
    return;
  }
  
  // Calculate mouse position percentage
  const mousePercent = getMousePositionPercentage(event, container);
  
  // Update zoom and center position
  onZoomChange(newZoom);
  onCenterChange(mousePercent);
};

// ===== INLINE EDITING FUNCTIONALITY =====

/**
 * Inline editing configuration
 */
export const INLINE_EDIT_CONFIG = {
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 100,
  DEBOUNCE_DELAY: 300, // Delay before saving changes
  AUTO_SAVE_DELAY: 2000 // Auto-save after 2 seconds of inactivity
};

/**
 * Validates a timeline item name
 * @param {string} name - Name to validate
 * @returns {Object} Validation result with isValid and error message
 */
export const validateItemName = (name) => {
  const trimmedName = name.trim();
  
  if (trimmedName.length < INLINE_EDIT_CONFIG.MIN_NAME_LENGTH) {
    return {
      isValid: false,
      error: `Name must be at least ${INLINE_EDIT_CONFIG.MIN_NAME_LENGTH} character long`
    };
  }
  
  if (trimmedName.length > INLINE_EDIT_CONFIG.MAX_NAME_LENGTH) {
    return {
      isValid: false,
      error: `Name must be no more than ${INLINE_EDIT_CONFIG.MAX_NAME_LENGTH} characters long`
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

/**
 * Sanitizes a timeline item name
 * @param {string} name - Name to sanitize
 * @returns {string} Sanitized name
 */
export const sanitizeItemName = (name) => {
  return name.trim().replace(/\s+/g, ' '); // Remove extra whitespace
};

/**
 * Handles keyboard events for inline editing
 * @param {KeyboardEvent} event - Keyboard event
 * @param {Function} onSave - Callback for saving changes
 * @param {Function} onCancel - Callback for canceling editing
 * @returns {boolean} Whether the event was handled
 */
export const handleInlineEditKeyDown = (event, onSave, onCancel) => {
  switch (event.key) {
    case 'Enter':
      event.preventDefault();
      onSave();
      return true;
    case 'Escape':
      event.preventDefault();
      onCancel();
      return true;
    case 'Tab':
      // Allow tab to work normally for accessibility
      return false;
    default:
      return false;
  }
};

/**
 * Creates a debounced function for auto-saving
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const createDebouncedFunction = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

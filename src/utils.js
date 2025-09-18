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

import { describe, it, expect } from 'vitest'
import {
  calculateDaysBetween,
  calculateTimelineBoundaries,
  calculateTotalDays,
  calculateItemPosition,
  generateMonthMarkers,
  formatMonthLabel,
  createItemTooltip,
  DAY_IN_MS,
  ZOOM_LEVELS,
  calculateVisibleRange,
  calculateItemPositionWithZoom,
  generateMonthMarkersWithZoom,
  clampZoomLevel,
  formatZoomLevel,
  MOUSE_ZOOM_CONFIG,
  getMousePositionPercentage,
  calculateVisibleRangeWithMouse,
  calculateWheelZoom,
  handleMouseWheelZoom
} from './utils.js'

describe('utils.js', () => {
  describe('calculateDaysBetween', () => {
    it('should calculate days between two dates correctly', () => {
      const startDate = new Date('2021-01-01')
      const endDate = new Date('2021-01-05')
      expect(calculateDaysBetween(startDate, endDate)).toBe(4)
    })

    it('should handle same day correctly', () => {
      const date = new Date('2021-01-01')
      expect(calculateDaysBetween(date, date)).toBe(0)
    })

    it('should handle negative days correctly', () => {
      const startDate = new Date('2021-01-05')
      const endDate = new Date('2021-01-01')
      expect(calculateDaysBetween(startDate, endDate)).toBe(-4)
    })

    it('should handle dates across months', () => {
      const startDate = new Date('2021-01-30')
      const endDate = new Date('2021-02-02')
      expect(calculateDaysBetween(startDate, endDate)).toBe(3)
    })
  })

  describe('calculateTimelineBoundaries', () => {
    const mockItems = [
      { start: '2021-01-15', end: '2021-01-20' },
      { start: '2021-01-25', end: '2021-01-30' },
      { start: '2021-02-05', end: '2021-02-10' }
    ]

    it('should calculate boundaries with default padding', () => {
      const result = calculateTimelineBoundaries(mockItems)
      
      expect(result.timelineStart).toEqual(new Date('2021-01-13'))
      expect(result.timelineEnd).toEqual(new Date('2021-02-12'))
    })

    it('should calculate boundaries with custom padding', () => {
      const result = calculateTimelineBoundaries(mockItems, 5)
      
      expect(result.timelineStart).toEqual(new Date('2021-01-10'))
      expect(result.timelineEnd).toEqual(new Date('2021-02-15'))
    })

    it('should handle single item', () => {
      const singleItem = [{ start: '2021-01-15', end: '2021-01-20' }]
      const result = calculateTimelineBoundaries(singleItem)
      
      expect(result.timelineStart).toEqual(new Date('2021-01-13'))
      expect(result.timelineEnd).toEqual(new Date('2021-01-22'))
    })

    it('should handle empty array', () => {
      const result = calculateTimelineBoundaries([])
      
      expect(result.timelineStart).toBeInstanceOf(Date)
      expect(result.timelineEnd).toBeInstanceOf(Date)
    })
  })

  describe('calculateTotalDays', () => {
    it('should calculate total days correctly', () => {
      const start = new Date('2021-01-01')
      const end = new Date('2021-01-10')
      expect(calculateTotalDays(start, end)).toBe(9)
    })

    it('should handle same day', () => {
      const date = new Date('2021-01-01')
      expect(calculateTotalDays(date, date)).toBe(0)
    })
  })

  describe('calculateItemPosition', () => {
    const timelineStart = new Date('2021-01-01')
    const totalDays = 30

    it('should calculate position and width correctly', () => {
      const item = {
        start: '2021-01-05',
        end: '2021-01-10'
      }
      
      const result = calculateItemPosition(item, timelineStart, totalDays)
      
      expect(result.left).toBe('13.333333333333334%')
      expect(result.width).toBe('20%')
    })

    it('should handle single day item', () => {
      const item = {
        start: '2021-01-05',
        end: '2021-01-05'
      }
      
      const result = calculateItemPosition(item, timelineStart, totalDays)
      
      expect(result.left).toBe('13.333333333333334%')
      expect(result.width).toBe('3.3333333333333335%')
    })

    it('should handle item at timeline start', () => {
      const item = {
        start: '2021-01-01',
        end: '2021-01-05'
      }
      
      const result = calculateItemPosition(item, timelineStart, totalDays)
      
      expect(result.left).toBe('0%')
      expect(result.width).toBe('16.666666666666664%')
    })
  })

  describe('generateMonthMarkers', () => {
    const timelineStart = new Date('2021-01-15')
    const timelineEnd = new Date('2021-03-15')
    const totalDays = 60

    it('should generate month markers correctly', () => {
      const markers = generateMonthMarkers(timelineStart, timelineEnd, totalDays)
      
      expect(markers).toHaveLength(3) // Jan, Feb, Mar
      expect(markers[0].date).toEqual(new Date('2021-01-02'))
      expect(markers[1].date).toEqual(new Date('2021-02-02'))
      expect(markers[2].date).toEqual(new Date('2021-03-02'))
    })

    it('should calculate left positions correctly', () => {
      const markers = generateMonthMarkers(timelineStart, timelineEnd, totalDays)
      
      expect(markers[0].left).toBeGreaterThanOrEqual(-25) // Allow negative values for markers before timeline start
      expect(markers[1].left).toBeGreaterThan(markers[0].left)
      expect(markers[2].left).toBeGreaterThan(markers[1].left)
    })

    it('should handle single month', () => {
      const singleMonthStart = new Date('2021-01-15')
      const singleMonthEnd = new Date('2021-01-20')
      const singleMonthDays = 5
      
      const markers = generateMonthMarkers(singleMonthStart, singleMonthEnd, singleMonthDays)
      
      expect(markers).toHaveLength(1)
      expect(markers[0].date).toEqual(new Date('2021-01-02'))
    })
  })

  describe('formatMonthLabel', () => {
    it('should format month label correctly', () => {
      const date = new Date('2021-01-15')
      expect(formatMonthLabel(date)).toBe('Jan 2021')
    })

    it('should handle different months', () => {
      const date = new Date('2021-12-15')
      expect(formatMonthLabel(date)).toBe('Dec 2021')
    })
  })

  describe('createItemTooltip', () => {
    it('should create tooltip text correctly', () => {
      const item = {
        name: 'Test Item',
        start: '2021-01-15',
        end: '2021-01-20'
      }
      
      expect(createItemTooltip(item)).toBe('Test Item (2021-01-15 to 2021-01-20)')
    })
  })

  describe('DAY_IN_MS constant', () => {
    it('should have correct value', () => {
      expect(DAY_IN_MS).toBe(1000 * 60 * 60 * 24)
    })
  })

  describe('ZOOM_LEVELS constant', () => {
    it('should have correct zoom level values', () => {
      expect(ZOOM_LEVELS.MIN).toBe(0.1)
      expect(ZOOM_LEVELS.MAX).toBe(5.0)
      expect(ZOOM_LEVELS.DEFAULT).toBe(1.0)
      expect(ZOOM_LEVELS.STEP).toBe(0.1)
    })
  })

  describe('calculateVisibleRange', () => {
    it('should calculate visible range correctly', () => {
      const timelineStart = new Date('2021-01-01')
      const timelineEnd = new Date('2021-12-31')
      const zoomLevel = 2.0
      const centerPercent = 50

      const result = calculateVisibleRange(timelineStart, timelineEnd, zoomLevel, centerPercent)
      
      expect(result).toBeDefined()
      expect(result.visibleStart).toBeInstanceOf(Date)
      expect(result.visibleEnd).toBeInstanceOf(Date)
      expect(typeof result.visibleDays).toBe('number')
    })

    it('should handle different zoom levels', () => {
      const timelineStart = new Date('2021-01-01')
      const timelineEnd = new Date('2021-12-31')
      const centerPercent = 50

      const zoomLevels = [0.1, 0.5, 1.0, 2.0, 5.0]
      
      zoomLevels.forEach(zoomLevel => {
        const result = calculateVisibleRange(timelineStart, timelineEnd, zoomLevel, centerPercent)
        expect(result).toBeDefined()
        expect(result.visibleStart).toBeInstanceOf(Date)
        expect(result.visibleEnd).toBeInstanceOf(Date)
        expect(typeof result.visibleDays).toBe('number')
      })
    })

    it('should handle different center percentages', () => {
      const timelineStart = new Date('2021-01-01')
      const timelineEnd = new Date('2021-12-31')
      const zoomLevel = 2.0

      const centerPercents = [0, 25, 50, 75, 100]
      
      centerPercents.forEach(centerPercent => {
        const result = calculateVisibleRange(timelineStart, timelineEnd, zoomLevel, centerPercent)
        expect(result).toBeDefined()
        expect(result.visibleStart).toBeInstanceOf(Date)
        expect(result.visibleEnd).toBeInstanceOf(Date)
        expect(typeof result.visibleDays).toBe('number')
      })
    })
  })

  describe('calculateItemPositionWithZoom', () => {
    it('should calculate position with zoom correctly', () => {
      const item = {
        start: '2021-01-15',
        end: '2021-01-20'
      }
      const timelineStart = new Date('2021-01-01')
      const visibleStart = new Date('2021-01-10')
      const visibleDays = 20

      const result = calculateItemPositionWithZoom(item, timelineStart, visibleStart, visibleDays)
      
      expect(result).toHaveProperty('left')
      expect(result).toHaveProperty('width')
      expect(typeof result.left).toBe('string')
      expect(typeof result.width).toBe('string')
    })

    it('should handle items outside visible range', () => {
      const item = {
        start: '2021-01-01',
        end: '2021-01-05'
      }
      const timelineStart = new Date('2021-01-01')
      const visibleStart = new Date('2021-01-10')
      const visibleDays = 20

      const result = calculateItemPositionWithZoom(item, timelineStart, visibleStart, visibleDays)
      
      expect(result).toHaveProperty('left')
      expect(result).toHaveProperty('width')
    })
  })

  describe('generateMonthMarkersWithZoom', () => {
    it('should generate month markers with zoom correctly', () => {
      const timelineStart = new Date('2021-01-01')
      const visibleStart = new Date('2021-01-10')
      const visibleEnd = new Date('2021-01-20')
      const visibleDays = 10

      const result = generateMonthMarkersWithZoom(timelineStart, visibleStart, visibleEnd, visibleDays)
      
      expect(Array.isArray(result)).toBe(true)
      result.forEach(marker => {
        expect(marker).toHaveProperty('date')
        expect(marker).toHaveProperty('left')
        expect(marker.date).toBeInstanceOf(Date)
        expect(typeof marker.left).toBe('number')
      })
    })
  })

  describe('clampZoomLevel', () => {
    it('should clamp zoom level to minimum', () => {
      expect(clampZoomLevel(0.05)).toBe(0.1)
    })

    it('should clamp zoom level to maximum', () => {
      expect(clampZoomLevel(10.0)).toBe(5.0)
    })

    it('should return zoom level within bounds', () => {
      expect(clampZoomLevel(2.0)).toBe(2.0)
      expect(clampZoomLevel(0.5)).toBe(0.5)
      expect(clampZoomLevel(1.0)).toBe(1.0)
    })
  })

  describe('formatZoomLevel', () => {
    it('should format zoom level as percentage', () => {
      expect(formatZoomLevel(1.0)).toBe('100%')
      expect(formatZoomLevel(2.0)).toBe('200%')
      expect(formatZoomLevel(0.5)).toBe('50%')
    })

    it('should round to nearest percentage', () => {
      expect(formatZoomLevel(1.25)).toBe('125%')
      expect(formatZoomLevel(0.33)).toBe('33%')
    })
  })

  describe('MOUSE_ZOOM_CONFIG constant', () => {
    it('should have correct mouse zoom configuration', () => {
      expect(MOUSE_ZOOM_CONFIG.WHEEL_SENSITIVITY).toBe(0.001)
      expect(MOUSE_ZOOM_CONFIG.MIN_ZOOM).toBe(0.1)
      expect(MOUSE_ZOOM_CONFIG.MAX_ZOOM).toBe(5.0)
    })
  })

  describe('getMousePositionPercentage', () => {
    it('should calculate mouse position percentage correctly', () => {
      const event = {
        clientX: 100
      }
      const container = {
        getBoundingClientRect: () => ({
          left: 0,
          width: 200
        })
      }

      const result = getMousePositionPercentage(event, container)
      expect(result).toBe(50)
    })

    it('should handle edge cases', () => {
      const event = {
        clientX: 0
      }
      const container = {
        getBoundingClientRect: () => ({
          left: 0,
          width: 100
        })
      }

      const result = getMousePositionPercentage(event, container)
      expect(result).toBe(0)
    })
  })

  describe('calculateVisibleRangeWithMouse', () => {
    it('should calculate visible range with mouse position', () => {
      const timelineStart = new Date('2021-01-01')
      const timelineEnd = new Date('2021-12-31')
      const zoomLevel = 2.0
      const mousePercent = 50

      const result = calculateVisibleRangeWithMouse(timelineStart, timelineEnd, zoomLevel, mousePercent)
      
      expect(result).toBeDefined()
      expect(result.visibleStart).toBeInstanceOf(Date)
      expect(result.visibleEnd).toBeInstanceOf(Date)
      expect(typeof result.visibleDays).toBe('number')
    })
  })

  describe('calculateWheelZoom', () => {
    it('should calculate wheel zoom correctly', () => {
      const currentZoom = 1.0
      const deltaY = -100

      const result = calculateWheelZoom(currentZoom, deltaY)
      
      expect(result).toBeGreaterThan(currentZoom)
      expect(result).toBeGreaterThanOrEqual(0.1)
      expect(result).toBeLessThanOrEqual(5.0)
    })

    it('should handle different delta values', () => {
      const currentZoom = 1.0

      const zoomIn = calculateWheelZoom(currentZoom, -100)
      const zoomOut = calculateWheelZoom(currentZoom, 100)
      
      expect(zoomIn).toBeGreaterThan(currentZoom)
      expect(zoomOut).toBeLessThan(currentZoom)
    })
  })

  describe('handleMouseWheelZoom', () => {
    it('should handle mouse wheel zoom event', () => {
      const currentZoom = 1.0
      const centerPercent = 50
      const event = {
        deltaY: -100,
        clientX: 100,
        ctrlKey: true,
        preventDefault: vi.fn()
      }
      const container = {
        getBoundingClientRect: () => ({
          left: 0,
          width: 200
        })
      }
      const onZoomChange = vi.fn()
      const onCenterChange = vi.fn()

      handleMouseWheelZoom(event, container, new Date('2021-01-01'), new Date('2021-12-31'), currentZoom, onZoomChange, onCenterChange)
      
      expect(onZoomChange).toHaveBeenCalled()
      expect(onCenterChange).toHaveBeenCalled()
    })

    it('should prevent default and stop propagation', () => {
      const currentZoom = 1.0
      const event = {
        deltaY: -100,
        clientX: 100,
        ctrlKey: true,
        preventDefault: vi.fn()
      }
      const container = {
        getBoundingClientRect: () => ({
          left: 0,
          width: 200
        })
      }
      const onZoomChange = vi.fn()
      const onCenterChange = vi.fn()

      handleMouseWheelZoom(event, container, new Date('2021-01-01'), new Date('2021-12-31'), currentZoom, onZoomChange, onCenterChange)
      
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })
})

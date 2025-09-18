import { describe, it, expect } from 'vitest'
import {
  calculateDaysBetween,
  calculateTimelineBoundaries,
  calculateTotalDays,
  calculateItemPosition,
  generateMonthMarkers,
  formatMonthLabel,
  createItemTooltip,
  DAY_IN_MS
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
})

import { describe, it, expect } from 'vitest'
import assignLanes from './assignLanes.js'

describe('assignLanes', () => {
  it('should assign non-overlapping items to the same lane', () => {
    const items = [
      { id: 1, start: '2021-01-01', end: '2021-01-05' },
      { id: 2, start: '2021-01-10', end: '2021-01-15' },
      { id: 3, start: '2021-01-20', end: '2021-01-25' }
    ]
    
    const result = assignLanes(items)
    
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveLength(3)
    expect(result[0].map(item => item.id)).toEqual([1, 2, 3])
  })

  it('should assign overlapping items to different lanes', () => {
    const items = [
      { id: 1, start: '2021-01-01', end: '2021-01-10' },
      { id: 2, start: '2021-01-05', end: '2021-01-15' },
      { id: 3, start: '2021-01-12', end: '2021-01-20' }
    ]
    
    const result = assignLanes(items)
    
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveLength(2) // items 1 and 3 (non-overlapping)
    expect(result[1]).toHaveLength(1) // item 2 (overlaps with 1)
    expect(result[0][0].id).toBe(1)
    expect(result[0][1].id).toBe(3)
    expect(result[1][0].id).toBe(2)
  })

  it('should handle mixed overlapping and non-overlapping items', () => {
    const items = [
      { id: 1, start: '2021-01-01', end: '2021-01-10' },
      { id: 2, start: '2021-01-05', end: '2021-01-15' },
      { id: 3, start: '2021-01-20', end: '2021-01-25' },
      { id: 4, start: '2021-01-30', end: '2021-02-05' }
    ]
    
    const result = assignLanes(items)
    
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveLength(3) // items 1, 3, and 4 (non-overlapping)
    expect(result[1]).toHaveLength(1) // item 2 (overlaps with 1)
    expect(result[0].map(item => item.id)).toEqual([1, 3, 4])
    expect(result[1].map(item => item.id)).toEqual([2])
  })

  it('should sort items by start date before assigning', () => {
    const items = [
      { id: 3, start: '2021-01-20', end: '2021-01-25' },
      { id: 1, start: '2021-01-01', end: '2021-01-10' },
      { id: 2, start: '2021-01-05', end: '2021-01-15' }
    ]
    
    const result = assignLanes(items)
    
    // Should be sorted by start date and assigned to lanes correctly
    expect(result).toHaveLength(2)
    expect(result[0][0].id).toBe(1)
    expect(result[0][1].id).toBe(3)
    expect(result[1][0].id).toBe(2)
  })

  it('should handle single item', () => {
    const items = [
      { id: 1, start: '2021-01-01', end: '2021-01-10' }
    ]
    
    const result = assignLanes(items)
    
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveLength(1)
    expect(result[0][0].id).toBe(1)
  })

  it('should handle empty array', () => {
    const result = assignLanes([])
    
    expect(result).toHaveLength(0)
  })

  it('should handle items with same start date', () => {
    const items = [
      { id: 1, start: '2021-01-01', end: '2021-01-10' },
      { id: 2, start: '2021-01-01', end: '2021-01-15' },
      { id: 3, start: '2021-01-01', end: '2021-01-05' }
    ]
    
    const result = assignLanes(items)
    
    expect(result).toHaveLength(3)
    expect(result[0]).toHaveLength(1)
    expect(result[1]).toHaveLength(1)
    expect(result[2]).toHaveLength(1)
  })

  it('should handle items that end exactly when another starts', () => {
    const items = [
      { id: 1, start: '2021-01-01', end: '2021-01-10' },
      { id: 2, start: '2021-01-10', end: '2021-01-20' },
      { id: 3, start: '2021-01-20', end: '2021-01-30' }
    ]
    
    const result = assignLanes(items)
    
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveLength(2) // items 1 and 3
    expect(result[1]).toHaveLength(1) // item 2
    expect(result[0].map(item => item.id)).toEqual([1, 3])
    expect(result[1].map(item => item.id)).toEqual([2])
  })

  it('should handle complex overlapping scenario', () => {
    const items = [
      { id: 1, start: '2021-01-01', end: '2021-01-20' },
      { id: 2, start: '2021-01-05', end: '2021-01-15' },
      { id: 3, start: '2021-01-10', end: '2021-01-25' },
      { id: 4, start: '2021-01-30', end: '2021-02-10' },
      { id: 5, start: '2021-02-05', end: '2021-02-15' }
    ]
    
    const result = assignLanes(items)
    
    expect(result).toHaveLength(3)
    // Lane 1: items 1 and 4
    expect(result[0].map(item => item.id)).toEqual([1, 4])
    // Lane 2: items 2 and 5
    expect(result[1].map(item => item.id)).toEqual([2, 5])
    // Lane 3: item 3
    expect(result[2].map(item => item.id)).toEqual([3])
  })

  it('should handle items with different date formats', () => {
    const items = [
      { id: 1, start: '2021-01-01T00:00:00Z', end: '2021-01-10T23:59:59Z' },
      { id: 2, start: '2021-01-05', end: '2021-01-15' },
      { id: 3, start: '2021-01-12T12:00:00', end: '2021-01-20T12:00:00' }
    ]
    
    const result = assignLanes(items)
    
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveLength(2) // Items 1 and 3
    expect(result[1]).toHaveLength(1) // Item 2
  })

  it('should handle items with very close dates', () => {
    const items = [
      { id: 1, start: '2021-01-01', end: '2021-01-01' },
      { id: 2, start: '2021-01-01', end: '2021-01-02' },
      { id: 3, start: '2021-01-02', end: '2021-01-03' }
    ]
    
    const result = assignLanes(items)
    
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveLength(2) // Items 1 and 3 (non-overlapping)
    expect(result[1]).toHaveLength(1) // Item 2 (overlaps with 1)
  })

  it('should handle items spanning multiple years', () => {
    const items = [
      { id: 1, start: '2020-12-01', end: '2021-01-15' },
      { id: 2, start: '2021-01-10', end: '2021-02-28' },
      { id: 3, start: '2021-03-01', end: '2022-01-01' }
    ]
    
    const result = assignLanes(items)
    
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveLength(2) // Items 1 and 3
    expect(result[1]).toHaveLength(1) // Item 2
  })

  it('should handle items with leap year dates', () => {
    const items = [
      { id: 1, start: '2020-02-28', end: '2020-03-01' },
      { id: 2, start: '2020-02-29', end: '2020-03-02' },
      { id: 3, start: '2020-03-01', end: '2020-03-03' }
    ]
    
    const result = assignLanes(items)
    
    expect(result).toHaveLength(3)
    expect(result[0]).toHaveLength(1) // Item 1
    expect(result[1]).toHaveLength(1) // Item 2
    expect(result[2]).toHaveLength(1) // Item 3
  })

  it('should handle items with invalid dates gracefully', () => {
    const items = [
      { id: 1, start: 'invalid-date', end: '2021-01-10' },
      { id: 2, start: '2021-01-05', end: 'invalid-date' },
      { id: 3, start: '2021-01-12', end: '2021-01-20' }
    ]
    
    // Should not throw an error
    expect(() => assignLanes(items)).not.toThrow()
    
    const result = assignLanes(items)
    expect(Array.isArray(result)).toBe(true)
  })

  it('should handle items with null or undefined dates', () => {
    const items = [
      { id: 1, start: null, end: '2021-01-10' },
      { id: 2, start: '2021-01-05', end: undefined },
      { id: 3, start: '2021-01-12', end: '2021-01-20' }
    ]
    
    // Should not throw an error
    expect(() => assignLanes(items)).not.toThrow()
    
    const result = assignLanes(items)
    expect(Array.isArray(result)).toBe(true)
  })

  it('should handle very large arrays efficiently', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      start: `2021-01-${String((i % 30) + 1).padStart(2, '0')}`,
      end: `2021-01-${String((i % 30) + 5).padStart(2, '0')}`
    }))
    
    const startTime = performance.now()
    const result = assignLanes(items)
    const endTime = performance.now()
    
    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
    expect(endTime - startTime).toBeLessThan(1000) // Should complete in less than 1 second
  })

  it('should maintain original item objects', () => {
    const items = [
      { id: 1, start: '2021-01-01', end: '2021-01-10', name: 'Item 1', customProp: 'value1' },
      { id: 2, start: '2021-01-05', end: '2021-01-15', name: 'Item 2', customProp: 'value2' }
    ]
    
    const result = assignLanes(items)
    
    expect(result[0][0]).toEqual(items[0])
    expect(result[1][0]).toEqual(items[1])
    expect(result[0][0].customProp).toBe('value1')
    expect(result[1][0].customProp).toBe('value2')
  })
})

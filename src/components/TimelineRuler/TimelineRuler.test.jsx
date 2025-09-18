import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { TimelineRuler } from '../index'

// Mock the utility functions
vi.mock('../../utils.js', () => ({
  generateMonthMarkers: vi.fn(() => [
    { date: new Date('2020-12-01'), left: 0 },
    { date: new Date('2021-01-01'), left: 25 },
    { date: new Date('2021-02-01'), left: 50 }
  ]),
  formatMonthLabel: vi.fn((date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  })
}))

describe('TimelineRuler', () => {
  const mockProps = {
    timelineStart: new Date('2021-01-01'),
    timelineEnd: new Date('2021-03-31'),
    totalDays: 90
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render month markers', () => {
    render(<TimelineRuler {...mockProps} />)
    
    expect(screen.getByText('Nov 2020')).toBeInTheDocument()
    expect(screen.getByText('Dec 2020')).toBeInTheDocument()
    expect(screen.getByText('Jan 2021')).toBeInTheDocument()
  })

  it('should have correct CSS classes', () => {
    const { container } = render(<TimelineRuler {...mockProps} />)
    
    expect(container.firstChild).toHaveClass('timeline-ruler')
  })

  it('should render month markers with correct positioning', () => {
    const { container } = render(<TimelineRuler {...mockProps} />)
    
    const markers = container.querySelectorAll('.month-marker')
    expect(markers).toHaveLength(3)
    
    // Check that markers have correct left positioning
    expect(markers[0]).toHaveStyle('left: 0%')
    expect(markers[1]).toHaveStyle('left: 25%')
    expect(markers[2]).toHaveStyle('left: 50%')
  })

  it('should render month lines and labels', () => {
    const { container } = render(<TimelineRuler {...mockProps} />)
    
    const markers = container.querySelectorAll('.month-marker')
    markers.forEach(marker => {
      expect(marker.querySelector('.month-line')).toBeInTheDocument()
      expect(marker.querySelector('.month-label')).toBeInTheDocument()
    })
  })

  it('should handle empty month markers', async () => {
    const { generateMonthMarkers } = await import('../../utils.js')
    generateMonthMarkers.mockReturnValueOnce([])
    
    const { container } = render(<TimelineRuler {...mockProps} />)
    
    const markers = container.querySelectorAll('.month-marker')
    expect(markers).toHaveLength(0)
  })

  it('should call utility functions with correct parameters', async () => {
    const { generateMonthMarkers } = await import('../../utils.js')
    const { formatMonthLabel } = await import('../../utils.js')
    
    render(<TimelineRuler {...mockProps} />)
    
    expect(generateMonthMarkers).toHaveBeenCalledWith(
      mockProps.timelineStart,
      mockProps.timelineEnd,
      mockProps.totalDays
    )
    
    expect(formatMonthLabel).toHaveBeenCalledTimes(3)
  })
})

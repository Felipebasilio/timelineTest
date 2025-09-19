import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { TimelineLane } from '../index'

// Mock the TimelineItem component
vi.mock('../TimelineItem', () => ({
  default: ({ item, timelineStart, totalDays }) => (
    <div data-testid={`timeline-item-${item.id}`}>
      {item.name} ({timelineStart.toISOString().split('T')[0]} - {totalDays} days)
    </div>
  )
}))

describe('TimelineLane', () => {
  const mockLane = [
    { id: 1, name: 'Item 1', start: '2021-01-01', end: '2021-01-10' },
    { id: 2, name: 'Item 2', start: '2021-01-15', end: '2021-01-25' }
  ]

  const mockProps = {
    lane: mockLane,
    laneIndex: 0,
    timelineStart: new Date('2021-01-01'),
    totalDays: 30
  }

  it('should render lane number', () => {
    render(<TimelineLane {...mockProps} />)
    
    expect(screen.getByText('Lane 1')).toBeInTheDocument()
  })

  it('should render all items in the lane', () => {
    render(<TimelineLane {...mockProps} />)
    
    expect(screen.getByTestId('timeline-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-item-2')).toBeInTheDocument()
  })

  it('should have correct CSS classes', () => {
    const { container } = render(<TimelineLane {...mockProps} />)
    
    expect(container.firstChild).toHaveClass('timeline-lane')
    expect(container.querySelector('.lane-number')).toBeInTheDocument()
    expect(container.querySelector('.lane-content')).toBeInTheDocument()
  })

  it('should pass correct props to TimelineItem components', () => {
    render(<TimelineLane {...mockProps} />)
    
    expect(screen.getByText(/Item 1/)).toBeInTheDocument()
    expect(screen.getByText(/Item 2/)).toBeInTheDocument()
    expect(screen.getByTestId('timeline-item-1')).toHaveTextContent('2021-01-01')
    expect(screen.getByTestId('timeline-item-1')).toHaveTextContent('30 days')
  })

  it('should handle different lane indices', () => {
    const propsWithDifferentIndex = { ...mockProps, laneIndex: 2 }
    render(<TimelineLane {...propsWithDifferentIndex} />)
    
    expect(screen.getByText('Lane 3')).toBeInTheDocument()
  })

  it('should handle empty lane', () => {
    const emptyLaneProps = { ...mockProps, lane: [] }
    render(<TimelineLane {...emptyLaneProps} />)
    
    expect(screen.getByText('Lane 1')).toBeInTheDocument()
    expect(screen.queryByTestId(/timeline-item-/)).not.toBeInTheDocument()
  })

  it('should handle single item in lane', () => {
    const singleItemLane = [mockLane[0]]
    const singleItemProps = { ...mockProps, lane: singleItemLane }
    render(<TimelineLane {...singleItemProps} />)
    
    expect(screen.getByTestId('timeline-item-1')).toBeInTheDocument()
    expect(screen.queryByTestId('timeline-item-2')).not.toBeInTheDocument()
  })
})

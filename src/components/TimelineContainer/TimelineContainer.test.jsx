import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { TimelineContainer } from '../index'

// Mock the child components
vi.mock('../TimelineHeader', () => ({
  default: ({ itemCount, laneCount }) => (
    <div data-testid="timeline-header">
      Header: {itemCount} items, {laneCount} lanes
    </div>
  )
}))

vi.mock('../TimelineRuler', () => ({
  default: ({ timelineStart, timelineEnd, totalDays }) => (
    <div data-testid="timeline-ruler">
      Ruler: {timelineStart.toISOString().split('T')[0]} to {timelineEnd.toISOString().split('T')[0]} ({totalDays} days)
    </div>
  )
}))

vi.mock('../TimelineLanesContainer', () => ({
  default: ({ lanes, timelineStart, totalDays }) => (
    <div data-testid="timeline-lanes-container">
      Lanes: {lanes.length} lanes, {totalDays} days
    </div>
  )
}))

// Mock the utility functions
vi.mock('../../utils.js', () => ({
  calculateTimelineBoundaries: vi.fn(() => ({
    timelineStart: new Date('2021-01-01'),
    timelineEnd: new Date('2021-12-31')
  })),
  calculateTotalDays: vi.fn(() => 365)
}))

vi.mock('../../assignLanes.js', () => ({
  default: vi.fn(() => [
    [{ id: 1, name: 'Item 1' }],
    [{ id: 2, name: 'Item 2' }]
  ])
}))

describe('TimelineContainer', () => {
  const mockItems = [
    { id: 1, start: '2021-01-01', end: '2021-01-10', name: 'Item 1' },
    { id: 2, start: '2021-01-15', end: '2021-01-25', name: 'Item 2' }
  ]

  it('should render all child components', () => {
    render(<TimelineContainer items={mockItems} />)
    
    expect(screen.getByTestId('timeline-header')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-ruler')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-lanes-container')).toBeInTheDocument()
  })

  it('should pass correct props to TimelineHeader', () => {
    render(<TimelineContainer items={mockItems} />)
    
    expect(screen.getByText('Header: 2 items, 2 lanes')).toBeInTheDocument()
  })

  it('should pass correct props to TimelineRuler', () => {
    render(<TimelineContainer items={mockItems} />)
    
    expect(screen.getByText('Ruler: 2021-01-01 to 2021-12-31 (365 days)')).toBeInTheDocument()
  })

  it('should pass correct props to TimelineLanesContainer', () => {
    render(<TimelineContainer items={mockItems} />)
    
    expect(screen.getByText('Lanes: 2 lanes, 365 days')).toBeInTheDocument()
  })

  it('should handle empty items array', () => {
    render(<TimelineContainer items={[]} />)
    
    expect(screen.getByText('Header: 0 items, 2 lanes')).toBeInTheDocument()
  })

  it('should have correct container class', () => {
    const { container } = render(<TimelineContainer items={mockItems} />)
    
    expect(container.firstChild).toHaveClass('timeline-container')
  })
})

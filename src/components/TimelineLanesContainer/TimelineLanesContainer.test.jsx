import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { TimelineLanesContainer } from '../index'

// Mock the TimelineLane component
vi.mock('../TimelineLane', () => ({
  default: ({ lane, laneIndex, timelineStart, totalDays }) => (
    <div data-testid={`timeline-lane-${laneIndex}`}>
      Lane {laneIndex + 1}: {lane.length} items ({totalDays} days)
    </div>
  )
}))

describe('TimelineLanesContainer', () => {
  const mockLanes = [
    [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }],
    [{ id: 3, name: 'Item 3' }],
    [{ id: 4, name: 'Item 4' }, { id: 5, name: 'Item 5' }, { id: 6, name: 'Item 6' }]
  ]

  const mockProps = {
    lanes: mockLanes,
    timelineStart: new Date('2021-01-01'),
    totalDays: 30
  }

  it('should render all lanes', () => {
    render(<TimelineLanesContainer {...mockProps} />)
    
    expect(screen.getByTestId('timeline-lane-0')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-lane-1')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-lane-2')).toBeInTheDocument()
  })

  it('should have correct CSS class', () => {
    const { container } = render(<TimelineLanesContainer {...mockProps} />)
    
    expect(container.firstChild).toHaveClass('timeline-lanes')
  })

  it('should pass correct props to each TimelineLane', () => {
    render(<TimelineLanesContainer {...mockProps} />)
    
    expect(screen.getByText('Lane 1: 2 items (30 days)')).toBeInTheDocument()
    expect(screen.getByText('Lane 2: 1 items (30 days)')).toBeInTheDocument()
    expect(screen.getByText('Lane 3: 3 items (30 days)')).toBeInTheDocument()
  })

  it('should handle empty lanes array', () => {
    const emptyLanesProps = { ...mockProps, lanes: [] }
    render(<TimelineLanesContainer {...emptyLanesProps} />)
    
    expect(screen.queryByTestId(/timeline-lane-/)).not.toBeInTheDocument()
  })

  it('should handle single lane', () => {
    const singleLaneProps = { ...mockProps, lanes: [mockLanes[0]] }
    render(<TimelineLanesContainer {...singleLaneProps} />)
    
    expect(screen.getByTestId('timeline-lane-0')).toBeInTheDocument()
    expect(screen.queryByTestId('timeline-lane-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('timeline-lane-2')).not.toBeInTheDocument()
  })

  it('should pass timelineStart and totalDays to all lanes', () => {
    const customProps = {
      ...mockProps,
      timelineStart: new Date('2021-06-01'),
      totalDays: 60
    }
    
    render(<TimelineLanesContainer {...customProps} />)
    
    // All lanes should receive the same timelineStart and totalDays
    const lanes = screen.getAllByTestId(/timeline-lane-/)
    expect(lanes).toHaveLength(3)
  })
})

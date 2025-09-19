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
  calculateTotalDays: vi.fn(() => 365),
  calculateVisibleRange: vi.fn(() => ({
    visibleStart: new Date('2021-01-01'),
    visibleEnd: new Date('2021-12-31')
  })),
  ZOOM_LEVELS: {
    MIN: 0.1,
    MAX: 5.0,
    DEFAULT: 1.0,
    STEP: 0.1
  }
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
    
    expect(screen.getByText(/Ruler: 2021-01-01 to 2021-12-31/)).toBeInTheDocument()
    expect(screen.getByTestId('timeline-ruler')).toHaveTextContent('365 days')
  })

  it('should pass correct props to TimelineLanesContainer', () => {
    render(<TimelineContainer items={mockItems} />)
    
    expect(screen.getByText(/Lanes: 2 lanes/)).toBeInTheDocument()
    expect(screen.getByTestId('timeline-lanes-container')).toHaveTextContent('365 days')
  })

  it('should handle empty items array', () => {
    render(<TimelineContainer items={[]} />)
    
    expect(screen.getByText('Header: 0 items, 2 lanes')).toBeInTheDocument()
  })

  it('should have correct container class', () => {
    const { container } = render(<TimelineContainer items={mockItems} />)
    
    expect(container.firstChild).toHaveClass('timeline-container')
  })

  it('should handle zoom functionality', () => {
    const zoomProps = {
      items: mockItems,
      zoomLevel: 2.0,
      centerPercent: 50
    }
    
    render(<TimelineContainer {...zoomProps} />)
    
    expect(screen.getByTestId('timeline-header')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-ruler')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-lanes-container')).toBeInTheDocument()
  })

  it('should handle different zoom levels', () => {
    const zoomLevels = [0.1, 0.5, 1.0, 2.0, 5.0]
    
    zoomLevels.forEach(zoomLevel => {
      const { unmount } = render(
        <TimelineContainer 
          items={mockItems} 
          zoomLevel={zoomLevel}
          centerPercent={50}
        />
      )
      
      expect(screen.getByTestId('timeline-header')).toBeInTheDocument()
      expect(screen.getByTestId('timeline-ruler')).toBeInTheDocument()
      expect(screen.getByTestId('timeline-lanes-container')).toBeInTheDocument()
      
      unmount()
    })
  })

  it('should handle different center percentages', () => {
    const centerPercents = [0, 25, 50, 75, 100]
    
    centerPercents.forEach(centerPercent => {
      const { unmount } = render(
        <TimelineContainer 
          items={mockItems} 
          zoomLevel={2.0}
          centerPercent={centerPercent}
        />
      )
      
      expect(screen.getByTestId('timeline-header')).toBeInTheDocument()
      expect(screen.getByTestId('timeline-ruler')).toBeInTheDocument()
      expect(screen.getByTestId('timeline-lanes-container')).toBeInTheDocument()
      
      unmount()
    })
  })

  it('should handle single item', () => {
    const singleItem = [mockItems[0]]
    
    render(<TimelineContainer items={singleItem} />)
    
    expect(screen.getByText(/Header: 1 items/)).toBeInTheDocument()
    expect(screen.getByTestId('timeline-header')).toHaveTextContent('2 lanes')
  })

  it('should handle many items', () => {
    const manyItems = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      start: `2021-0${(i % 9) + 1}-01`,
      end: `2021-0${(i % 9) + 1}-10`,
      name: `Item ${i + 1}`
    }))
    
    render(<TimelineContainer items={manyItems} />)
    
    expect(screen.getByText(/Header: 10 items/)).toBeInTheDocument()
  })

  it('should handle items with same dates', () => {
    const sameDateItems = [
      { id: 1, start: '2021-01-01', end: '2021-01-10', name: 'Item 1' },
      { id: 2, start: '2021-01-01', end: '2021-01-10', name: 'Item 2' },
      { id: 3, start: '2021-01-01', end: '2021-01-10', name: 'Item 3' }
    ]
    
    render(<TimelineContainer items={sameDateItems} />)
    
    expect(screen.getByText(/Header: 3 items/)).toBeInTheDocument()
    expect(screen.getByTestId('timeline-header')).toHaveTextContent('2 lanes')
  })

  it('should handle items spanning multiple years', () => {
    const multiYearItems = [
      { id: 1, start: '2020-12-01', end: '2021-01-15', name: 'Cross Year Item' },
      { id: 2, start: '2021-06-01', end: '2022-03-31', name: 'Long Item' }
    ]
    
    render(<TimelineContainer items={multiYearItems} />)
    
    expect(screen.getByText('Header: 2 items, 2 lanes')).toBeInTheDocument()
  })

  it('should handle edge case dates', () => {
    const edgeCaseItems = [
      { id: 1, start: '2021-01-01', end: '2021-01-01', name: 'Same Day Item' },
      { id: 2, start: '2021-12-31', end: '2022-01-01', name: 'New Year Item' }
    ]
    
    render(<TimelineContainer items={edgeCaseItems} />)
    
    expect(screen.getByText('Header: 2 items, 2 lanes')).toBeInTheDocument()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { TimelineItem } from '../index'

// Mock the utility functions
vi.mock('../../utils.js', () => ({
  calculateItemPosition: vi.fn(() => ({
    left: '25%',
    width: '50%'
  })),
  createItemTooltip: vi.fn(() => 'Test Item (2021-01-15 to 2021-01-25)')
}))

describe('TimelineItem', () => {
  const mockItem = {
    id: 1,
    name: 'Test Item',
    start: '2021-01-15',
    end: '2021-01-25'
  }

  const mockProps = {
    item: mockItem,
    timelineStart: new Date('2021-01-01'),
    totalDays: 30
  }

  it('should render item name and dates', () => {
    render(<TimelineItem {...mockProps} />)
    
    expect(screen.getByText('Test Item')).toBeInTheDocument()
    expect(screen.getByText('2021-01-15 → 2021-01-25')).toBeInTheDocument()
  })

  it('should have correct CSS classes', () => {
    const { container } = render(<TimelineItem {...mockProps} />)
    
    expect(container.firstChild).toHaveClass('timeline-item')
    expect(container.querySelector('.item-content')).toBeInTheDocument()
    expect(container.querySelector('.item-name')).toBeInTheDocument()
    expect(container.querySelector('.item-dates')).toBeInTheDocument()
  })

  it('should apply calculated positioning styles', () => {
    const { container } = render(<TimelineItem {...mockProps} />)
    
    const itemElement = container.querySelector('.timeline-item')
    expect(itemElement).toHaveStyle('left: 25%')
    expect(itemElement).toHaveStyle('width: 50%')
  })

  it('should have correct tooltip', () => {
    render(<TimelineItem {...mockProps} />)
    
    const itemElement = screen.getByText('Test Item').closest('.timeline-item')
    expect(itemElement).toHaveAttribute('title', 'Test Item (2021-01-15 to 2021-01-25)')
  })

  it('should call utility functions with correct parameters', async () => {
    const { calculateItemPosition } = await import('../../utils.js')
    const { createItemTooltip } = await import('../../utils.js')
    
    render(<TimelineItem {...mockProps} />)
    
    expect(calculateItemPosition).toHaveBeenCalledWith(
      mockItem,
      mockProps.timelineStart,
      mockProps.totalDays
    )
    
    expect(createItemTooltip).toHaveBeenCalledWith(mockItem)
  })

  it('should handle different item data', () => {
    const differentItem = {
      id: 2,
      name: 'Another Item',
      start: '2021-02-01',
      end: '2021-02-10'
    }
    
    const { calculateItemPosition, createItemTooltip } = vi.hoisted(() => ({
      calculateItemPosition: vi.fn(() => ({ left: '10%', width: '30%' })),
      createItemTooltip: vi.fn(() => 'Another Item (2021-02-01 to 2021-02-10)')
    }))
    
    vi.doMock('../utils.js', () => ({
      calculateItemPosition,
      createItemTooltip
    }))
    
    render(<TimelineItem item={differentItem} timelineStart={mockProps.timelineStart} totalDays={mockProps.totalDays} />)
    
    expect(screen.getByText('Another Item')).toBeInTheDocument()
    expect(screen.getByText('2021-02-01 → 2021-02-10')).toBeInTheDocument()
  })
})

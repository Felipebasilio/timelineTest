import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { TimelineHeader } from '../index'

describe('TimelineHeader', () => {
  it('should render title and statistics', () => {
    render(<TimelineHeader itemCount={5} laneCount={3} />)
    
    expect(screen.getByText('Project Timeline')).toBeInTheDocument()
    expect(screen.getByText('5 timeline items arranged in 3 lanes')).toBeInTheDocument()
  })

  it('should handle zero items and lanes', () => {
    render(<TimelineHeader itemCount={0} laneCount={0} />)
    
    expect(screen.getByText('0 timeline items arranged in 0 lanes')).toBeInTheDocument()
  })

  it('should handle single item and lane', () => {
    render(<TimelineHeader itemCount={1} laneCount={1} />)
    
    expect(screen.getByText('1 timeline items arranged in 1 lanes')).toBeInTheDocument()
  })

  it('should have correct CSS classes', () => {
    const { container } = render(<TimelineHeader itemCount={5} laneCount={3} />)
    
    expect(container.firstChild).toHaveClass('timeline-header')
    expect(screen.getByText('Project Timeline')).toBeInTheDocument()
  })

  it('should handle large numbers', () => {
    render(<TimelineHeader itemCount={1000} laneCount={50} />)
    
    expect(screen.getByText('1000 timeline items arranged in 50 lanes')).toBeInTheDocument()
  })
})

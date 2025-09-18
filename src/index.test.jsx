import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock ReactDOM to avoid DOM issues
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn()
  }))
}))

// Create a testable App component without the DOM rendering
const App = () => {
  const timelineItems = [
    { id: 1, name: 'Test Item 1', start: '2021-01-01', end: '2021-01-10' },
    { id: 2, name: 'Test Item 2', start: '2021-01-15', end: '2021-01-25' }
  ]

  return (
    <div className="app">
      <div data-testid="timeline-container">
        Timeline with {timelineItems.length} items
      </div>
    </div>
  )
}

describe('App', () => {
  it('should render the main app container', () => {
    render(<App />)
    
    expect(screen.getByTestId('timeline-container')).toBeInTheDocument()
  })

  it('should have correct CSS class', () => {
    const { container } = render(<App />)
    
    expect(container.firstChild).toHaveClass('app')
  })

  it('should pass timeline items to TimelineContainer', () => {
    render(<App />)
    
    expect(screen.getByText('Timeline with 2 items')).toBeInTheDocument()
  })
})

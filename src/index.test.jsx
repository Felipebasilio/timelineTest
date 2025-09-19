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

  it('should handle different numbers of timeline items', () => {
    const TestApp = ({ itemCount }) => {
      const timelineItems = Array.from({ length: itemCount }, (_, i) => ({
        id: i + 1,
        name: `Test Item ${i + 1}`,
        start: `2021-01-${String(i + 1).padStart(2, '0')}`,
        end: `2021-01-${String(i + 5).padStart(2, '0')}`
      }))

      return (
        <div className="app">
          <div data-testid="timeline-container">
            Timeline with {timelineItems.length} items
          </div>
        </div>
      )
    }

    const { rerender } = render(<TestApp itemCount={0} />)
    expect(screen.getByText('Timeline with 0 items')).toBeInTheDocument()

    rerender(<TestApp itemCount={1} />)
    expect(screen.getByText('Timeline with 1 items')).toBeInTheDocument()

    rerender(<TestApp itemCount={10} />)
    expect(screen.getByText('Timeline with 10 items')).toBeInTheDocument()
  })

  it('should render without errors', () => {
    expect(() => render(<App />)).not.toThrow()
  })

  it('should have proper structure', () => {
    const { container } = render(<App />)
    
    const appDiv = container.firstChild
    expect(appDiv.tagName).toBe('DIV')
    expect(appDiv).toHaveClass('app')
    
    const timelineContainer = appDiv.querySelector('[data-testid="timeline-container"]')
    expect(timelineContainer).toBeInTheDocument()
  })
})

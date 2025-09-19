import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import ZoomControls from './index'

// Mock the utility functions
vi.mock('../../utils.js', () => ({
  ZOOM_LEVELS: {
    MIN: 0.1,
    MAX: 5.0,
    DEFAULT: 1.0,
    STEP: 0.1
  },
  clampZoomLevel: vi.fn((level) => Math.max(0.1, Math.min(5.0, level))),
  formatZoomLevel: vi.fn((level) => `${Math.round(level * 100)}%`)
}))

describe('ZoomControls', () => {
  const mockProps = {
    zoomLevel: 1.0,
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onZoomReset: vi.fn(),
    onZoomChange: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all zoom control elements', () => {
    render(<ZoomControls {...mockProps} />)
    
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset zoom/i })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /zoom level slider/i })).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('Ctrl + scroll to zoom')).toBeInTheDocument()
  })

  it('should have correct CSS classes', () => {
    const { container } = render(<ZoomControls {...mockProps} />)
    
    expect(container.firstChild).toHaveClass('zoom-controls')
    expect(container.querySelector('.zoom-controls-group')).toBeInTheDocument()
    expect(container.querySelector('.zoom-button')).toBeInTheDocument()
    expect(container.querySelector('.zoom-level-display')).toBeInTheDocument()
    expect(container.querySelector('.zoom-slider')).toBeInTheDocument()
    expect(container.querySelector('.mouse-zoom-hint')).toBeInTheDocument()
  })

  it('should call onZoomIn when zoom in button is clicked', () => {
    render(<ZoomControls {...mockProps} />)
    
    const zoomInButton = screen.getByRole('button', { name: /zoom in/i })
    fireEvent.click(zoomInButton)
    
    expect(mockProps.onZoomChange).toHaveBeenCalledWith(1.1)
  })

  it('should call onZoomOut when zoom out button is clicked', () => {
    render(<ZoomControls {...mockProps} />)
    
    const zoomOutButton = screen.getByRole('button', { name: /zoom out/i })
    fireEvent.click(zoomOutButton)
    
    expect(mockProps.onZoomChange).toHaveBeenCalledWith(0.9)
  })

  it('should call onZoomReset when reset button is clicked', () => {
    const resetProps = { ...mockProps, zoomLevel: 2.0 } // Not at default zoom
    render(<ZoomControls {...resetProps} />)
    
    const resetButton = screen.getByRole('button', { name: /reset zoom/i })
    fireEvent.click(resetButton)
    
    expect(mockProps.onZoomReset).toHaveBeenCalled()
  })

  it('should call onZoomChange when slider value changes', () => {
    render(<ZoomControls {...mockProps} />)
    
    const slider = screen.getByRole('slider', { name: /zoom level slider/i })
    fireEvent.change(slider, { target: { value: '2.5' } })
    
    expect(mockProps.onZoomChange).toHaveBeenCalledWith(2.5)
  })

  it('should disable zoom in button when at maximum zoom', () => {
    const maxZoomProps = { ...mockProps, zoomLevel: 5.0 }
    render(<ZoomControls {...maxZoomProps} />)
    
    const zoomInButton = screen.getByRole('button', { name: /zoom in/i })
    expect(zoomInButton).toBeDisabled()
  })

  it('should disable zoom out button when at minimum zoom', () => {
    const minZoomProps = { ...mockProps, zoomLevel: 0.1 }
    render(<ZoomControls {...minZoomProps} />)
    
    const zoomOutButton = screen.getByRole('button', { name: /zoom out/i })
    expect(zoomOutButton).toBeDisabled()
  })

  it('should disable reset button when at default zoom', () => {
    const defaultZoomProps = { ...mockProps, zoomLevel: 1.0 }
    render(<ZoomControls {...defaultZoomProps} />)
    
    const resetButton = screen.getByRole('button', { name: /reset zoom/i })
    expect(resetButton).toBeDisabled()
  })

  it('should display correct zoom level', () => {
    const customZoomProps = { ...mockProps, zoomLevel: 2.5 }
    render(<ZoomControls {...customZoomProps} />)
    
    expect(screen.getByText('250%')).toBeInTheDocument()
  })

  it('should have correct slider attributes', () => {
    render(<ZoomControls {...mockProps} />)
    
    const slider = screen.getByRole('slider', { name: /zoom level slider/i })
    expect(slider).toHaveAttribute('min', '0.1')
    expect(slider).toHaveAttribute('max', '5')
    expect(slider).toHaveAttribute('step', '0.1')
    expect(slider).toHaveAttribute('value', '1')
  })

  it('should have correct button titles and aria-labels', () => {
    render(<ZoomControls {...mockProps} />)
    
    const zoomInButton = screen.getByRole('button', { name: /zoom in/i })
    const zoomOutButton = screen.getByRole('button', { name: /zoom out/i })
    const resetButton = screen.getByRole('button', { name: /reset zoom/i })
    
    expect(zoomInButton).toHaveAttribute('title', 'Zoom In (Ctrl + +)')
    expect(zoomOutButton).toHaveAttribute('title', 'Zoom Out (Ctrl + -)')
    expect(resetButton).toHaveAttribute('title', 'Reset Zoom (Ctrl + 0)')
  })

  it('should handle different zoom levels correctly', () => {
    const testCases = [
      { zoomLevel: 0.5, expectedDisplay: '50%' },
      { zoomLevel: 1.0, expectedDisplay: '100%' },
      { zoomLevel: 2.0, expectedDisplay: '200%' },
      { zoomLevel: 3.5, expectedDisplay: '350%' }
    ]

    testCases.forEach(({ zoomLevel, expectedDisplay }) => {
      const { unmount } = render(<ZoomControls {...mockProps} zoomLevel={zoomLevel} />)
      
      expect(screen.getByText(expectedDisplay)).toBeInTheDocument()
      
      unmount()
    })
  })

  it('should handle edge case zoom levels', () => {
    const edgeCases = [
      { zoomLevel: 0.1, shouldDisableOut: true, shouldDisableIn: false },
      { zoomLevel: 5.0, shouldDisableOut: false, shouldDisableIn: true },
      { zoomLevel: 0.15, shouldDisableOut: false, shouldDisableIn: false }
    ]

    edgeCases.forEach(({ zoomLevel, shouldDisableOut, shouldDisableIn }) => {
      const { unmount } = render(<ZoomControls {...mockProps} zoomLevel={zoomLevel} />)
      
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i })
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i })
      
      expect(zoomOutButton.disabled).toBe(shouldDisableOut)
      expect(zoomInButton.disabled).toBe(shouldDisableIn)
      
      unmount()
    })
  })
})

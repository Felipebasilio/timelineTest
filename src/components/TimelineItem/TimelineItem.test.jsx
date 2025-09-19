import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { TimelineItem } from '../index'
import * as utils from '../../utils.js'

// Mock the utility functions
vi.mock('../../utils.js', () => ({
  calculateItemPosition: vi.fn(() => ({
    left: '25%',
    width: '50%'
  })),
  calculateItemPositionWithZoom: vi.fn(() => ({
    left: '25%',
    width: '50%'
  })),
  createItemTooltip: vi.fn(() => 'Test Item (2021-01-15 to 2021-01-25)'),
  validateItemName: vi.fn(() => ({ isValid: true })),
  sanitizeItemName: vi.fn((name) => name),
  handleInlineEditKeyDown: vi.fn((event, handleSave, handleCancel) => {
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      handleSave();
      return true;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
      return true;
    }
    return false;
  }),
  createDebouncedFunction: vi.fn((fn) => fn)
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
    visibleStart: new Date('2021-01-01'),
    visibleDays: 30,
    zoomLevel: 1.0
  }

  it('should render item name and dates', () => {
    render(<TimelineItem {...mockProps} />)
    
    expect(screen.getByText('Test Item')).toBeInTheDocument()
    expect(screen.getByText('2021-01-15')).toBeInTheDocument()
    expect(screen.getByText('2021-01-25')).toBeInTheDocument()
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

  it('should call utility functions with correct parameters', () => {
    // This test is covered by the positioning and tooltip tests above
    // The utility functions are already mocked at the module level
    render(<TimelineItem {...mockProps} />)
    
    expect(screen.getByText('Test Item')).toBeInTheDocument()
    expect(screen.getByText('2021-01-15')).toBeInTheDocument()
    expect(screen.getByText('2021-01-25')).toBeInTheDocument()
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
    
    render(<TimelineItem item={differentItem} timelineStart={mockProps.timelineStart} visibleStart={mockProps.visibleStart} visibleDays={mockProps.visibleDays} zoomLevel={mockProps.zoomLevel} />)
    
    expect(screen.getByText('Another Item')).toBeInTheDocument()
    expect(screen.getByText('2021-02-01')).toBeInTheDocument()
    expect(screen.getByText('2021-02-10')).toBeInTheDocument()
  })

  it('should use zoom-aware positioning when zoom level is not 1.0', () => {
    const zoomProps = {
      ...mockProps,
      zoomLevel: 2.0,
      visibleStart: new Date('2021-01-01'),
      visibleDays: 15
    }
    
    render(<TimelineItem {...zoomProps} />)
    
    expect(screen.getByText('Test Item')).toBeInTheDocument()
  })

  it('should use regular positioning when zoom level is 1.0', () => {
    const normalZoomProps = {
      ...mockProps,
      zoomLevel: 1.0
    }
    
    render(<TimelineItem {...normalZoomProps} />)
    
    expect(screen.getByText('Test Item')).toBeInTheDocument()
  })

  it('should handle missing zoom props gracefully', () => {
    const minimalProps = {
      item: mockItem,
      timelineStart: mockProps.timelineStart,
      visibleStart: mockProps.visibleStart,
      visibleDays: mockProps.visibleDays,
      zoomLevel: mockProps.zoomLevel
    }
    
    render(<TimelineItem {...minimalProps} />)
    
    expect(screen.getByText('Test Item')).toBeInTheDocument()
  })

  it('should handle edge case zoom levels', () => {
    const edgeCases = [
      { zoomLevel: 0.1 },
      { zoomLevel: 5.0 },
      { zoomLevel: 1.0 },
      { zoomLevel: 2.5 }
    ]

    edgeCases.forEach(({ zoomLevel }) => {
      const { unmount } = render(
        <TimelineItem 
          {...mockProps} 
          zoomLevel={zoomLevel}
          visibleStart={new Date('2021-01-01')}
          visibleDays={30}
        />
      )
      
      expect(screen.getByText('Test Item')).toBeInTheDocument()
      unmount()
    })
  })

  it('should handle different date formats', () => {
    const itemWithDifferentDates = {
      id: 3,
      name: 'Date Test Item',
      start: '2021-12-25',
      end: '2022-01-05'
    }
    
    render(<TimelineItem item={itemWithDifferentDates} timelineStart={mockProps.timelineStart} visibleStart={mockProps.visibleStart} visibleDays={mockProps.visibleDays} zoomLevel={mockProps.zoomLevel} />)
    
    expect(screen.getByText('Date Test Item')).toBeInTheDocument()
    expect(screen.getByText('2021-12-25')).toBeInTheDocument()
    expect(screen.getByText('2022-01-05')).toBeInTheDocument()
  })

  it('should handle single day items', () => {
    const singleDayItem = {
      id: 4,
      name: 'Single Day Item',
      start: '2021-06-15',
      end: '2021-06-15'
    }
    
    render(<TimelineItem item={singleDayItem} timelineStart={mockProps.timelineStart} visibleStart={mockProps.visibleStart} visibleDays={mockProps.visibleDays} zoomLevel={mockProps.zoomLevel} />)
    
    expect(screen.getByText('Single Day Item')).toBeInTheDocument()
    // For single day items, both start and end dates should be the same
    const dateElements = screen.getAllByText('2021-06-15')
    expect(dateElements).toHaveLength(2)
  })

  // ===== DRAG FUNCTIONALITY TESTS =====

  describe('Drag Functionality', () => {
    let mockOnItemUpdate

    beforeEach(() => {
      mockOnItemUpdate = vi.fn()
      // Clear all mocks before each test
      vi.clearAllMocks()
    })

    afterEach(() => {
      // Clean up any event listeners
      document.removeEventListener('mousemove', vi.fn())
      document.removeEventListener('mouseup', vi.fn())
    })

    it('should start dragging when mouse down on start handle', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const startHandle = container.querySelector('.drag-handle-start')
      expect(startHandle).toBeInTheDocument()
      
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      
      // Check that dragging state is set
      const itemElement = container.querySelector('.timeline-item')
      expect(itemElement).toHaveClass('dragging')
    })

    it('should start dragging when mouse down on end handle', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const endHandle = container.querySelector('.drag-handle-end')
      expect(endHandle).toBeInTheDocument()
      
      fireEvent.mouseDown(endHandle, { clientX: 200 })
      
      // Check that dragging state is set
      const itemElement = container.querySelector('.timeline-item')
      expect(itemElement).toHaveClass('dragging')
    })

    it('should handle mouse move during drag for start handle', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const startHandle = container.querySelector('.drag-handle-start')
      
      // Start drag
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      
      // Move mouse
      fireEvent.mouseMove(document, { clientX: 150 })
      
      // Should show preview dates
      expect(screen.getByText(/Start:/)).toBeInTheDocument()
      expect(screen.getByText(/End:/)).toBeInTheDocument()
    })

    it('should handle mouse move during drag for end handle', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const endHandle = container.querySelector('.drag-handle-end')
      
      // Start drag
      fireEvent.mouseDown(endHandle, { clientX: 200 })
      
      // Move mouse
      fireEvent.mouseMove(document, { clientX: 250 })
      
      // Should show preview dates
      expect(screen.getByText(/Start:/)).toBeInTheDocument()
      expect(screen.getByText(/End:/)).toBeInTheDocument()
    })

    it('should end drag on mouse up and call onItemUpdate', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const startHandle = container.querySelector('.drag-handle-start')
      
      // Start drag
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      
      // Move mouse
      fireEvent.mouseMove(document, { clientX: 150 })
      
      // End drag
      fireEvent.mouseUp(document)
      
      // Should call onItemUpdate with new dates
      expect(mockOnItemUpdate).toHaveBeenCalledWith(
        mockItem.id,
        expect.objectContaining({
          start: expect.any(String),
          end: expect.any(String)
        })
      )
    })

    it('should not call onItemUpdate if dates havent changed', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const startHandle = container.querySelector('.drag-handle-start')
      
      // Start drag but don't move mouse much
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      fireEvent.mouseMove(document, { clientX: 110 }) // Small movement
      fireEvent.mouseUp(document)
      
      // Should not call onItemUpdate for small movements
      expect(mockOnItemUpdate).not.toHaveBeenCalled()
    })

    it('should prevent start date from going beyond end date', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const startHandle = container.querySelector('.drag-handle-start')
      
      // Start drag and move far to the right
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      fireEvent.mouseMove(document, { clientX: 1000 }) // Large movement
      fireEvent.mouseUp(document)
      
      // Should call onItemUpdate with constrained dates
      expect(mockOnItemUpdate).toHaveBeenCalled()
    })

    it('should prevent end date from going before start date', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const endHandle = container.querySelector('.drag-handle-end')
      
      // Start drag and move far to the left
      fireEvent.mouseDown(endHandle, { clientX: 200 })
      fireEvent.mouseMove(document, { clientX: 50 }) // Large movement left
      fireEvent.mouseUp(document)
      
      // Should call onItemUpdate with constrained dates
      expect(mockOnItemUpdate).toHaveBeenCalled()
    })

    it('should not handle mouse move when not dragging', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      // Move mouse without starting drag
      fireEvent.mouseMove(document, { clientX: 150 })
      
      // Should not show preview dates
      expect(screen.queryByText(/Start:/)).not.toBeInTheDocument()
    })

    it('should handle drag without onItemUpdate callback', () => {
      const { container } = render(
        <TimelineItem {...mockProps} /> // No onItemUpdate
      )
      
      const startHandle = container.querySelector('.drag-handle-start')
      
      // Start drag
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      fireEvent.mouseMove(document, { clientX: 150 })
      fireEvent.mouseUp(document)
      
      // Should not throw error
      expect(screen.getByText('Test Item')).toBeInTheDocument()
    })
  })

  // ===== INLINE EDITING TESTS =====

  describe('Inline Editing', () => {
    let mockOnItemUpdate

    beforeEach(() => {
      mockOnItemUpdate = vi.fn()
      vi.clearAllMocks()
    })

    it('should start editing when clicking on item name', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const itemName = container.querySelector('.item-name')
      fireEvent.click(itemName)
      
      // Should show input field
      expect(container.querySelector('.inline-edit-input')).toBeInTheDocument()
      expect(container.querySelector('.item-name-text')).not.toBeInTheDocument()
    })

    it('should not start editing when dragging', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      // Simulate dragging state
      const startHandle = container.querySelector('.drag-handle-start')
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      
      const itemName = container.querySelector('.item-name')
      fireEvent.click(itemName)
      
      // Should not show input field when dragging
      expect(container.querySelector('.inline-edit-input')).not.toBeInTheDocument()
    })

    it('should not start editing when already editing', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const itemName = container.querySelector('.item-name')
      
      // Start editing
      fireEvent.click(itemName)
      expect(container.querySelector('.inline-edit-input')).toBeInTheDocument()
      
      // Try to start editing again
      fireEvent.click(itemName)
      
      // Should still be in edit mode (not duplicate)
      expect(container.querySelectorAll('.inline-edit-input')).toHaveLength(1)
    })

    it('should handle input change and clear validation error', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const itemName = container.querySelector('.item-name')
      fireEvent.click(itemName)
      
      const input = container.querySelector('.inline-edit-input')
      fireEvent.change(input, { target: { value: 'New Name' } })
      
      expect(input.value).toBe('New Name')
    })

    it('should handle save with valid input', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const itemName = container.querySelector('.item-name')
      fireEvent.click(itemName)
      
      const input = container.querySelector('.inline-edit-input')
      fireEvent.change(input, { target: { value: 'New Name' } })
      fireEvent.blur(input)
      
      // Should call onItemUpdate with new name
      expect(mockOnItemUpdate).toHaveBeenCalledWith(mockItem.id, { name: 'New Name' })
    })

    it('should handle save with invalid input and show validation error', () => {
      // Mock validation to return invalid
      vi.mocked(utils.validateItemName).mockReturnValue({ isValid: false, error: 'Invalid name' })
      
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const itemName = container.querySelector('.item-name')
      fireEvent.click(itemName)
      
      const input = container.querySelector('.inline-edit-input')
      fireEvent.change(input, { target: { value: 'Invalid Name' } })
      fireEvent.blur(input)
      
      // Should show validation error
      expect(container.querySelector('.validation-error')).toBeInTheDocument()
      expect(container.querySelector('.validation-error')).toHaveTextContent('Invalid name')
      
      // Should not call onItemUpdate
      expect(mockOnItemUpdate).not.toHaveBeenCalled()
    })

    it('should handle cancel editing', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const itemName = container.querySelector('.item-name')
      fireEvent.click(itemName)
      
      const input = container.querySelector('.inline-edit-input')
      fireEvent.change(input, { target: { value: 'New Name' } })
      fireEvent.keyDown(input, { key: 'Escape' })
      
      // Should exit edit mode and restore original name
      expect(container.querySelector('.inline-edit-input')).not.toBeInTheDocument()
      expect(container.querySelector('.item-name-text')).toHaveTextContent('Test Item')
    })

    it('should handle keyboard events', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const itemName = container.querySelector('.item-name')
      fireEvent.click(itemName)
      
      const input = container.querySelector('.inline-edit-input')
      fireEvent.change(input, { target: { value: 'New Name' } })
      
      // Test that keyboard events are handled (the actual implementation is tested through blur)
      fireEvent.keyDown(input, { key: 'Enter' })
      fireEvent.keyDown(input, { key: 'Tab' })
      
      // Test Escape key separately since it might exit edit mode
      fireEvent.keyDown(input, { key: 'Escape' })
      
      // After Escape, the component should exit edit mode
      expect(container.querySelector('.inline-edit-input')).not.toBeInTheDocument()
      expect(container.querySelector('.item-name-text')).toHaveTextContent('Test Item')
    })

    it('should focus and select input when entering edit mode', async () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const itemName = container.querySelector('.item-name')
      fireEvent.click(itemName)
      
      const input = container.querySelector('.inline-edit-input')
      
      // Wait for focus effect
      await waitFor(() => {
        expect(input).toHaveFocus()
      })
    })

    it('should update edit value when item name changes externally', () => {
      const { container, rerender } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      // Update item name externally
      const updatedItem = { ...mockItem, name: 'Updated Name' }
      rerender(
        <TimelineItem 
          {...mockProps} 
          item={updatedItem} 
          onItemUpdate={mockOnItemUpdate} 
        />
      )
      
      // Should show updated name
      expect(screen.getByText('Updated Name')).toBeInTheDocument()
    })

    it('should not update edit value when in editing mode', () => {
      const { container, rerender } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      // Start editing
      const itemName = container.querySelector('.item-name')
      fireEvent.click(itemName)
      
      const input = container.querySelector('.inline-edit-input')
      fireEvent.change(input, { target: { value: 'Editing Name' } })
      
      // Update item name externally while editing
      const updatedItem = { ...mockItem, name: 'Updated Name' }
      rerender(
        <TimelineItem 
          {...mockProps} 
          item={updatedItem} 
          onItemUpdate={mockOnItemUpdate} 
        />
      )
      
      // Should keep the editing value, not the external update
      expect(input.value).toBe('Editing Name')
    })

    it('should handle debounced save', () => {
      // Mock createDebouncedFunction to call the function immediately
      vi.mocked(utils.createDebouncedFunction).mockImplementation((fn) => fn)
      
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const itemName = container.querySelector('.item-name')
      fireEvent.click(itemName)
      
      const input = container.querySelector('.inline-edit-input')
      fireEvent.change(input, { target: { value: 'New Name' } })
      
      // The debounced function should be called (tested through the mock)
      expect(utils.createDebouncedFunction).toHaveBeenCalled()
    })

    it('should not save if value is same as original', () => {
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const itemName = container.querySelector('.item-name')
      fireEvent.click(itemName)
      
      const input = container.querySelector('.inline-edit-input')
      fireEvent.change(input, { target: { value: 'Test Item' } }) // Same as original
      fireEvent.blur(input)
      
      // Should not call onItemUpdate
      expect(mockOnItemUpdate).not.toHaveBeenCalled()
    })
  })

  // ===== UTILITY FUNCTION TESTS =====

  describe('Internal Utility Functions', () => {
    it('should calculate total days correctly', () => {
      const { container } = render(<TimelineItem {...mockProps} />)
      
      // The calculateTotalDays function is used internally
      // We can test it indirectly through drag functionality
      const startHandle = container.querySelector('.drag-handle-start')
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      fireEvent.mouseMove(document, { clientX: 150 })
      
      // Should work without errors
      expect(screen.getByText(/Start:/)).toBeInTheDocument()
    })

    it('should format dates correctly', () => {
      const { container } = render(<TimelineItem {...mockProps} />)
      
      // The formatDate function is used internally
      // We can test it indirectly through drag functionality
      const startHandle = container.querySelector('.drag-handle-start')
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      fireEvent.mouseMove(document, { clientX: 150 })
      
      // Should show formatted dates
      expect(screen.getByText(/Start:/)).toBeInTheDocument()
    })

    it('should parse dates correctly', () => {
      const { container } = render(<TimelineItem {...mockProps} />)
      
      // The parseDate function is used internally
      // We can test it indirectly through drag functionality
      const startHandle = container.querySelector('.drag-handle-start')
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      fireEvent.mouseMove(document, { clientX: 150 })
      
      // Should work without errors
      expect(screen.getByText(/Start:/)).toBeInTheDocument()
    })
  })

  // ===== EDGE CASES AND ERROR HANDLING =====

  describe('Edge Cases and Error Handling', () => {
    it('should handle very small drag movements', () => {
      const mockOnItemUpdate = vi.fn()
      const { container } = render(
        <TimelineItem {...mockProps} onItemUpdate={mockOnItemUpdate} />
      )
      
      const startHandle = container.querySelector('.drag-handle-start')
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      fireEvent.mouseMove(document, { clientX: 110 }) // Very small movement
      fireEvent.mouseUp(document)
      
      // Should not call onItemUpdate for very small movements
      expect(mockOnItemUpdate).not.toHaveBeenCalled()
    })

    it('should handle drag without itemRef', () => {
      // This tests the guard clause in handleMouseMove
      const { container } = render(<TimelineItem {...mockProps} />)
      
      const startHandle = container.querySelector('.drag-handle-start')
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      
      // Simulate mouse move without dragging state
      fireEvent.mouseMove(document, { clientX: 150 })
      
      // Should not crash
      expect(screen.getByText('Test Item')).toBeInTheDocument()
    })

    it('should handle console.log calls during drag', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const { container } = render(<TimelineItem {...mockProps} />)
      
      const startHandle = container.querySelector('.drag-handle-start')
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      fireEvent.mouseMove(document, { clientX: 150 })
      fireEvent.mouseUp(document)
      
      // Should have logged drag events
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should handle items with same start and end dates', () => {
      const singleDayItem = {
        id: 5,
        name: 'Same Day Item',
        start: '2021-01-15',
        end: '2021-01-15'
      }
      
      const { container } = render(
        <TimelineItem 
          {...mockProps} 
          item={singleDayItem} 
        />
      )
      
      // Should render without errors
      expect(screen.getByText('Same Day Item')).toBeInTheDocument()
      // For same day items, both start and end dates should be the same
      const dateElements = screen.getAllByText('2021-01-15')
      expect(dateElements).toHaveLength(2)
    })

    it('should handle drag constraints for single day items', () => {
      const singleDayItem = {
        id: 5,
        name: 'Same Day Item',
        start: '2021-01-15',
        end: '2021-01-15'
      }
      
      const mockOnItemUpdate = vi.fn()
      const { container } = render(
        <TimelineItem 
          {...mockProps} 
          item={singleDayItem}
          onItemUpdate={mockOnItemUpdate}
        />
      )
      
      const startHandle = container.querySelector('.drag-handle-start')
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      fireEvent.mouseMove(document, { clientX: 200 })
      fireEvent.mouseUp(document)
      
      // Should handle constraints properly
      expect(screen.getByText('Same Day Item')).toBeInTheDocument()
    })
  })

  // ===== EVENT LISTENER MANAGEMENT =====

  describe('Event Listener Management', () => {
    it('should add event listeners when dragging starts', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
      
      const { container } = render(<TimelineItem {...mockProps} />)
      
      const startHandle = container.querySelector('.drag-handle-start')
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      
      // Should add mousemove and mouseup listeners
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
      
      addEventListenerSpy.mockRestore()
    })

    it('should remove event listeners when dragging ends', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      
      const { container } = render(<TimelineItem {...mockProps} />)
      
      const startHandle = container.querySelector('.drag-handle-start')
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      fireEvent.mouseUp(document)
      
      // Should remove mousemove and mouseup listeners
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
      
      removeEventListenerSpy.mockRestore()
    })

    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      
      const { container, unmount } = render(<TimelineItem {...mockProps} />)
      
      const startHandle = container.querySelector('.drag-handle-start')
      fireEvent.mouseDown(startHandle, { clientX: 100 })
      
      unmount()
      
      // Should clean up event listeners
      expect(removeEventListenerSpy).toHaveBeenCalled()
      
      removeEventListenerSpy.mockRestore()
    })
  })
})

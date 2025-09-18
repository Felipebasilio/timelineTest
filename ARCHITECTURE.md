# Timeline Component Architecture

## Overview
The timeline component has been refactored into a clean, modular architecture following software design principles including Single Responsibility Principle (SRP), Separation of Concerns, and Composition over Inheritance.

## Component Hierarchy

```
App
└── TimelineContainer
    ├── TimelineHeader
    ├── TimelineRuler
    └── TimelineLanesContainer
        └── TimelineLane (multiple)
            └── TimelineItem (multiple)
```

## Component Responsibilities

### 1. **App** (`src/index.js`)
- **Responsibility**: Application entry point
- **Dependencies**: TimelineContainer, timelineItems data
- **Pattern**: Root component pattern

### 2. **TimelineContainer** (`src/components/TimelineContainer.js`)
- **Responsibility**: Main orchestrator, data processing, and state management
- **Dependencies**: All timeline sub-components, assignLanes, utils
- **Pattern**: Container component pattern
- **Key Functions**:
  - Calculates timeline boundaries
  - Assigns items to lanes
  - Coordinates all sub-components

### 3. **TimelineHeader** (`src/components/TimelineHeader.js`)
- **Responsibility**: Display timeline title and statistics
- **Dependencies**: None (pure presentational)
- **Pattern**: Presentational component pattern
- **Props**: itemCount, laneCount

### 4. **TimelineRuler** (`src/components/TimelineRuler.js`)
- **Responsibility**: Display month markers and timeline scale
- **Dependencies**: utils (generateMonthMarkers, formatMonthLabel)
- **Pattern**: Presentational component pattern
- **Props**: timelineStart, timelineEnd, totalDays

### 5. **TimelineLanesContainer** (`src/components/TimelineLanesContainer.js`)
- **Responsibility**: Container for all timeline lanes
- **Dependencies**: TimelineLane
- **Pattern**: Container component pattern
- **Props**: lanes, timelineStart, totalDays

### 6. **TimelineLane** (`src/components/TimelineLane.js`)
- **Responsibility**: Individual lane containing timeline items
- **Dependencies**: TimelineItem
- **Pattern**: Presentational component pattern
- **Props**: lane, laneIndex, timelineStart, totalDays

### 7. **TimelineItem** (`src/components/TimelineItem.js`)
- **Responsibility**: Individual timeline item display
- **Dependencies**: utils (calculateItemPosition, createItemTooltip)
- **Pattern**: Presentational component pattern
- **Props**: item, timelineStart, totalDays

## Utility Functions (`src/utils.js`)

### Shared Functions (used by multiple components):
- `calculateDaysBetween()` - Date calculations
- `calculateTimelineBoundaries()` - Timeline scope calculation
- `calculateTotalDays()` - Timeline duration
- `calculateItemPosition()` - Item positioning logic
- `generateMonthMarkers()` - Ruler marker generation
- `formatMonthLabel()` - Date formatting
- `createItemTooltip()` - Tooltip text generation

### Constants:
- `DAY_IN_MS` - Milliseconds in a day constant

## Design Patterns Applied

### 1. **Single Responsibility Principle (SRP)**
Each component has one clear responsibility:
- TimelineHeader: Display header information
- TimelineRuler: Display timeline scale
- TimelineLane: Display a single lane
- TimelineItem: Display a single item

### 2. **Separation of Concerns**
- **Presentation Logic**: Separated into individual components
- **Business Logic**: Centralized in utils.js
- **Data Processing**: Handled in TimelineContainer
- **UI State**: Managed at appropriate component levels

### 3. **Composition over Inheritance**
- Components are composed together rather than using inheritance
- Each component is self-contained and reusable

### 4. **Container/Presentational Pattern**
- **Container Components**: TimelineContainer, TimelineLanesContainer (handle data and logic)
- **Presentational Components**: All other components (focus on UI rendering)

### 5. **Dependency Injection**
- Props are passed down through the component tree
- Utils are imported where needed
- No tight coupling between components

## Benefits of This Architecture

1. **Maintainability**: Each component is focused and easy to modify
2. **Testability**: Components can be tested in isolation
3. **Reusability**: Components can be reused in different contexts
4. **Readability**: Clear separation makes code easier to understand
5. **Scalability**: Easy to add new features or modify existing ones
6. **Debugging**: Issues can be isolated to specific components

## File Structure
```
src/
├── index.js                 # App entry point
├── utils.js                 # Shared utility functions
├── assignLanes.js          # Lane assignment algorithm
├── timelineItems.js        # Sample data
├── app.css                 # Global styles
└── components/
    ├── TimelineContainer.js
    ├── TimelineHeader.js
    ├── TimelineRuler.js
    ├── TimelineLanesContainer.js
    ├── TimelineLane.js
    └── TimelineItem.js
```

This architecture follows React best practices and makes the codebase more maintainable, testable, and scalable.

# Camera Feasibility Software

A TypeScript application that analyzes whether a set of hardware cameras can provide complete coverage for a desired software camera specification.

## What it does

This software takes a target coverage (defined by distance and light level ranges) and a list of available hardware cameras, then determines if the hardware cameras can provide complete coverage of the target area.

## How it works

The application uses a **sweep line algorithm** to determine if the hardware cameras can provide complete coverage:

1. **Clip camera coverages**: All hardware camera coverage ranges are clipped to the target area bounds
2. **Create events**: For each coverage, create start and end events at the distance boundaries (with associated light level ranges)
3. **Sweep through distance**: Process events in sorted order, tracking active camera intervals at each distance
4. **Check coverage gaps**: Verify that for every segment between events:
   - There are no gaps at the start (first camera must start at or before target minimum)
   - The light range is fully covered by active cameras in each segment
   - There are no gaps at the end (cameras must extend to or beyond target maximum)

The algorithm returns `true` only if the target area is completely covered in both distance and light dimensions.

## Usage

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

### Run

```bash
npm start
```

### Development

```bash
npm run dev
```

## Example

The software includes example scenarios that demonstrate:

- **Insufficient coverage cases**: Where hardware cameras cannot provide complete coverage
- **Complete coverage with a single camera**: One camera covers the entire target area
- **Overlapping coverage**: Multiple cameras working together to provide complete coverage

Each example shows whether the software camera **CAN CONSTRUCT** ✅ or **CANNOT CONSTRUCT** ❌ based on whether the hardware cameras provide complete coverage of both distance and light level ranges.

## Requirements

- Node.js >= 16.0.0
- TypeScript

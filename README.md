# Camera Feasibility Software

A TypeScript application that analyzes whether a set of hardware cameras can provide complete coverage for a desired software camera specification.

## What it does

This software takes a target coverage area (defined by distance and light level ranges) and a list of available hardware cameras, then determines if the hardware cameras can provide 100% coverage of the target area.

## How it works

The application uses a **sweep line algorithm** to calculate the exact coverage percentage by:

1. Clipping all camera coverages to the target area bounds
2. Computing the union of all clipped coverages
3. Calculating the percentage of the target area that is covered

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

- Insufficient coverage cases
- Complete coverage with a single camera
- Complete coverage with multiple cameras

Each example shows the coverage percentage and whether the software camera can be constructed.

## Requirements

- Node.js >= 16.0.0
- TypeScript

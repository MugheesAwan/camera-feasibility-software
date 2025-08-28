import { Coverage, Range } from "./types";

// Helper function to calculate area of a coverage
const getCoverageArea = (coverage: Coverage) =>
  (coverage.distanceRange.max - coverage.distanceRange.min) *
  (coverage.lightRange.max - coverage.lightRange.min);

// Helper function to clip a range
const clipRange = (currentRange: Range, targetRange: Range) =>
  ({
    min: Math.max(currentRange.min, targetRange.min),
    max: Math.min(currentRange.max, targetRange.max),
  } as Range);

export { getCoverageArea, clipRange };

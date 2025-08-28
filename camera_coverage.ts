import { clipRange, getCoverageArea } from "./helpers";
import { Coverage, HardwareCamera, CoverageEvent, Range } from "./types";

// Clip a coverage to target bounds
function clipCoverage(
  camCoverage: Coverage,
  targetCoverage: Coverage
): Coverage | null {
  const clippedDistanceRange = clipRange(
    camCoverage.distanceRange,
    targetCoverage.distanceRange
  );
  const clippedLightRange = clipRange(
    camCoverage.lightRange,
    targetCoverage.lightRange
  );

  // Check if clipped coverage is valid
  if (
    clippedDistanceRange.min >= clippedDistanceRange.max ||
    clippedLightRange.min >= clippedLightRange.max
  ) {
    return null; // No intersection
  }

  return { distanceRange: clippedDistanceRange, lightRange: clippedLightRange };
}

// Main function to check if hardware cameras can construct the software camera
function canConstructCamera(
  desiredCoverage: Coverage,
  hardwareCameras: HardwareCamera[]
) {
  if (hardwareCameras.length === 0)
    return { canConstruct: false, coveragePercentage: 0 };

  const targetArea = getCoverageArea(desiredCoverage);
  const intersectionArea = calculateIntersectionArea(
    desiredCoverage,
    hardwareCameras.map((camera) => ({
      distanceRange: camera.distanceRange,
      lightRange: camera.lightRange,
    }))
  );

  const coveragePercentage = (intersectionArea / targetArea) * 100;

  return {
    canConstruct: coveragePercentage === 100,
    coveragePercentage,
  };
}

// Calculate intersection area between target coverage and union of coverages using Sweep line algorithm
function calculateIntersectionArea(
  targetCoverage: Coverage,
  coverageCameras: Coverage[]
): number {
  if (coverageCameras.length === 0) return 0;

  const clippedCoverages = coverageCameras
    .map((camera) => clipCoverage(camera, targetCoverage))
    .filter(Boolean) as Coverage[];

  return calculateUnionArea(clippedCoverages);
}

// Calculate the area of union of clipped coverages using sweep line algorithm
function calculateUnionArea(clippedCoverages: Coverage[]): number {
  if (clippedCoverages.length === 0) return 0;

  // Create events for sweep line
  const events: CoverageEvent[] = clippedCoverages.flatMap((coverage) => [
    {
      x: coverage.distanceRange.min,
      type: "start" as const,
      yMin: coverage.lightRange.min,
      yMax: coverage.lightRange.max,
    },
    {
      x: coverage.distanceRange.max,
      type: "end" as const,
      yMin: coverage.lightRange.min,
      yMax: coverage.lightRange.max,
    },
  ]);

  // Sort events by x-coordinate
  events.sort((a, b) => a.x - b.x);

  const activeIntervals: Range[] = [];
  let totalArea = 0;
  let lastX = events[0]?.x || 0;

  for (const event of events) {
    // Calculate area contribution from last x to current x
    if (activeIntervals.length > 0) {
      const width = event.x - lastX;
      const height = calculateActiveHeight(activeIntervals);
      totalArea += width * height;
    }

    // Update active intervals
    if (event.type === "start") {
      activeIntervals.push({ min: event.yMin, max: event.yMax });
    } else {
      // Removes the starting interval of the end event
      removeInterval(activeIntervals, event.yMin, event.yMax);
    }

    lastX = event.x;
  }

  return totalArea;
}

// Calculate total height of active intervals
function calculateActiveHeight(intervals: Range[]): number {
  if (intervals.length === 0) return 0;

  const sorted = [...intervals].sort((a, b) => a.min - b.min);
  let totalHeight = 0;
  let currentMin = sorted[0]!.min;
  let currentMax = sorted[0]!.max;

  for (let i = 1; i < sorted.length; i++) {
    const interval = sorted[i]!;
    if (interval.min <= currentMax) {
      currentMax = Math.max(currentMax, interval.max); // Extend current range in case of overlapping
    } else {
      totalHeight += currentMax - currentMin; // Add current range
      currentMin = interval.min;
      currentMax = interval.max;
    }
  }

  return totalHeight + (currentMax - currentMin); // Add the last interval
}

// Remove an interval from active intervals
function removeInterval(intervals: Range[], min: number, max: number): void {
  const index = intervals.findIndex(
    (interval) => interval.min === min && interval.max === max
  );
  if (index !== -1) intervals.splice(index, 1);
}

// Export functions
export { canConstructCamera };

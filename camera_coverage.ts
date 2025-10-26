import { Coverage, HardwareCamera, Range } from "./types";

// Main function to check if hardware cameras can construct the software camera
function canConstructCamera(
  desiredCoverage: Coverage,
  hardwareCameras: HardwareCamera[]
): boolean {
  if (hardwareCameras.length === 0) return false;

  const clippedCoverages = hardwareCameras
    .map((camera) => clipCoverage(camera, desiredCoverage))
    .filter(Boolean) as Coverage[];

  if (clippedCoverages.length === 0) return false;

  return isCompletelyCovered(desiredCoverage, clippedCoverages);
}

// Clip a coverage to target bounds
function clipCoverage(
  camCoverage: Coverage,
  targetCoverage: Coverage
): Coverage | null {
  const clippedDistanceRange = {
    min: Math.max(
      camCoverage.distanceRange.min,
      targetCoverage.distanceRange.min
    ),
    max: Math.min(
      camCoverage.distanceRange.max,
      targetCoverage.distanceRange.max
    ),
  };

  const clippedLightRange = {
    min: Math.max(camCoverage.lightRange.min, targetCoverage.lightRange.min),
    max: Math.min(camCoverage.lightRange.max, targetCoverage.lightRange.max),
  };

  if (
    clippedDistanceRange.min >= clippedDistanceRange.max ||
    clippedLightRange.min >= clippedLightRange.max
  ) {
    return null;
  }

  return { distanceRange: clippedDistanceRange, lightRange: clippedLightRange };
}

function isCompletelyCovered(
  targetCoverage: Coverage,
  coverages: Coverage[]
): boolean {
  // Create events
  const events: Array<{
    x: number;
    type: "start" | "end";
    yMin: number;
    yMax: number;
  }> = [];

  for (const coverage of coverages) {
    events.push(
      {
        x: coverage.distanceRange.min,
        type: "start",
        yMin: coverage.lightRange.min,
        yMax: coverage.lightRange.max,
      },
      {
        x: coverage.distanceRange.max,
        type: "end",
        yMin: coverage.lightRange.min,
        yMax: coverage.lightRange.max,
      }
    );
  }

  // Sort events by x
  events.sort((a, b) => a.x - b.x);

  // Check for distance gap at the start
  const firstEventX = events[0]!.x;
  if (firstEventX > targetCoverage.distanceRange.min) {
    return false;
  }

  const intervalTree = new IntervalTree();

  let lastX = events[0]!.x;

  for (const event of events) {
    // Check coverage for the segment from lastX to current event.x
    if (lastX < event.x) {
      if (intervalTree.size() === 0) {
        return false;
      }

      const merged = intervalTree.getAllMerged();
      if (!isRangeCoveredByIntervals(targetCoverage.lightRange, merged)) {
        return false;
      }
    }

    // Update active intervals
    if (event.type === "start") {
      intervalTree.insert({ min: event.yMin, max: event.yMax });
    } else {
      intervalTree.remove({ min: event.yMin, max: event.yMax });
    }

    lastX = event.x;
  }

  // Final check to ensure we've covered the entire target range
  const targetEnd = targetCoverage.distanceRange.max;
  if (lastX < targetEnd) {
    // Check if there's a gap at the end
    if (intervalTree.size() === 0) {
      return false;
    }

    const merged = intervalTree.getAllMerged();
    if (!isRangeCoveredByIntervals(targetCoverage.lightRange, merged)) {
      return false;
    }
  }
  return true;
}

// Interval Tree implementation
class IntervalTree {
  private intervals: Range[] = [];

  insert(interval: Range): void {
    // Insert interval in sorted order
    let insertPos = 0;
    for (let i = 0; i < this.intervals.length; i++) {
      if (this.intervals[i]!.min <= interval.min) {
        insertPos = i + 1;
      } else {
        break;
      }
    }

    this.intervals.splice(insertPos, 0, interval);
  }

  remove(interval: Range): void {
    // Find and remove the exact interval
    const index = this.intervals.findIndex(
      (i) => i.min === interval.min && i.max === interval.max
    );
    if (index !== -1) {
      this.intervals.splice(index, 1);
    }
  }

  getAllMerged(): Range[] {
    if (this.intervals.length === 0) return [];

    // Merge overlapping intervals
    const merged: Range[] = [];
    let current = this.intervals[0]!;

    for (let i = 1; i < this.intervals.length; i++) {
      const next = this.intervals[i]!;
      if (current.max >= next.min) {
        // Merge current interval with next interval
        current = { min: current.min, max: Math.max(current.max, next.max) };
      } else {
        // Save current interval and start new interval
        merged.push(current);
        current = next;
      }
    }

    merged.push(current);
    return merged;
  }

  size(): number {
    return this.intervals.length;
  }
}

// Check if a target range is completely covered by a set of intervals
function isRangeCoveredByIntervals(
  targetRange: Range,
  intervals: Range[]
): boolean {
  if (intervals.length === 0) return false;
  if (intervals[0]!.min > targetRange.min) return false;

  let currentEnd = intervals[0]!.max;

  for (let i = 1; i < intervals.length; i++) {
    const interval = intervals[i]!;

    if (interval.min > currentEnd) {
      if (currentEnd >= targetRange.max) return true;
      return false;
    }

    currentEnd = Math.max(currentEnd, interval.max);

    if (currentEnd >= targetRange.max) return true;
  }

  return currentEnd >= targetRange.max;
}

export { canConstructCamera };

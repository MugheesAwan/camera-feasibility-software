// Types and Interfaces for Coverage
interface Range {
  min: number;
  max: number;
}
interface Coverage {
  distanceRange: Range;
  lightRange: Range;
}

interface HardwareCamera {
  id: string;
  distanceRange: Range;
  lightRange: Range;
}

interface CoverageEvent {
  x: number;
  type: "start" | "end";
  yMin: number;
  yMax: number;
}

export { Coverage, HardwareCamera, CoverageEvent, Range };

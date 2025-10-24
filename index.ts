import { Coverage, HardwareCamera } from "./types";
import { canConstructCamera } from "./camera_coverage";

// Example usage and test cases
function runExamples() {
  console.log("=== Camera Coverage Analysis ===\n");

  const desiredCoverage: Coverage = {
    distanceRange: { min: 0.5, max: 50 },
    lightRange: { min: 1, max: 10000 },
  };

  const examples: {
    name: string;
    cameras: HardwareCamera[];
  }[] = [
    {
      name: "Insufficient Coverage",
      cameras: [
        {
          id: "Camera A",
          distanceRange: { min: 0.5, max: 10 },
          lightRange: { min: 1, max: 1000 },
        },
        {
          id: "Camera B",
          distanceRange: { min: 5, max: 25 },
          lightRange: { min: 100, max: 5000 },
        },
        {
          id: "Camera C",
          distanceRange: { min: 20, max: 50 },
          lightRange: { min: 500, max: 10000 },
        },
      ],
    },
    {
      name: "Complete Coverage (100%)",
      cameras: [
        {
          id: "Camera 1",
          distanceRange: { min: 0.5, max: 50 },
          lightRange: { min: 1, max: 10000 },
        },
      ],
    },
    {
      name: "Complete Coverage with Multiple Cameras",
      cameras: [
        {
          id: "Camera Alpha",
          distanceRange: { min: 0.5, max: 10 },
          lightRange: { min: 1, max: 5000 },
        },
        {
          id: "Camera Beta",
          distanceRange: { min: 0.5, max: 10 },
          lightRange: { min: 5000, max: 10000 },
        },
        {
          id: "Camera Gamma",
          distanceRange: { min: 0.4, max: 50 },
          lightRange: { min: 1, max: 10000 },
        },
      ],
    },
  ];

  // Run all examples
  examples.forEach((example, index) => {
    const result = canConstructCamera(desiredCoverage, example.cameras);

    console.log(`Example ${index + 1}: ${example.name}`);
    console.log("Requirements:", desiredCoverage);
    console.log(
      "Hardware Cameras:",
      example.cameras.map((c) => c.id)
    );
    console.log("Result:", result ? "✅ CAN CONSTRUCT" : "❌ CANNOT CONSTRUCT");
  });
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}

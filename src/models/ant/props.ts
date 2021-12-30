/**
 * Map of all UI accessible properties of entity. If you want to add a new property to the UI, add it to this list.
 */
import Ant from "./index";

const AntProps: UiPropList<Ant> = [
  {
    key: "speed",
    name: "Speed",
    type: "range",
    min: 0.1,
    max: 3,
    increment: 0.1,
    initialValue: 0.5,
  },
  {
    key: "wiggleRange",
    name: "Wiggle Range",
    type: "range",
    increment: 0.001,
    min: 0,
    max: 0.01,
    initialValue: 0.003,
  },
  {
    key: "wiggleVariance",
    name: "Wiggle Variance",
    type: "range",
    min: 0,
    max: 0.001,
    increment: 0.00005,
    initialValue: 0.0001,
  },
  {
    key: "turnChance",
    name: "Turn Chance",
    description:
      "% Chance that the ant will make a turn per step. Normalized value",
    type: "range",
    min: 0,
    max: 0.5,
    increment: 0.005,
    initialValue: 0.01,
  },
  {
    key: "turnRange",
    name: "Turn Range",
    description:
      "Max angle of the ant turning behavior. Value is half theta of the full turning range.",
    type: "range",
    min: 0,
    max: Math.PI,
    increment: 0.1,
    initialValue: 1,
  },
  {
    key: "steerStrength",
    name: "Steer Strength",
    description:
      "Strength of the steering force. Lower values result in larger turn radii.",
    type: "range",
    min: 0,
    max: 1,
    increment: 0.01,
    initialValue: 0.1,
  },
  {
    key: "foodDetectionRange",
    name: "Food Detection Range",
    description: "Minimum food pickup distance",
    type: "range",
    min: 1,
    max: 5,
    increment: 0.1,
    initialValue: 2,
  },
  {
    key: "pheromoneTimePeriod",
    name: "Pheromone Step Period",
    description: "Amount of steps between placing of new pheromones.",
    type: "range",
    min: 1,
    max: 20,
    increment: 1,
    initialValue: 8,
    group: "pheromones",
  },
  {
    key: "pheromoneSensorRadius",
    name: "Pheromone Sensor Radius",
    description: "Radius of the ant pheromone sensors.",
    type: "range",
    min: 1,
    max: 16,
    increment: 1,
    initialValue: 4,
    group: "pheromones",
  },
  {
    key: "pheromoneSensorDistance",
    name: "Pheromone Sensor Distance",
    description: "Distance between the ant and its pheromone sensors",
    type: "range",
    min: 1,
    max: 20,
    increment: 1,
    initialValue: 7,
    group: "pheromones",
  },
  {
    key: "pheromoneSensorAngle",
    name: "Pheromone Sensor Angle",
    description:
      "Angle in theta between the left or right sensor and the center sensor.",
    type: "range",
    min: 0,
    max: 2,
    increment: 0.0001,
    initialValue: 1.0472,
    group: "pheromones",
  },
  {
    key: "pheromoneSteerAngle",
    name: "Pheromone Steer Angle",
    description:
      "Angle in theta for the ant to turn when detecting a relevant pheromone.",
    type: "range",
    min: 0,
    max: 2,
    increment: 0.0001,
    initialValue: 1.0472,
    group: "pheromones",
  },
];

export default AntProps;

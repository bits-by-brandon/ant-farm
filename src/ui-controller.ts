import Simulation from "./simulation";
import Entity from "./models/entity";
import { visibilityLayerName } from "./models/world";

export default class UiController {
  readonly simulation: Simulation;

  constructor(simulation: Simulation) {
    this.simulation = simulation;
  }

  hideMapInput(id: string) {
    const input = document.getElementById(id);
    if (!input) throw new Error(`No file input found with id ${id}`);
    input.setAttribute("disabled", "true");
  }

  bindPropertySlider<T extends Entity = Entity>(
    id: string,
    entityLayerId: string,
    property: keyof T
  ) {
    const slider = document.getElementById(id) as HTMLInputElement;
    const layer = this.simulation.world.entityLayers.get(entityLayerId);
    if (!layer) {
      throw new Error(
        `Empty entity layer for given entityLayer id ${entityLayerId}`
      );
    }

    const [entity] = layer.entities as Set<T>;
    // @ts-ignore
    slider.value = entity[property];
    slider.removeAttribute("disabled");
    slider.addEventListener("change", (e) => {
      if (!e.target || !(e.target instanceof HTMLInputElement)) return;
      const layer = this.simulation.world.entityLayers.get(entityLayerId);
      if (!layer) {
        throw new Error(
          `Empty entity layer for given entityLayer id ${entityLayerId}`
        );
      }
      for (const entity of layer.entities as Set<T>) {
        // @ts-ignore
        entity[property] = parseInt(e.target.value);
      }
    });
  }

  bindVisibilityLayerToggle(id: string, layerName: visibilityLayerName) {
    const toggle = document.getElementById(id);
    if (!toggle || !(toggle instanceof HTMLInputElement)) {
      throw new Error(
        `Visibility layer toggle with id ${id}, does not exist, or is not an <input>`
      );
    }

    toggle.removeAttribute("disabled");
    toggle.addEventListener("change", (e) => {
      if (!e.target || !(e.target instanceof HTMLInputElement)) return;
      this.simulation.setVisibilityLayer(layerName, e.target.checked);
    });
  }

  bindPlayPause(id: string) {
    const playPauseButton = document.getElementById(id);
    if (!playPauseButton || !(playPauseButton instanceof HTMLButtonElement)) {
      throw new Error(
        `Play/Pause button with id ${id}, does not exist, or is not a <button>`
      );
    }

    playPauseButton.addEventListener("click", () => {
      if (this.simulation.state === "playing") {
        this.simulation.stop();
      } else {
        this.simulation.start();
      }
    });
  }
}

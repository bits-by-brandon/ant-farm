import Simulation from "../models/simulation";
import { visibilityLayerName } from "../models/world";
import AntProps from "../models/ant/props";
import Ant from "../models/ant";

export default class UiController {
  readonly simulation: Simulation;
  private _playPauseButton: HTMLButtonElement | null;
  private _mapInput: HTMLInputElement | null;
  private _stepButton: HTMLButtonElement | null;
  private _propertySliders: NodeListOf<HTMLInputElement> | null;

  constructor(simulation: Simulation) {
    this.simulation = simulation;
    this._mapInput = null;
    this._playPauseButton = null;
    this._propertySliders = null;
    this._stepButton = null;
  }

  getElement<T extends HTMLElement>(id: string) {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Could not find element with id ${id}`);
    return el as T;
  }

  get mapInput() {
    if (this._mapInput) return this._mapInput;
    this._mapInput = this.getElement<HTMLInputElement>("map-upload-input");
    return this._mapInput;
  }

  hideMapInput() {
    this.mapInput.setAttribute("disabled", "true");
    this.mapInput.parentElement!.classList.add("disabled");
  }

  get propertySliders(): NodeListOf<HTMLInputElement> {
    if (this._propertySliders) return this._propertySliders;
    this._propertySliders = document.querySelectorAll<HTMLInputElement>(
      "[data-simulation-property]"
    );
    return this._propertySliders as NodeListOf<HTMLInputElement>;
  }

  bindAllPropertySliders() {
    const controls = this.getElement<HTMLDivElement>("controls");
    for (const prop of AntProps) {
      if (prop.type === "range") {
        const { input, container } = createRangeSlider(prop);
        this.bindPropertySlider<Ant>(input, prop, "Ant");
        controls.appendChild(container);
      }
    }
  }

  bindPropertySlider<T>(
    slider: HTMLInputElement,
    property: UiRangeProp<T>,
    layerId: string
  ) {
    const layer = this.simulation.world.entityLayers.get(layerId);
    if (!layer) throw Error(`No layer with id ${layerId}`);

    slider.value = property.initialValue.toString();
    slider.addEventListener("change", (e) => {
      for (const entity of layer.entities) {
        if (!(property.key in entity)) continue;
        // @ts-ignore - We know that the property.key exists on the given entity
        entity[property.key] = parseInt(e.target.value);
      }

      this.simulation.draw();
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

  get playPauseButton() {
    if (this._playPauseButton) return this._playPauseButton;
    this._playPauseButton =
      this.getElement<HTMLButtonElement>("play-pause-button");
    return this._playPauseButton;
  }

  bindPlayPause() {
    this.playPauseButton.removeAttribute("disabled");
    this.playPauseButton.addEventListener("click", () => {
      if (this.simulation.state === "playing") {
        this.playPauseButton.classList.add("playing");
        this.simulation.stop();
      } else {
        this.playPauseButton.classList.remove("playing");
        this.simulation.start();
      }
    });
  }

  get bindStepButton() {
    if (this._stepButton) return this._stepButton;
    this._stepButton = this.getElement<HTMLButtonElement>("step-button");
    return this._stepButton;
  }

  bindStep() {
    this.bindStepButton.removeAttribute("disabled");
    this.bindStepButton.addEventListener("click", () => {
      this.simulation.step();
    });
  }
}

function createRangeSlider<T>(property: UiRangeProp<T>) {
  const container = document.createElement("div");
  container.classList.add("control__container", "control__container--slider");

  const label = document.createElement("label");
  label.setAttribute("for", property.key.toString());
  label.innerText = property.name;

  const input = document.createElement("input");
  input.setAttribute("disabled", "true");
  input.setAttribute("id", property.key.toString());
  input.setAttribute("type", "range");
  input.setAttribute("min", property.min.toString());
  input.setAttribute("max", property.max.toString());
  input.setAttribute("step", property.increment.toString());
  input.setAttribute("value", property.initialValue.toString());

  container.appendChild(label);
  container.appendChild(input);
  return { input, container };
}

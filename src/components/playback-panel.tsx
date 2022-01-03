import { useContext } from "react";
import { SimulationContext } from "./simulation-context";
import classNames from "classnames";

export default function PlaybackPanel() {
  const { stop, start, simulationState } = useContext(SimulationContext);

  function handlePlayPauseClick() {
    if (simulationState === "paused") start();
    if (simulationState === "playing") stop();
  }

  return (
    <div className="playback-panel">
      <button
        className={classNames("playback-button play-pause-button", {
          playing: simulationState === "playing",
        })}
        onClick={handlePlayPauseClick}
      />
      <button className="playback-button step-button" />
    </div>
  );
}

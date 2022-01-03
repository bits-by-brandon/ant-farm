import { useContext } from "react";
import { SimulationContext } from "./simulation-context";

export default function PlaybackPanel() {
  const { stop, start } = useContext(SimulationContext);

  return (
    <div className="playback-panel">
      <button
        className="playback-button play-pause-button"
        onClick={() => start()}
      />
      <button className="playback-button step-button" onClick={() => stop()} />
    </div>
  );
}

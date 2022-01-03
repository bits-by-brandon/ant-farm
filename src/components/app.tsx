import Controls from "./controls";
import PlaybackPanel from "./playback-panel";

export default function App() {
  return (
    <>
      <img src="" alt="" id="img-map" />
      <main>
        <canvas id="main-canvas" />
        <Controls />
        <PlaybackPanel />
      </main>
    </>
  );
}

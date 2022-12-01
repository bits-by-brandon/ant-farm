import { useContext, useEffect, useRef, useState } from "react";
import Controls from "./controls";
import PlaybackPanel from "./playback-panel";
import { SimulationContext } from "./simulation-context";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setZoom, moveViewport } = useContext(SimulationContext);
  const [drag, setDrag] = useState({
    last: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
    isDragging: false,
  });

  const handleWheel = (event: WheelEvent) => {
    setZoom(event.deltaY * -0.001);
  };

  const dragStart = (event: MouseEvent) => {
    setDrag({
      last: { x: event.clientX, y: event.clientY },
      current: { x: event.clientX, y: event.clientY },
      isDragging: true,
    });
  };

  const dragEnd = () => {
    setDrag({
      last: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
      isDragging: false,
    });
  };

  const mouseMove = (event: MouseEvent) => {
    if (drag.isDragging) {
      setDrag((prev) => {
        const last = { ...prev.current };
        const current = { x: event.clientX, y: event.clientY };
        const delta = {
          x: (current.x - last.x) * 0.5,
          y: (current.y - last.y) * 0.5,
        };
        moveViewport(delta.x, delta.y);
        return {
          last,
          current,
          isDragging: true,
        };
      });
    }
  };

  return (
    <main>
      <div className="main-container">
        <Controls />
        <canvas
          ref={canvasRef}
          id="main-canvas"
          onWheel={handleWheel}
          onMouseDown={dragStart}
          onMouseUp={dragEnd}
          onMouseLeave={dragEnd}
          onMouseMove={mouseMove}
        />
      </div>
      <PlaybackPanel />
    </main>
  );
}

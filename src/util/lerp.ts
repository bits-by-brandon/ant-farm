export default function lerp(start: number, stop: number, amt: number) {
  return amt * (stop - start) + start;
}

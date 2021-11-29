export default function map(
  x: number,
  start1: number,
  stop1: number,
  start2: number,
  stop2: number
) {
  return ((x - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}

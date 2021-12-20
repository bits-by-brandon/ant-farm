/**
 * @param x - Value to be mapped
 * @param start1 - Min value of x
 * @param stop1 - Max value of
 * @param start2 - Min value of mapped range
 * @param stop2 - Max value of mapped range
 */
export default function map(
  x: number,
  start1: number,
  stop1: number,
  start2: number,
  stop2: number
) {
  return ((x - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}

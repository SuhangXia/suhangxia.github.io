/** Explicitly illustrative milliseconds; no experimental timing is inferred here. */
export const timingExample = {
  reference: 0,
  decision: 80,
  tolerance: 60,
  streams: [
    { name: 'Wrist RGB', delay: 55, observations: [-66, -33, 0] },
    { name: 'Quest', delay: 10, observations: [-30, 10, 50] },
    { name: 'Left tactile', delay: 35, observations: [-90, -40, -5] },
    { name: 'Right tactile', delay: 90, observations: [-90, -45, 5] },
  ],
};

export function selectTimingSample(
  observations: number[], delay: number, reference: number,
  decision: number, tolerance: number, enforceAvailability: boolean,
): number | null {
  const eligible = observations.filter((time) =>
    Math.abs(time - reference) <= tolerance
    && (!enforceAvailability || time + delay <= decision));
  return eligible.reduce<number | null>((best, time) =>
    best === null || Math.abs(time - reference) < Math.abs(best - reference) ? time : best, null);
}

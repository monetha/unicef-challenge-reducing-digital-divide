export function getColorClassByScore(indicatorScore: number) {
  if (!indicatorScore) {
    return 'mh-gray';
  }

  if (indicatorScore < 0.33) {
    return 'mh-red';
  }

  if (indicatorScore < 0.77) {
    return 'mh-yellow';
  }

  return 'mh-green';
}

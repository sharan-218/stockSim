export function computePercentile(paths, percentile) {
  const maxLen = Math.max(...paths.map((p) => p.length));

  return Array.from({ length: maxLen }, (_, i) => {
    const vals = [];
    for (let j = 0; j < paths.length; j++) {
      const v = paths[j][i];
      if (v !== undefined) vals.push(v);
    }

    if (vals.length === 0) return null;

    vals.sort((a, b) => a - b);
    const idx = Math.floor((percentile / 100) * vals.length);

    return vals[idx] ?? vals[vals.length - 1];
  });
}

export function computeAveragePath(paths) {
  const maxLen = Math.max(...paths.map((p) => p.length));

  return Array.from({ length: maxLen }, (_, i) => {
    let sum = 0;
    let count = 0;

    for (let j = 0; j < paths.length; j++) {
      const v = paths[j][i];
      if (v !== undefined) {
        sum += v;
        count++;
      }
    }

    return count === 0 ? null : sum / count;
  });
}

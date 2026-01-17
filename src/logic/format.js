export const formatNumber = (num) => {
  if (num >= 1e12) {
      return num.toExponential(2).replace('+', '');
  }
  if (num >= 1e9) {
      const val = num / 1e9;
      return parseFloat(val.toPrecision(3)) + 'B';
  }
  if (num >= 1e6) {
      const val = num / 1e6;
      let p = parseFloat(val.toPrecision(3));
      if (p >= 1000) return (p/1000) + 'B';
      return p + 'M';
  }
  if (num >= 1e3) {
      const val = num / 1e3;
      let p = parseFloat(val.toPrecision(3));
      if (p >= 1000) return (p/1000) + 'M';
      return p + 'k';
  }
  if (num >= 100) return num.toFixed(0);
  return parseFloat(num.toPrecision(3)).toString();
};

export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
};

export const formatTimeShort = (seconds) => {
  if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h ${m}m`;
  }
  const m = Math.floor(seconds / 60);
  return `${m}m`;
};

// Simple, internal Object.assign() polyfill for options objects etc.

function assign(tgt, ...srcs) {
  srcs.forEach((src) => {
    Object.keys(src).forEach((k) => (tgt[k] = src[k]));
  });

  return tgt;
}

export const generateGetBoundingClientRect = (x = 0, y = 0) => {
  return () => ({
    width: 0,
    height: 0,
    top: y,
    right: x,
    bottom: y,
    left: x
  });
};

export default Object.assign != null ? Object.assign.bind(Object) : assign;

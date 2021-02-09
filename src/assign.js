// Simple, internal Object.assign() polyfill for options objects etc.

function assign(tgt, ...srcs) {
  srcs.forEach((src) => {
    Object.keys(src).forEach((k) => (tgt[k] = src[k]));
  });

  return tgt;
}

export default Object.assign != null ? Object.assign.bind(Object) : assign;

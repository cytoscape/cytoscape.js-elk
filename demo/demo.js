document.addEventListener('DOMContentLoaded', () => {
  const script = Object.assign(document.createElement('script'), {
    src: './demo-layered.js'
  });
  document.body.appendChild(script);
});

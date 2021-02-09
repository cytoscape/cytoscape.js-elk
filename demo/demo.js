const demos = [
  'box',
  'demo',
  'disco',
  'force',
  'layered',
  'mrtree',
  'random',
  'stress',
];

function populateDemosList() {
  const el = document.getElementById('demos');
  demos.forEach((demo) => {
    const li = document.createElement('li');
    const a = Object.assign(document.createElement('a'), {
      href: `?demo=${demo}`,
      innerText: demo,
    });
    li.appendChild(a);
    el.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  populateDemosList();
  const demoMatch = /demo=([a-z]+)/.exec(location.search);
  if (demoMatch) {
    const script = Object.assign(document.createElement('script'), {
      src: `./demo-${demoMatch[1]}.js`,
    });
    document.body.appendChild(script);
  }
});

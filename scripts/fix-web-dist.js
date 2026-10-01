// O arrastar-e-soltar do Netlify descarta pastas chamadas "node_modules", e o Expo
// põe as fontes e ícones em dist/assets/node_modules. Sem eles o site cai na fonte do
// sistema. Este script renomeia a pasta para "vendor" e corrige as referências no bundle.
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const from = path.join(dist, 'assets', 'node_modules');
const to = path.join(dist, 'assets', 'vendor');

if (fs.existsSync(from)) {
  fs.rmSync(to, { recursive: true, force: true });
  fs.renameSync(from, to);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

let changed = 0;
for (const file of walk(dist)) {
  if (!/\.(js|html|json|css)$/.test(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  const out = src.split('assets/node_modules/').join('assets/vendor/');
  if (out !== src) {
    fs.writeFileSync(file, out);
    changed++;
  }
}
console.log(`assets/vendor pronto; ${changed} arquivo(s) corrigido(s).`);

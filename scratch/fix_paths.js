const fs = require('fs');
const path = 'h:/Proyectos2025/webveliyoth/src/data/db.json';
const db = JSON.parse(fs.readFileSync(path, 'utf8'));

db.version = "1.3";
db.heroImage = "/hero.png?v=1.3";

db.products.forEach(p => {
  if (p.image) {
    p.image = p.image.replace(/ /g, '-');
  }
});

db.promotions.forEach(p => {
  if (p.image) {
    p.image = p.image.replace(/ /g, '-');
  }
});

fs.writeFileSync(path, JSON.stringify(db, null, 2));
console.log('db.json actualizado con guiones y versión 1.3');

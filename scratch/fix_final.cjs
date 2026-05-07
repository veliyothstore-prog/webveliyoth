const fs = require('fs');
const path = 'h:/Proyectos2025/webveliyoth/src/data/db.json';
const db = JSON.parse(fs.readFileSync(path, 'utf8'));

db.version = "1.5";
db.heroImage = "/hero.png?v=1.5";

db.products.forEach(p => {
  if (p.image) {
    // Restore spaces and add version
    p.image = p.image.replace(/-/g, ' ').split('?')[0] + "?v=1.5";
  }
});

db.promotions.forEach(p => {
  if (p.image) {
    p.image = p.image.replace(/-/g, ' ').split('?')[0] + "?v=1.5";
  }
});

fs.writeFileSync(path, JSON.stringify(db, null, 2));

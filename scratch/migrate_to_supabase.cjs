const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://ckvdqbupetgfszfaxhpe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdmRxYnVwZXRnZnN6ZmF4aHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODE1MDcsImV4cCI6MjA5Mzc1NzUwN30.5S3qwS6uKhtzZT2cVzow32cLxL1o9ngbG859e1rLXZE';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const dbPath = 'h:/Proyectos2025/webveliyoth/src/data/db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

async function migrate() {
    console.log('--- Iniciando Migración a Supabase ---');

    // 1. Categorías
    console.log('Subiendo categorías...');
    const { error: catErr } = await supabase.from('categories').upsert(db.categories);
    if (catErr) console.error('Error en categorías:', catErr);

    // 2. Marcas (Extraer de los productos)
    console.log('Subiendo marcas...');
    const brands = [...new Set(db.products.map(p => p.brand))].filter(b => b).map(b => ({
        id: b.toLowerCase(),
        name: b
    }));
    await supabase.from('brands').upsert(brands);

    // 3. Productos
    console.log('Subiendo productos...');
    const productsToUpload = db.products.map(p => ({
        id: p.id,
        title: p.title,
        brand: p.brand ? p.brand.toLowerCase() : null,
        price: p.price,
        image: p.image,
        category: p.category,
        type: p.type || null,
        details: p.details || {}
    }));
    const { error: prodErr } = await supabase.from('products').upsert(productsToUpload);
    if (prodErr) console.error('Error en productos:', prodErr);

    // 4. Promociones
    console.log('Subiendo promociones...');
    const { error: promoErr } = await supabase.from('promotions').upsert(db.promotions);
    if (promoErr) console.error('Error en promociones:', promoErr);

    // 5. Config
    console.log('Subiendo configuración...');
    await supabase.from('config').upsert([
        { key: 'store_config', value: { heroImage: db.heroImage, version: db.version } }
    ]);

    console.log('--- Migración Completada con Éxito ---');
}

migrate();

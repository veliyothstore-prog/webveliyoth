const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://ckvdqbupetgfszfaxhpe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdmRxYnVwZXRnZnN6ZmF4aHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODE1MDcsImV4cCI6MjA5Mzc1NzUwN30.5S3qwS6uKhtzZT2cVzow32cLxL1o9ngbG859e1rLXZE';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const publicDir = 'h:/Proyectos2025/webveliyoth/public';

async function uploadFolder(folderPath, bucketFolder) {
    const fullPath = path.join(publicDir, folderPath);
    if (!fs.existsSync(fullPath)) return;

    const files = fs.readdirSync(fullPath);
    for (const file of files) {
        const filePath = path.join(fullPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            await uploadFolder(path.join(folderPath, file), path.join(bucketFolder, file));
            continue;
        }

        const fileBuffer = fs.readFileSync(filePath);
        const storagePath = `${bucketFolder}/${file}`.replace(/\\/g, '/');

        console.log(`Subiendo: ${storagePath}...`);
        const { error } = await supabase.storage
            .from('catalogo')
            .upload(storagePath, fileBuffer, {
                contentType: 'image/png', // Ajustar si hay otros tipos
                upsert: true
            });

        if (error) console.error(`Error subiendo ${file}:`, error.message);
    }
}

async function startMigration() {
    console.log('--- Migrando Imágenes a la Nube ---');
    
    // Subir carpetas principales
    await uploadFolder('catalogo/kit', 'kit');
    await uploadFolder('catalogo/laptops/imagenes', 'laptops/imagenes');
    
    // Subir logo y hero
    const logoBuffer = fs.readFileSync(path.join(publicDir, 'logo.png'));
    await supabase.storage.from('catalogo').upload('logo.png', logoBuffer, { upsert: true });
    
    const heroBuffer = fs.readFileSync(path.join(publicDir, 'hero.png'));
    await supabase.storage.from('catalogo').upload('hero.png', heroBuffer, { upsert: true });

    console.log('--- Actualizando enlaces en la Base de Datos ---');
    
    const { data: products } = await supabase.from('products').select('id, image');
    
    for (const prod of products) {
        if (prod.image && prod.image.startsWith('/catalogo/')) {
            const newPath = prod.image.replace('/catalogo/', '');
            const { data } = supabase.storage.from('catalogo').getPublicUrl(newPath);
            await supabase.from('products').update({ image: data.publicUrl }).eq('id', prod.id);
        }
    }

    // Actualizar Hero en Config
    const { data: publicHero } = supabase.storage.from('catalogo').getPublicUrl('hero.png');
    const { data: config } = await supabase.from('config').select('*').eq('key', 'store_config').single();
    if (config) {
        config.value.heroImage = publicHero.publicUrl;
        await supabase.from('config').update({ value: config.value }).eq('key', 'store_config');
    }

    console.log('--- Migración Finalizada ---');
}

startMigration();

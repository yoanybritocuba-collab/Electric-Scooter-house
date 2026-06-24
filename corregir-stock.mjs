import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, './credentials/serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function corregirStockCombinaciones() {
  try {
    console.log('Conectando a Firestore...');
    const productosSnapshot = await db.collection('productos').get();
    
    console.log('Encontrados ' + productosSnapshot.size + ' productos.');
    let corregidos = 0;
    let errores = 0;
    
    for (const doc of productosSnapshot.docs) {
      const data = doc.data();
      const opciones = data.opciones || {};
      const colores = opciones.colores || [];
      
      // Verificar si tiene stockCombinaciones mal formado
      const stockCombinacionesActual = data.stockCombinaciones;
      
      // Si no tiene colores, saltar
      if (colores.length === 0) {
        console.log('Producto ' + (data.nombre || doc.id) + ': Sin colores, saltando...');
        continue;
      }
      
      // Crear nuevo stockCombinaciones correcto
      const nuevoStockCombinaciones = colores.map(color => ({
        colorId: color.id || '',
        stock: color.stock || 0,
        voltajeId: '',
        potenciaId: '',
        amperioId: ''
      }));
      
      // Si ya tiene stockCombinaciones pero es un string mal formado, lo reemplazamos
      if (typeof stockCombinacionesActual === 'string') {
        await doc.ref.update({
          stockCombinaciones: nuevoStockCombinaciones
        });
        corregidos++;
        console.log('✅ ' + (data.nombre || doc.id) + ': Corregido (era string)');
      }
      // Si no tiene stockCombinaciones, lo añadimos
      else if (!stockCombinacionesActual || stockCombinacionesActual.length === 0) {
        await doc.ref.update({
          stockCombinaciones: nuevoStockCombinaciones
        });
        corregidos++;
        console.log('✅ ' + (data.nombre || doc.id) + ': Añadido stockCombinaciones');
      }
      // Si ya está bien formado, lo dejamos igual
      else {
        console.log('✅ ' + (data.nombre || doc.id) + ': Ya está correcto');
      }
    }
    
    console.log('\n--- PROCESO COMPLETADO ---');
    console.log('Productos corregidos: ' + corregidos);
    console.log('Errores: ' + errores);
  } catch (error) {
    console.error('Error:', error);
  }
}

corregirStockCombinaciones();

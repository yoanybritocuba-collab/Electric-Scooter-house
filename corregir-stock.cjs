const admin = require('firebase-admin');
const serviceAccount = require('./credentials/serviceAccountKey.json');

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
    
    for (const doc of productosSnapshot.docs) {
      const data = doc.data();
      const opciones = data.opciones || {};
      const colores = opciones.colores || [];
      
      const stockCombinacionesActual = data.stockCombinaciones;
      
      if (colores.length === 0) {
        console.log('Producto ' + (data.nombre || doc.id) + ': Sin colores, saltando...');
        continue;
      }
      
      const nuevoStockCombinaciones = colores.map(color => ({
        colorId: color.id || '',
        stock: color.stock || 0,
        voltajeId: '',
        potenciaId: '',
        amperioId: ''
      }));
      
      if (typeof stockCombinacionesActual === 'string') {
        await doc.ref.update({
          stockCombinaciones: nuevoStockCombinaciones
        });
        corregidos++;
        console.log('Corregido: ' + (data.nombre || doc.id) + ' (era string)');
      }
      else if (!stockCombinacionesActual || stockCombinacionesActual.length === 0) {
        await doc.ref.update({
          stockCombinaciones: nuevoStockCombinaciones
        });
        corregidos++;
        console.log('Añadido: ' + (data.nombre || doc.id));
      }
      else {
        console.log('OK: ' + (data.nombre || doc.id) + ' (ya esta bien)');
      }
    }
    
    console.log('PROCESO COMPLETADO!');
    console.log('Productos corregidos: ' + corregidos);
  } catch (error) {
    console.error('Error:', error);
  }
}

corregirStockCombinaciones();

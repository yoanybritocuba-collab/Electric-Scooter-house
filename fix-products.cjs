const admin = require('firebase-admin');
const serviceAccount = require('./credentials/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function arreglarProductos() {
  try {
    console.log('Conectando a Firestore...');
    const snapshot = await db.collection('productos').get();
    console.log('Encontrados ' + snapshot.size + ' productos.');
    
    let actualizados = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      let cambios = false;
      
      if (!data.opciones) {
        data.opciones = {};
        cambios = true;
      }
      
      if (data.opciones.amperios === undefined) {
        data.opciones.amperios = [];
        cambios = true;
      }
      if (data.opciones.colores === undefined) {
        data.opciones.colores = [];
        cambios = true;
      }
      if (data.opciones.voltajes === undefined) {
        data.opciones.voltajes = [];
        cambios = true;
      }
      if (data.opciones.potencias === undefined) {
        data.opciones.potencias = [];
        cambios = true;
      }
      
      if (cambios) {
        await doc.ref.update({
          opciones: data.opciones
        });
        actualizados++;
        console.log('OK: ' + (data.nombre || doc.id) + ' actualizado');
      } else {
        console.log('SKIP: ' + (data.nombre || doc.id) + ' ya esta correcto');
      }
    }
    
    console.log('Proceso completado!');
    console.log('Productos actualizados: ' + actualizados);
  } catch (error) {
    console.error('Error:', error);
  }
}

arreglarProductos();

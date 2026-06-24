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

async function actualizarStockCombinaciones() {
  try {
    console.log('Conectando a Firestore...');
    const productosSnapshot = await db.collection('productos').get();
    
    console.log('Encontrados ' + productosSnapshot.size + ' productos.');
    let actualizados = 0;
    
    for (const doc of productosSnapshot.docs) {
      const data = doc.data();
      const opciones = data.opciones || {};
      const colores = opciones.colores || [];
      const voltajes = opciones.voltajes || [];
      const potencias = opciones.potencias || [];
      const amperios = opciones.amperios || [];
      
      console.log('Procesando: ' + (data.nombre || doc.id));
      
      if (colores.length === 0 && voltajes.length === 0 && potencias.length === 0 && amperios.length === 0) {
        console.log('   Sin opciones configurables.');
        continue;
      }
      
      const combinaciones = [];
      
      if (colores.length > 0 && voltajes.length === 0 && potencias.length === 0 && amperios.length === 0) {
        console.log('   Solo colores (' + colores.length + ')');
        colores.forEach(color => {
          combinaciones.push({
            voltajeId: '',
            potenciaId: '',
            amperioId: '',
            colorId: color.id || '',
            stock: color.stock || 0
          });
        });
      }
      else if (colores.length > 0 && voltajes.length > 0 && potencias.length === 0 && amperios.length === 0) {
        console.log('   Colores (' + colores.length + ') + Voltajes (' + voltajes.length + ')');
        colores.forEach(color => {
          voltajes.forEach(voltaje => {
            combinaciones.push({
              voltajeId: voltaje.id || '',
              potenciaId: '',
              amperioId: '',
              colorId: color.id || '',
              stock: Math.min(color.stock || 0, voltaje.stock || 0)
            });
          });
        });
      }
      else if (colores.length > 0 && potencias.length > 0 && voltajes.length === 0 && amperios.length === 0) {
        console.log('   Colores (' + colores.length + ') + Potencias (' + potencias.length + ')');
        colores.forEach(color => {
          potencias.forEach(potencia => {
            combinaciones.push({
              voltajeId: '',
              potenciaId: potencia.id || '',
              amperioId: '',
              colorId: color.id || '',
              stock: Math.min(color.stock || 0, potencia.stock || 0)
            });
          });
        });
      }
      else if (colores.length > 0 && voltajes.length > 0 && potencias.length > 0 && amperios.length === 0) {
        console.log('   Colores (' + colores.length + ') + Voltajes (' + voltajes.length + ') + Potencias (' + potencias.length + ')');
        colores.forEach(color => {
          voltajes.forEach(voltaje => {
            potencias.forEach(potencia => {
              combinaciones.push({
                voltajeId: voltaje.id || '',
                potenciaId: potencia.id || '',
                amperioId: '',
                colorId: color.id || '',
                stock: Math.min(color.stock || 0, voltaje.stock || 0, potencia.stock || 0)
              });
            });
          });
        });
      }
      else if (colores.length > 0 && voltajes.length > 0 && potencias.length > 0 && amperios.length > 0) {
        console.log('   Colores (' + colores.length + ') + Voltajes (' + voltajes.length + ') + Potencias (' + potencias.length + ') + Amperios (' + amperios.length + ')');
        colores.forEach(color => {
          voltajes.forEach(voltaje => {
            potencias.forEach(potencia => {
              amperios.forEach(amperio => {
                combinaciones.push({
                  voltajeId: voltaje.id || '',
                  potenciaId: potencia.id || '',
                  amperioId: amperio.id || '',
                  colorId: color.id || '',
                  stock: Math.min(color.stock || 0, voltaje.stock || 0, potencia.stock || 0, amperio.stock || 0)
                });
              });
            });
          });
        });
      }
      
      if (combinaciones.length > 0) {
        await doc.ref.update({
          stockCombinaciones: combinaciones
        });
        actualizados++;
        console.log('   Actualizado con ' + combinaciones.length + ' combinaciones.');
      } else {
        console.log('   No se generaron combinaciones.');
      }
    }
    
    console.log('PROCESO COMPLETADO!');
    console.log('Productos actualizados: ' + actualizados);
  } catch (error) {
    console.error('Error:', error);
  }
}

actualizarStockCombinaciones();

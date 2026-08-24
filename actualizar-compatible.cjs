// actualizar-compatible.cjs
const admin = require('firebase-admin');
const serviceAccount = require('./credentials/serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const actualizarProductos = async () => {
  try {
    const snapshot = await db.collection('productos')
      .where('categoria', 'in', ['accesorios', 'piezas'])
      .get();
    
    console.log(`📦 Productos encontrados: ${snapshot.size}`);
    
    let actualizados = 0;
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      if (!data.compatibleCon) {
        await doc.ref.update({
          compatibleCon: 'generico',
          compatibleConNombre: 'Genérico (para todos)',
        });
        actualizados++;
        console.log(`✅ Actualizado: ${data.nombre} → compatibleCon: generico`);
      }
    }
    
    console.log(`🎉 Productos actualizados: ${actualizados}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

actualizarProductos();
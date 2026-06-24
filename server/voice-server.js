import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const app = express();
const PORT = process.env.VOICE_PORT || 3002;

app.use(cors({ origin: '*' }));
app.use(express.json());

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió audio' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OPENAI_API_KEY no configurada. Obtén tu clave en https://platform.openai.com/api-keys'
      });
    }

    const audioBuffer = req.file.buffer;
    
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.webm', { type: 'audio/webm' }),
      model: 'whisper-1',
      language: req.body.language || 'es',
      response_format: 'text',
    });

    console.log('📝 Transcripción:', transcription);

    res.json({ text: transcription });
  } catch (error) {
    console.error('❌ Error en transcripción:', error);
    res.status(500).json({ 
      error: error.message,
      fallback: 'Error al transcribir el audio'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`
🎤 Servidor de Voz iniciado
📡 Puerto: ${PORT}
🌐 URL: http://localhost:${PORT}
📋 Health: http://localhost:${PORT}/api/health
  `);
});
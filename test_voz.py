from TTS.api import TTS
import os

# Inicializar TTS
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2", gpu=False)

# Texto de prueba
texto = "Hola, soy el asistente virtual de Electric Scooter House. ¿En qué puedo ayudarte?"

# Generar audio
tts.tts_to_file(
    text=texto,
    file_path="test_voz.wav",
    language="es"
)

print("✅ Audio generado en test_voz.wav")

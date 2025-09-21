from elevenlabs import ElevenLabs
import pygame
import io

# Initialize ElevenLabs client
client = ElevenLabs(api_key="sk_b166bfdc249d48c9905259fdf1d5062aa1c572c334207e91") #The Api key is confidential, please dont share it with anyone.
# Generate speech (MP3 stream)
audio = client.text_to_speech.convert(
    voice_id="tnSpp4vdxKPjI9w0GnoV",  #girl voice
    model_id="eleven_multilingual_v2",
    text="Hello, I’m Synchora — your personal AI armband assistant. How may I help you today?"
)

# Collect MP3 bytes
mp3_bytes = b"".join([chunk for chunk in audio if chunk])

# Initialize pygame mixer
pygame.mixer.init()

# Load audio from memory
pygame.mixer.music.load(io.BytesIO(mp3_bytes))

# Play the audio
pygame.mixer.music.play()


# --- Uncomment below lines if you want to save the voice ---
with open("Introduction.mp3", "wb") as f:
    f.write(mp3_bytes)


# Keep program running until audio finishes
while pygame.mixer.music.get_busy():
    pygame.time.Clock().tick(10)

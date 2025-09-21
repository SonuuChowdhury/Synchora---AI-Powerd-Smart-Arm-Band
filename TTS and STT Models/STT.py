import speech_recognition as sr

# Initialize recognizer
r = sr.Recognizer()

# Use microphone as input
with sr.Microphone() as source:
    print("🎤 Say something...")
    r.adjust_for_ambient_noise(source)   # reduces background noise
    audio = r.listen(source)

try:
    # Google Web Speech API (default, needs internet)
    text = r.recognize_google(audio)
    print("📝 You said: " + text)

except sr.UnknownValueError:
    print("❌ Sorry, I could not understand the audio")
except sr.RequestError as e:
    print("⚠️ Could not request results; {0}".format(e))

# 🎙️ VocalizeIt

**Create. Manage. Conquer Your Stories.**  

VocalizeIt is a powerful, elegant, and feature-rich audio web application designed to help you transform, transcribe, and manage your audio content with ease. Built on top of the **ElevenLabs API**, VocalizeIt provides a suite of professional-grade tools in one centralized, beautifully designed dashboard. 

Whether you're writing a story, scripting a video, needing a quick transcription, or looking to isolate vocals from a noisy background, VocalizeIt brings your audio needs to life.

---

## 🚀 Live Site  
🔗 https://vocalize-it-blush.vercel.app/

---

## 🌟 Key Features

VocalizeIt is divided into four main tools, all accessible from an intuitive tabbed interface:

- 🎤 **Text to Speech (TTS)**: Convert text or entire PDF documents into lifelike, expressive audio using top-tier ElevenLabs voices. Adjust stability and similarity boost to get the perfect performance.
- 📝 **Speech to Text (STT)**: Upload audio files and quickly receive highly accurate transcriptions using the ElevenLabs Scribe model.
- 🎧 **Voice Isolation**: Upload noisy audio and let our AI isolate the vocals, returning a clean, professional-sounding vocal track.
- 🌍 **Video & Audio Dubbing**: Upload a video or audio file and instantly dub it into multiple target languages (Spanish, French, German, Hindi, Japanese) while preserving the original voice and emotion.

## 🎨 UI & Design

- 💡 **Intuitive Layout** built with modern design principles and glassmorphism styling.
- 🎧 **Integrated Audio Player** to preview and playback your generated or processed speech.
- 🌈 **Beautiful Gradient Aesthetics** for an immersive, premium user experience.

---

## 🛠️ Tech Stack

### Frontend:
- **React.js**
- **Vite**
- **Vanilla CSS** (Custom Design System with CSS variables and glassmorphism)
- **HTML5 + Modern JavaScript**

### Backend:
- **Node.js**
- **Express.js**
- **Multer** (for secure file upload handling)
- **ElevenLabs API** (Powers TTS, STT, Isolation, and Dubbing)

---

## 📦 Installation & Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Shourya523/VocalizeIt.git
cd VocalizeIt
```

### 2. Setup the Frontend

```bash
npm install
npm run dev
```

### 3. Setup the Backend

Open a new terminal window:
```bash
cd vocalizeit-backend
npm install
```

Create a `.env` file inside the `vocalizeit-backend` directory and add your ElevenLabs API Key:
```env
ELEVENLABS_API_KEY=your_api_key_here
PORT=3000
```

Start the backend server:
```bash
npm run start
```

---

📝 Built with love by **Shourya & Ansh**

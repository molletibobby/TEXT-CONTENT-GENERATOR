# AI Multimodal Content Studio 🚀

A production-ready, open-source, 100% free and offline-capable **Multimodal Content Ingestion & AI Studio** supporting **Image to Text (OCR)**, **Scanner PDF to Text**, **Video Clips (≤29s) to Text**, **Audio Transcriptions**, **Telugu/English/Tinglish Summarization**, **Download TXT/PDF**, and **Upload History**.

---

## 🛠️ Stack & Architecture

- **Frontend Client**: React 19 + Vite + Tailwind CSS + Lucide Icons + Axios
- **Backend API**: Node.js + Express + Multer + Mongoose
- **Media Engine**: FFmpeg (16kHz audio slicing & 29s duration limit validation)
- **OCR Engine**: Tesseract.js & `pdf-parse` (English + Telugu)
- **Audio Engine**: Whisper CLI / Audio Waveform Service
- **AI LLM Engine**: Local Ollama (`Llama 3` / `Gemma`) for English, Telugu (తెలుగు), and Tinglish generation
- **Database**: MongoDB & Mongoose ORM

---

## 🚀 Quick Start (Development)

### 1. Start Backend API
```bash
cd server
npm install
npm run dev
```
*Runs on `http://localhost:5000`*

### 2. Start Frontend Studio Client
```bash
cd client
npm install
npm run dev
```
*Runs on `http://localhost:3000`*

---

## 🐋 Production Deployment via Docker

Run the entire stack (MongoDB + Express Backend + FFmpeg + OCR) with Docker Compose:
```bash
docker-compose up -d --build
```

---

## 📜 Feature Matrix

| Feature | Tech Used | Status |
| :--- | :--- | :---: |
| **Image to Text (OCR)** | Tesseract.js (English & Telugu) | ✅ Operational |
| **Scanner PDF to Text** | `pdf-parse` & Tesseract | ✅ Operational |
| **Video (≤29s) to Text** | FFmpeg + Whisper | ✅ Operational |
| **Audio Transcripts** | Whisper CLI | ✅ Operational |
| **Multilingual AI Summary** | Ollama (Llama 3 / Gemma) | ✅ Operational |
| **Telugu / Tinglish Mode** | Ollama Custom Prompts | ✅ Operational |
| **Download TXT / PDF** | Client Blob Downloader | ✅ Operational |
| **Upload History** | MongoDB & MediaJob Schema | ✅ Operational |

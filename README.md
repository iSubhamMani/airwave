# Airwave: 1:1 Podcast Streaming

Airwave is a real-time, peer-to-peer podcast streaming application designed for one-on-one sessions. It leverages **WebRTC** for low-latency, direct audio streaming and uses **FFmpeg** to handle the audio/video encoding and streaming. The application is built with a clear, scalable architecture, separating the client from the server-side components.

## Features

- **Real-time 1:1 Streaming**: Utilizes WebRTC for direct, low-latency audio transmission between two users.
- **Efficient Audio/Video Handling**: Integrates FFmpeg for robust and efficient audio/video encoding, ensuring high-quality streams.
- **Scalable Architecture**: The project is split into a **Next.js client**, a **signalling server**, and a dedicated **stream server**, all designed to be deployed independently.
- **User-Friendly Interface**: The client-side application, built with Next.js, provides a simple and intuitive interface for hosts and guests to connect and start streaming.

## Project Structure

The project is organized into the following key directories:

- `/client`: A Next.js application that serves as the user interface. It handles WebRTC connections and user interactions.
- `/signalling-server`: A server that facilitates the initial connection and exchange of information (SDP and ICE candidates) between two peers.
- `/stream-server`: A server that uses FFmpeg to process and manage the audio stream. This part handles the streaming protocol and is dockerized for easy deployment.

## Getting Started

Follow these steps to get a local copy of Airwave up and running on your machine.

### Prerequisites

You will need the following software installed:

- Node.js (v18 or higher)
- Docker
- A modern web browser (e.g., Chrome, Firefox)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/iSubhamMani/airwave.git
   cd airwave
   ```
2. **Set up the Signalling Server:**
   ```bash
   cd signalling-server
   npm install
   npm run build
   npm run dev
   ```
3. **Set up the Stream Server:**
   ```bash
   cd stream-server
   docker build -t airwave-stream-server .
   docker run -p 8000:8000 airwave-stream-server
   ```
4. **Set up the Client:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

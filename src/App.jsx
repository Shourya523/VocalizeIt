// App.jsx - Simplified version without voice settings

import { useState, useEffect } from 'react';
import './index.css';
import Waveform from './components/Waveform';
import AddText from './components/Addtext';

function App() {
  const [text, setText] = useState('');
  const [audioSrc, setAudioSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use default voice settings (no UI controls)
  const selectedVoice = 'en-US-AriaNeural';
  const speechRate = '0%';
  const speechPitch = '0%';

  const handleGenerateAudio = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setAudioSrc(null);

    try {
      const response = await fetch('https://vocalizeit-lc7l.onrender.com/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text,
          voice: selectedVoice,
          rate: speechRate,
          pitch: speechPitch
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Backend server error');
      }

      const data = await response.json();

      // Convert base64 to blob URL
      const byteCharacters = atob(data.audioContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      setAudioSrc(url);

    } catch (error) {
      console.error('Error generating audio:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="VocalizeIt-mainbody">
        <div className="VocalizeIt-title">VocalizeIt</div>
        <div className="slogan">Create. Manage and Conquer Your Stories</div>

        {/* Removed Voice Settings Section */}

        {isLoading ? <p>Generating Audio...</p> : <Waveform audioUrl={audioSrc} />}
        <AddText onGenerateClick={handleGenerateAudio} />

        <div className="texdisplay-wrap">
          <textarea
            className="text-display-box"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start your story here..."
          />
        </div>
        
        <div className="made-with-love">
          Made with Big <span className="red-heart">🍆</span> Energy by <b>Shourya</b> & <b>Ansh</b>
        </div>
      </div>
    </>
  );
}

export default App;
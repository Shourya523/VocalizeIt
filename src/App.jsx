// App.jsx

import { useState } from 'react';
import './index.css';
import Waveform from './components/Waveform';
import AddText from './components/Addtext';

function App() {
  const [text, setText] = useState(''); // Manages the text from the textarea
  const [audioSrc, setAudioSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // This function triggers the API call with the current text
  const handleGenerateAudio = async () => {
    if (!text.trim()) return; // Don't run if text is empty

    setIsLoading(true);
    setAudioSrc(null);

    try {
      const response = await fetch('http://localhost:3001/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) throw new Error('Backend server error');

      const data = await response.json();

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
      console.error('Error fetching audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="VocalizeIt-mainbody">
        <div className="VocalizeIt-title">VocalizeIt</div>
        <div className="slogan">Create. Manage and Conquer Your Stories</div>

        {isLoading ? <p>Generating Audio...</p> : <Waveform audioUrl={audioSrc} />}
        <AddText onGenerateClick={handleGenerateAudio} />

        {/* Wrap the textarea in a div with your container class */}
        <div className="texdisplay-wrap">
          <textarea
            // Apply your text box class here
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
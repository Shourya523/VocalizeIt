import { useState } from 'react';
import Waveform from './Waveform'; // Import your Waveform component

function StoryCreator() {
  const [text, setText] = useState(""); //
  const [audioUrl, setAudioUrl] = useState(null); //
  const [isLoading, setIsLoading] = useState(false); //

  const handleSynthesize = async () => {
    setIsLoading(true); //
    setAudioUrl(null); //

    try {
      const response = await fetch('https://vocalizeit-lc7l.onrender.com/api/synthesize', { //
        method: 'POST', //
        headers: { //
          'Content-Type': 'application/json', //
        },
        body: JSON.stringify({ text: text }), //
      });

      if (!response.ok) { //
        throw new Error('Failed to generate audio'); //
      }

      const data = await response.json(); //

      const byteCharacters = atob(data.audioContent); //
      const byteNumbers = new Array(byteCharacters.length); //
      for (let i = 0; i < byteCharacters.length; i++) { //
        byteNumbers[i] = byteCharacters.charCodeAt(i); //
      }
      const byteArray = new Uint8Array(byteNumbers); //
      const blob = new Blob([byteArray], { type: 'audio/mpeg' }); //
      const url = URL.createObjectURL(blob); //

      setAudioUrl(url); //

    } catch (error) {
      console.error("Error synthesizing speech:", error); //
    } finally {
      setIsLoading(false); //
    }
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your text here..."
      />
      <button onClick={handleSynthesize} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Create Audio'}
      </button>

      {audioUrl && <Waveform audioUrl={audioUrl} />}
    </div>
  );
}

export default StoryCreator;
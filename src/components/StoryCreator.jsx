import { useState } from 'react';
import Waveform from './Waveform'; // Import your Waveform component

function StoryCreator() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState(null); // This will hold the playable URL
  const [isLoading, setIsLoading] = useState(false);

  const handleSynthesize = async () => {
    setIsLoading(true);
    setAudioUrl(null); // Reset previous audio

    try {
      const response = await fetch('/api/synthesize', { // Your backend route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }), // Send the text from the input
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const data = await response.json(); // Gets { audioContent: '...' }

      // **This is the key part: Convert base64 to a playable URL**
      const byteCharacters = atob(data.audioContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url); // Set the new URL in state

    } catch (error) {
      console.error("Error synthesizing speech:", error);
    } finally {
      setIsLoading(false);
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

      {/* Conditionally render the Waveform component only when we have a URL */}
      {audioUrl && <Waveform audioUrl={audioUrl} />}
    </div>
  );
}

export default StoryCreator;
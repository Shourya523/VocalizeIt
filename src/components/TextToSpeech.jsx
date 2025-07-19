import React, { useState, useRef } from 'react';

function TextToSpeech() {
  // State to hold the user's input text
  const [text, setText] = useState('');
  // State to hold the audio source URL (as a base64 data URL)
  const [audioSrc, setAudioSrc] = useState(null);
  // State to manage loading status
  const [isLoading, setIsLoading] = useState(false);
  // Ref to access the audio element directly
  const audioRef = useRef(null);

  // This function is called when the form is submitted
  const handleSynthesize = async (event) => {
    event.preventDefault(); // Prevent the default form submission
    if (!text.trim()) {
      alert('Please enter some text.');
      return;
    }

    setIsLoading(true);
    setAudioSrc(null); // Clear previous audio

    try {
      // This is where your fetch logic goes
      const response = await fetch('http://localhost:3001/api/tts/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Use the 'text' from our state
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to synthesize speech.');
      }

      const data = await response.json();

      // Create a data URL for the audio and set it in state
      const audioDataUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      setAudioSrc(audioDataUrl);

    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // When audioSrc is updated, this effect will play the audio automatically
  React.useEffect(() => {
    if (audioSrc && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioSrc]);


  return (
    <div>
      {/* This is the pop-up form */}
      <form onSubmit={handleSynthesize}>
        <h2>Enter Text to Vocalize</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here..."
          rows="5"
          style={{ width: '100%', padding: '10px' }}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Vocalize'}
        </button>
      </form>

      {/* The bottom box where the text appears */}
      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h3>Your Text:</h3>
        <p>{text}</p>
      </div>


      {/* The audio element is created here but hidden. We control it with the ref. */}
      {audioSrc && (
        <div>
           {/* The 'controls' attribute provides default play/pause/volume UI */}
           <audio ref={audioRef} src={audioSrc} controls style={{ marginTop: '20px', width: '100%' }} />
        </div>
      )}
    </div>
  );
}

export default TextToSpeech;
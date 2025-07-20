import React, { useState, useRef } from 'react';

function TextToSpeech() {
  const [text, setText] = useState(''); //
  const [audioSrc, setAudioSrc] = useState(null); //
  const [isLoading, setIsLoading] = useState(false); //
  const audioRef = useRef(null); //

  const handleSynthesize = async (event) => {
    event.preventDefault(); //
    if (!text.trim()) { //
      alert('Please enter some text.'); //
      return; //
    }

    setIsLoading(true); //
    setAudioSrc(null); //

    try {
      const response = await fetch('https://vocalizeit-lc7l.onrender.com/api/tts/synthesize', { //
        method: 'POST', //
        headers: { //
          'Content-Type': 'application/json', //
        },
        body: JSON.stringify({ text: text }), //
      });

      if (!response.ok) { //
        throw new Error('Failed to synthesize speech.'); //
      }

      const data = await response.json(); //

      const audioDataUrl = `data:audio/mpeg;base64,${data.audioContent}`; //
      setAudioSrc(audioDataUrl); //

    } catch (error) {
      console.error('Error:', error); //
      alert('An error occurred. Please try again.'); //
    } finally {
      setIsLoading(false); //
    }
  };

  React.useEffect(() => {
    if (audioSrc && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioSrc]); //

  return (
    <div>
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

      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h3>Your Text:</h3>
        <p>{text}</p>
      </div>

      {audioSrc && (
        <div>
           <audio ref={audioRef} src={audioSrc} controls style={{ marginTop: '20px', width: '100%' }} />
        </div>
      )}
    </div>
  );
}

export default TextToSpeech;
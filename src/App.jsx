import { useState, useRef, useEffect } from 'react'; // Make sure to import useRef and useEffect
import './index.css';
import Waveform from './components/Waveform';
import AddText from './components/Addtext';
import TextDisplay from './components/TextDisplay';
import TextAreaPopUp from './components/TextAreaPopUp';

function App() {
  const [textareapopup, setTextAreaPopUp] = useState(false);
  const [text, setText] = useState('');

  // --- NEW STATE & REFS ---
  const [audioSrc, setAudioSrc] = useState(null); // To store the audio data
  const [isLoading, setIsLoading] = useState(false); // To handle loading state for the button
  const audioRef = useRef(null); // To control the audio element

  const togglePopup = () => {
    setTextAreaPopUp(!textareapopup);
  };

  // --- MODIFIED FUNCTION ---
  // This function will now also handle fetching the audio
  const handleTextSubmit = async (inputText) => {
    setText(inputText); // Update the text to display it
    setTextAreaPopUp(false); // Close the popup
    
    if (!inputText.trim()) return; // Don't do anything if text is empty

    setIsLoading(true);
    setAudioSrc(null); // Clear previous audio

    try {
      // --- THIS IS THE FETCH LOGIC ---
      const response = await fetch('http://localhost:3001/api/tts/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error('Backend server error');
      }

      const data = await response.json();
      const audioDataUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      setAudioSrc(audioDataUrl); // Set the audio source

    } catch (error) {
      console.error('Error fetching audio:', error);
      alert('Failed to generate audio. Please check the server and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- NEW HOOK ---
  // This automatically plays the audio when the source changes
  useEffect(() => {
    if (audioSrc && audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, [audioSrc]);


  return (
    <>
      {textareapopup && (
        <TextAreaPopUp 
          popup={handleTextSubmit} 
        />
      )}
      <div className="VocalizeIt-mainbody">
        <div className="VocalizeIt-title">VocalizeIt</div>
        <div className="slogan">Create. Manage and Conquer Your Stories </div>

        {/* --- You can show the waveform or a loading indicator --- */}
        {isLoading ? <p>Generating Audio...</p> : <Waveform />}

        <AddText popup={togglePopup} />
        <TextDisplay text={text} />

        {/* --- NEW AUDIO ELEMENT --- */}
        {/* This element plays the audio. The 'controls' attribute gives it a default UI. */}
        {audioSrc && <audio ref={audioRef} src={audioSrc} controls style={{ width: '100%', marginTop: '20px' }} />}
        
        <div className="made-with-love">
          Made with Big <span className="red-heart">🍆</span> Energy by <b>Shourya</b> & <b>Ansh</b>
        </div>
      </div>
    </>
  );
}

export default App;

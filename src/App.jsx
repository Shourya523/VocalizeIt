import { useState, useEffect } from 'react';
import './index.css';
import Waveform from './components/Waveform';

function App() {
  const [text, setText] = useState('');
  const [audioSrc, setAudioSrc] = useState(null);
  
  // ElevenLabs Parameters
  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('pNInz6obpgDQGcFmaJgB'); // Default ElevenLabs voice
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.5);

  // UI States
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ message: '', type: '' });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await fetch('https://vocalizeit-0w59.onrender.com/api/tts/voices');
      if (!response.ok) throw new Error('Failed to fetch voices');
      const data = await response.json();
      if (data.voices && data.voices.length > 0) {
        setVoices(data.voices);
        // If default isn't in list, set to first available
        if (!data.voices.find(v => v.id === selectedVoiceId)) {
          setSelectedVoiceId(data.voices[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching voices:', error);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    setAudioSrc(null);

    try {
      const response = await fetch('https://vocalizeit-0w59.onrender.com/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text,
          voiceId: selectedVoiceId,
          stability: stability,
          similarity_boost: similarityBoost
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
      setIsGenerating(false);
    }
  };

  const processFileUpload = async (file) => {
    if (!file || !(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      setUploadStatus({ message: 'Please select a valid PDF file.', type: 'error' });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ message: 'Extracting text...', type: 'loading' });
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('https://vocalizeit-0w59.onrender.com/api/tts/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to extract text');
      }

      const data = await response.json();
      setText(data.text);
      setUploadStatus({ message: `Success! Extracted ${data.text.split(' ').length} words.`, type: 'success' });

    } catch (error) {
      console.error('Error uploading PDF:', error);
      setUploadStatus({ message: 'Upload failed. ' + error.message, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) processFileUpload(file);
    // Reset input so the same file can be uploaded again if needed
    event.target.value = null; 
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFileUpload(file);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">VocalizeIt</h1>
        <p className="app-slogan">Transform Text & Documents into Lifelike Speech</p>
      </header>

      <main className="main-content">
        {/* Left Column: Input */}
        <div className="glass-panel">
          <h2 className="section-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Content Input
          </h2>

          <div 
            className={`pdf-upload-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label className="pdf-upload-label" htmlFor="pdf-upload-input">
              <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <span className="pdf-upload-text">Upload PDF Document</span>
              <span className="pdf-upload-subtext">Drag & drop or click to browse</span>
            </label>
            <input
              id="pdf-upload-input"
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            {uploadStatus.message && (
              <div className={`upload-status ${uploadStatus.type}`}>
                {uploadStatus.message}
              </div>
            )}
          </div>

          <div className="text-input-container">
            <textarea
              className="main-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Or start typing your script here..."
            />
            <div className="text-meta">
              {text.trim().split(/\s+/).filter(w => w.length > 0).length} words
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Generation */}
        <div className="glass-panel">
          <h2 className="section-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            Voice Settings
          </h2>

          <div className="settings-group">
            <label className="settings-label">
              Selected Voice
              {isLoadingVoices && <div className="spinner"></div>}
            </label>
            <select 
              className="custom-select" 
              value={selectedVoiceId} 
              onChange={(e) => setSelectedVoiceId(e.target.value)}
              disabled={isLoadingVoices || voices.length === 0}
            >
              {voices.length > 0 ? (
                voices.map(voice => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} {voice.category ? `(${voice.category})` : ''}
                  </option>
                ))
              ) : (
                <option value="pNInz6obpgDQGcFmaJgB">Default Voice</option>
              )}
            </select>
          </div>

          <div className="settings-group">
            <label className="settings-label">
              <span>Stability</span>
              <span className="settings-value">{Math.round(stability * 100)}%</span>
            </label>
            <input
              type="range"
              className="custom-range"
              min="0"
              max="1"
              step="0.01"
              value={stability}
              onChange={(e) => setStability(parseFloat(e.target.value))}
            />
          </div>

          <div className="settings-group">
            <label className="settings-label">
              <span>Similarity Boost</span>
              <span className="settings-value">{Math.round(similarityBoost * 100)}%</span>
            </label>
            <input
              type="range"
              className="custom-range"
              min="0"
              max="1"
              step="0.01"
              value={similarityBoost}
              onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))}
            />
          </div>

          <div className="generate-btn-container">
            <button 
              className="generate-btn" 
              onClick={handleGenerateAudio}
              disabled={isGenerating || !text.trim()}
            >
              {isGenerating ? (
                <>
                  <div className="spinner"></div>
                  Generating Magic...
                </>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  Generate Voiceover
                </>
              )}
            </button>
          </div>

          {/* Player Section */}
          <div className="player-section">
            <Waveform audioUrl={audioSrc} />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        Made with <span className="heart">❤</span> by Shourya & Ansh
      </footer>
    </div>
  );
}

export default App;

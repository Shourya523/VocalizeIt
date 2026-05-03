import { useState, useEffect } from 'react';
import './index.css';
import Waveform from './components/Waveform';

const API_BASE_URL = 'http://localhost:3001'; // Change to https://vocalizeit-0w59.onrender.com for production

function App() {
  const [activeTab, setActiveTab] = useState('tts');

  // TTS State
  const [text, setText] = useState('');
  const [audioSrc, setAudioSrc] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('pNInz6obpgDQGcFmaJgB');
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.5);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ message: '', type: '' });
  const [isDragging, setIsDragging] = useState(false);

  // STT State
  const [sttFile, setSttFile] = useState(null);
  const [sttText, setSttText] = useState('');
  const [isSttProcessing, setIsSttProcessing] = useState(false);

  // Isolate State
  const [isolateFile, setIsolateFile] = useState(null);
  const [isolateAudioSrc, setIsolateAudioSrc] = useState(null);
  const [isIsolateProcessing, setIsIsolateProcessing] = useState(false);

  // Dubbing State
  const [dubFile, setDubFile] = useState(null);
  const [dubTargetLang, setDubTargetLang] = useState('es');
  const [dubAudioSrc, setDubAudioSrc] = useState(null);
  const [isDubProcessing, setIsDubProcessing] = useState(false);
  const [dubStatus, setDubStatus] = useState('');

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tts/voices`);
      if (!response.ok) throw new Error('Failed to fetch voices');
      const data = await response.json();
      if (data.voices && data.voices.length > 0) {
        setVoices(data.voices);
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
      const response = await fetch(`${API_BASE_URL}/api/tts/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text, voiceId: selectedVoiceId, stability, similarity_boost: similarityBoost
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Backend server error');
      }
      const data = await response.json();
      const byteCharacters = atob(data.audioContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'audio/mpeg' });
      setAudioSrc(URL.createObjectURL(blob));
    } catch (error) {
      console.error('Error generating audio:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const processPDFUpload = async (file) => {
    if (!file || !(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      setUploadStatus({ message: 'Please select a valid PDF file.', type: 'error' });
      return;
    }
    setIsUploading(true);
    setUploadStatus({ message: 'Extracting text...', type: 'loading' });
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tts/extract-text`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to extract text');
      const data = await response.json();
      setText(data.text);
      setUploadStatus({ message: `Success! Extracted ${data.text.split(' ').length} words.`, type: 'success' });
    } catch (error) {
      setUploadStatus({ message: 'Upload failed. ' + error.message, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSTTProcess = async () => {
    if (!sttFile) return;
    setIsSttProcessing(true);
    setSttText('');
    const formData = new FormData();
    formData.append('audio', sttFile);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tts/speech-to-text`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to transcribe');
      const data = await response.json();
      setSttText(data.text);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsSttProcessing(false);
    }
  };

  const handleIsolateProcess = async () => {
    if (!isolateFile) return;
    setIsIsolateProcessing(true);
    setIsolateAudioSrc(null);
    const formData = new FormData();
    formData.append('audio', isolateFile);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tts/isolate`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to isolate voice');
      const data = await response.json();
      const byteCharacters = atob(data.audioContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'audio/mpeg' });
      setIsolateAudioSrc(URL.createObjectURL(blob));
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsIsolateProcessing(false);
    }
  };

  const handleDubProcess = async () => {
    if (!dubFile) return;
    setIsDubProcessing(true);
    setDubStatus('Initiating dubbing...');
    setDubAudioSrc(null);
    const formData = new FormData();
    formData.append('file', dubFile);
    formData.append('target_lang', dubTargetLang);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tts/dub`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to initiate dubbing');
      const data = await response.json();
      const dubbingId = data.dubbing_id;

      // Poll status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${API_BASE_URL}/api/tts/dub/${dubbingId}`);
          const statusData = await statusRes.json();
          setDubStatus(`Status: ${statusData.status}...`);
          if (statusData.status === 'dubbed') {
            clearInterval(pollInterval);
            const byteCharacters = atob(statusData.audioContent);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'audio/mpeg' });
            setDubAudioSrc(URL.createObjectURL(blob));
            setDubStatus('Dubbing complete!');
            setIsDubProcessing(false);
          } else if (statusData.status === 'failed') {
            clearInterval(pollInterval);
            setDubStatus('Dubbing failed.');
            setIsDubProcessing(false);
          }
        } catch (err) {
          console.error('Polling error', err);
        }
      }, 5000); // poll every 5 seconds
    } catch (error) {
      if (error.message.includes('authorization_error') || error.message.includes('watermark')) {
        alert('Error: ElevenLabs free tier requires dubbing VIDEO files with a watermark. Audio files cannot be dubbed on the free tier. Please upload a video file or upgrade your ElevenLabs account.');
      } else {
        alert('Error: ' + error.message);
      }
      setIsDubProcessing(false);
      setDubStatus('');
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">VocalizeIt</h1>
        <p className="app-slogan">Transform Text & Documents into Lifelike Speech</p>
        <div className="tab-navigation">
          <button className={`tab-btn ${activeTab === 'tts' ? 'active' : ''}`} onClick={() => setActiveTab('tts')}>Text to Speech</button>
          <button className={`tab-btn ${activeTab === 'stt' ? 'active' : ''}`} onClick={() => setActiveTab('stt')}>Speech to Text</button>
          <button className={`tab-btn ${activeTab === 'isolate' ? 'active' : ''}`} onClick={() => setActiveTab('isolate')}>Voice Isolation</button>
          <button className={`tab-btn ${activeTab === 'dub' ? 'active' : ''}`} onClick={() => setActiveTab('dub')}>Dubbing</button>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'tts' && (
          <>
            <div className="glass-panel">
              <h2 className="section-title">Content Input</h2>
              <div
                className={`pdf-upload-area ${isDragging ? 'dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={(e) => {
                  e.preventDefault(); setIsDragging(false);
                  if (e.dataTransfer.files[0]) processPDFUpload(e.dataTransfer.files[0]);
                }}
              >
                <label className="pdf-upload-label" htmlFor="pdf-upload-input">
                  <span className="pdf-upload-text">Upload PDF Document</span>
                  <span className="pdf-upload-subtext">Drag & drop or click to browse</span>
                </label>
                <input id="pdf-upload-input" type="file" accept=".pdf" onChange={(e) => {
                  if (e.target.files[0]) processPDFUpload(e.target.files[0]);
                  e.target.value = null;
                }} disabled={isUploading} />
                {uploadStatus.message && <div className={`upload-status ${uploadStatus.type}`}>{uploadStatus.message}</div>}
              </div>

              <div className="text-input-container">
                <textarea className="main-textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Or start typing your script here..." />
                <div className="text-meta">{text.trim().split(/\s+/).filter(w => w.length > 0).length} words</div>
              </div>
            </div>

            <div className="glass-panel">
              <h2 className="section-title">Voice Settings</h2>
              <div className="settings-group">
                <label className="settings-label">Selected Voice {isLoadingVoices && <div className="spinner"></div>}</label>
                <select className="custom-select" value={selectedVoiceId} onChange={(e) => setSelectedVoiceId(e.target.value)} disabled={isLoadingVoices || voices.length === 0}>
                  {voices.length > 0 ? voices.map(voice => <option key={voice.id} value={voice.id}>{voice.name}</option>) : <option value="pNInz6obpgDQGcFmaJgB">Default Voice</option>}
                </select>
              </div>

              <div className="settings-group">
                <label className="settings-label"><span>Stability</span><span className="settings-value">{Math.round(stability * 100)}%</span></label>
                <input type="range" className="custom-range" min="0" max="1" step="0.01" value={stability} onChange={(e) => setStability(parseFloat(e.target.value))} />
              </div>

              <div className="settings-group">
                <label className="settings-label"><span>Similarity Boost</span><span className="settings-value">{Math.round(similarityBoost * 100)}%</span></label>
                <input type="range" className="custom-range" min="0" max="1" step="0.01" value={similarityBoost} onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))} />
              </div>

              <div className="generate-btn-container">
                <button className="generate-btn" onClick={handleGenerateAudio} disabled={isGenerating || !text.trim()}>
                  {isGenerating ? 'Generating Magic...' : 'Generate Voiceover'}
                </button>
              </div>

              <div className="player-section"><Waveform audioUrl={audioSrc} /></div>
            </div>
          </>
        )}

        {activeTab === 'stt' && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
            <h2 className="section-title">Speech to Text</h2>
            <div className="file-upload-container">
              <input type="file" accept="audio/*" onChange={(e) => setSttFile(e.target.files[0])} />
            </div>
            <button className="generate-btn" onClick={handleSTTProcess} disabled={!sttFile || isSttProcessing} style={{ marginTop: '20px' }}>
              {isSttProcessing ? 'Transcribing...' : 'Transcribe Audio'}
            </button>
            {sttText && (
              <div className="text-input-container" style={{ marginTop: '20px' }}>
                <textarea className="main-textarea" value={sttText} readOnly />
              </div>
            )}
          </div>
        )}

        {activeTab === 'isolate' && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
            <h2 className="section-title">Voice Isolation</h2>
            <div className="file-upload-container">
              <input type="file" accept="audio/*" onChange={(e) => setIsolateFile(e.target.files[0])} />
            </div>
            <button className="generate-btn" onClick={handleIsolateProcess} disabled={!isolateFile || isIsolateProcessing} style={{ marginTop: '20px' }}>
              {isIsolateProcessing ? 'Isolating...' : 'Isolate Voice'}
            </button>
            {isolateAudioSrc && (
              <div className="player-section" style={{ marginTop: '20px' }}>
                <Waveform audioUrl={isolateAudioSrc} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'dub' && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
            <h2 className="section-title">Dubbing</h2>
            <div className="file-upload-container">
              <input type="file" accept="audio/*,video/*" onChange={(e) => setDubFile(e.target.files[0])} />
            </div>
            <div className="settings-group" style={{ marginTop: '20px' }}>
              <label className="settings-label">Target Language</label>
              <select className="custom-select" value={dubTargetLang} onChange={(e) => setDubTargetLang(e.target.value)}>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
            <button className="generate-btn" onClick={handleDubProcess} disabled={!dubFile || isDubProcessing} style={{ marginTop: '20px' }}>
              {isDubProcessing ? 'Processing Dubbing...' : 'Dub Audio'}
            </button>
            {dubStatus && <div style={{ marginTop: '20px', color: 'var(--text)' }}>{dubStatus}</div>}
            {dubAudioSrc && (
              <div className="player-section" style={{ marginTop: '20px' }}>
                <Waveform audioUrl={dubAudioSrc} />
              </div>
            )}
          </div>
        )}
      </main>
      <footer className="app-footer">Made with <span className="heart">❤</span> by Shourya & Ansh</footer>
    </div>
  );
}

export default App;

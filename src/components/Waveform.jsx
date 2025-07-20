// components/Waveform.jsx
 

 import './waveform.css';
 import { useState, useRef, useEffect } from 'react';
 

 function Waveform({ audioUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
 

  useEffect(() => {
  if (audioUrl && audioRef.current) {
  audioRef.current.load(); // Ensure the audio is loaded when the source changes
  audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
  audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
  audioRef.current.addEventListener('ended', handleEnded);
  
  // Clean up event listeners
  return () => {
  if (audioRef.current) {
  audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
  audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
  audioRef.current.removeEventListener('ended', handleEnded);
  }
  };
  }
  }, [audioUrl]);
 

  const handleLoadedMetadata = () => {
  setDuration(audioRef.current.duration);
  };
 

  const handleTimeUpdate = () => {
  setCurrentTime(audioRef.current.currentTime);
  };
 

  const handleEnded = () => {
  setIsPlaying(false);
  setCurrentTime(0);
  };
 

  useEffect(() => {
  if (isPlaying) {
  audioRef.current?.play().catch(e => console.error("Play failed", e));
  } else {
  audioRef.current?.pause();
  }
  }, [isPlaying]);
 

  const togglePlayPause = () => {
  if (!audioUrl) return;
  setIsPlaying(!isPlaying);
  };
 

  const formatTime = (time) => {
  if (isNaN(time)) {
  return '0:00';
  }
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
  };
 

  const handleSeek = (event) => {
  if (!audioRef.current || isNaN(duration)) return;
  const newTime = (event.target.value / 100) * duration;
  audioRef.current.currentTime = newTime;
  setCurrentTime(newTime);
  };
 

  const progress = duration ? (currentTime / duration) * 100 : 0;
 

  return (
  <div className="waveform-coverdiv">
  <audio ref={audioRef} src={audioUrl} style={{ display: 'none' }} />
  
  <div className="controls">
  <button
  className={isPlaying ? 'pause-button' : 'play-button'}
  onClick={togglePlayPause}
  disabled={!audioUrl}
  ></button>
 

  <div className="duration-bar-container">
  <input
  type="range"
  className="duration-bar"
  min="0"
  max="100"
  value={progress}
  onChange={handleSeek}
  disabled={isNaN(duration)}
  />
  <div className="time-indicator">
  {formatTime(currentTime)} / {formatTime(duration)}
  </div>
  </div>
 

  {audioUrl && (
  <a href={audioUrl} download="vocalizeit-story.mp3" className="download-icon">
  {/* Add a download icon here */}
  </a>
  )}
  </div>
  </div>
  );
 }
 

 export default Waveform;
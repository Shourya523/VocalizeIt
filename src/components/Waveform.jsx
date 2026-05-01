import './waveform.css';
import { useState, useRef, useEffect } from 'react';

function Waveform({ audioUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load();
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', handleEnded);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [audioUrl]);

  // Auto-play when audioUrl changes to a new one
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
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
          className="play-pause-btn"
          onClick={togglePlayPause}
          disabled={!audioUrl}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="duration-bar-container">
          <input
            type="range"
            className="duration-bar"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            disabled={!audioUrl || isNaN(duration)}
          />
          <div className="time-indicator">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        {audioUrl && (
          <a href={audioUrl} download="vocalizeit-voiceover.mp3" className="download-btn" title="Download Audio">
            <svg viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

export default Waveform;
import './waveform.css';
import { useState } from 'react';

function Waveform() {
  const [playpause, setPlayPause] = useState(false);

  const playPause = () => {
    setPlayPause(!playpause);
  };

  return (
    <div className="waveform-coverdiv">
      <button
        className={playpause ? 'pause-button' : 'play-button'}
        onClick={playPause}
      ></button>
    </div>
  );
}

export default Waveform;

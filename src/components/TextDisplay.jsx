import { useState, useEffect } from 'react';
import './textdisplay.css';

function TextDisplay({ text }) {
  const [editableText, setEditableText] = useState(text);

  useEffect(() => {
    setEditableText(text);
  }, [text]);

  const handleChange = (e) => {
    setEditableText(e.target.value);
  };

  return (
    <div className="texdisplay-wrap">
      {editableText.trim() !== '' ? (
        <textarea
          className="text-display-box"
          value={editableText}
          onChange={handleChange}
        />
      ) : (
        <div className="text-placeholder">All quiet for now</div>
      )}
    </div>
  );
}

export default TextDisplay;

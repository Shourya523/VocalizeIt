import { useState } from 'react';
import './textareapopup.css';

function TextAreaPopUp({ popup }) {
  const [inputText, setInputText] = useState('');

  const handleChange = (e) => setInputText(e.target.value);

  const handleSubmit = () => {
    popup(inputText);
    setInputText('');
  };

  return (
    <div className="textarea-popup-window">
      <textarea
        placeholder="Your Text Here"
        value={inputText}
        onChange={handleChange}
      />
      <button className="submit-text" onClick={handleSubmit}></button>
    </div>
  );
}

export default TextAreaPopUp;

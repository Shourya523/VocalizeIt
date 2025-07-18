import React, { useState } from 'react';
import TextDisplay from './TextDisplay';
import TextAreaPopUp from './TextAreaPopUp';

function TextManager() {
  const [text, setText] = useState(''); // to store entered text

  // This function will be called when submit button is clicked
  const handlePopupSubmit = (enteredText) => {
    setText(enteredText);
  };

  return (
    <>
      <TextAreaPopUp popup={handlePopupSubmit} />
      <TextDisplay text={text} />
    </>
  );
}

export default TextManager;

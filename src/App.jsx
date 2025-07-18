import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'
import Waveform from './components/Waveform'
import AddText from './components/Addtext'
import TextDisplay from './components/TextDisplay'
import TextAreaPopUp from './components/TextAreaPopUp'

function App() {
  const [textareapopup, setTextAreaPopUp] = useState(false);
  const [text, setText] = useState('');

  const togglePopup = () => {
    setTextAreaPopUp(!textareapopup);
  }

  const handleTextSubmit = (inputText) => {
    setText(inputText);
    setTextAreaPopUp(false);
  }

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
        <Waveform />
        <AddText popup={togglePopup} />
        <TextDisplay text={text} />
        <div className="made-with-love">
          Made with <span className="red-heart">♥</span> by <b>Shourya</b> & <b>Ansh</b>
        </div>
      </div>
    </>
  )
}

export default App

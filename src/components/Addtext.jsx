// components/Addtext.jsx

import './addtext.css';

function AddText({ onGenerateClick }) {
    return (
        <>
            <button className='Enter-Text-button' onClick={onGenerateClick}>
                Generate Your Audio
            </button>
        </>
    );
}

export default AddText;
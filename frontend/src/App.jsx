import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import './styles/App.css';

const App = () => {
  const [subtitles, setSubtitles] = useState(null);

  const handleSubtitlesUpdate = (newSubtitles) => {
    setSubtitles(newSubtitles);
  };

  return (
    <div className="App">
      <h1>MP3 to SRT Converter</h1>
      <FileUpload onSubtitlesUpdate={handleSubtitlesUpdate} />
      {subtitles && (
        <div className="subtitles">
          <h2>Generated Subtitles:</h2>
          <pre>{subtitles}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
# MP3 to SRT Converter

This project is a web application that converts MP3 audio files into SRT subtitle files. It utilizes a combination of React for the frontend and Node.js with Python for the backend to handle audio processing without relying on external APIs.

## Project Structure

```
mp3-to-srt-app
├── backend
│   ├── app.py               # Python script for audio processing
│   ├── server.js            # Node.js server setup
│   ├── requirements.txt      # Python dependencies
│   └── package.json          # Node.js dependencies
├── frontend
│   ├── src
│   │   ├── App.jsx          # Main React component
│   │   ├── components
│   │   │   └── FileUpload.jsx # Component for file upload
│   │   ├── styles
│   │   │   └── App.css      # CSS styles
│   │   └── main.jsx         # Entry point for React application
│   ├── index.html           # Main HTML file
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── README.md                # Project documentation
└── .gitignore               # Git ignore file
```

## Setup Instructions

### Backend Setup

1. Navigate to the `backend` directory:
   ```
   cd backend
   ```

2. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

3. Start the Node.js server:
   ```
   npm install
   npm start
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```
   cd frontend
   ```

2. Install the required Node.js packages:
   ```
   npm install
   ```

3. Start the Vite development server:
   ```
   npm run dev
   ```

## Usage

1. Open your web browser and go to `http://localhost:3000` (or the port specified by Vite).
2. Use the file upload component to select an MP3 file.
3. The application will process the audio and generate an SRT file.
4. Download the generated SRT file.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project.

## License

This project is licensed under the MIT License.
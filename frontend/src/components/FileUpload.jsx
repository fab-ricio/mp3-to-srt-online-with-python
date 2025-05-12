import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ onSubtitlesUpdate }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [srtContent, setSrtContent] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type === 'audio/mpeg') {
            setFile(selectedFile);
            setError(null);
        } else {
            setError('Veuillez sélectionner un fichier MP3 valide');
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Veuillez sélectionner un fichier');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setSrtContent(response.data.srt_content);
                onSubtitlesUpdate(response.data.srt_content);
            } else {
                setError(response.data.error || 'Une erreur est survenue');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors du téléchargement du fichier');
        } finally {
            setLoading(false);
        }
    };

    const downloadSrt = () => {
        if (!srtContent) return;

        const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace('.mp3', '.srt');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="file-upload">
            <input
                type="file"
                accept=".mp3"
                onChange={handleFileChange}
                disabled={loading}
            />
            <button 
                onClick={handleUpload}
                disabled={!file || loading}
            >
                {loading ? 'Traitement en cours...' : 'Convertir en SRT'}
            </button>
            {error && <p className="error">{error}</p>}
            {srtContent && (
                <button 
                    onClick={downloadSrt}
                    className="download-button"
                >
                    Télécharger le fichier SRT
                </button>
            )}
        </div>
    );
};

export default FileUpload;
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
import whisper
import json

app = Flask(__name__)
CORS(app)  # Activer CORS pour permettre les requêtes du frontend

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def convert_mp3_to_text_with_timestamps(mp3_file_path):
    """
    Utilise Whisper pour transcrire un fichier MP3 et obtenir des horodatages précis.
    """
    try:
        model = whisper.load_model("base")
        result = model.transcribe(mp3_file_path, word_timestamps=True)
        return result['segments']
    except Exception as e:
        print(f"Erreur lors de la transcription: {str(e)}")
        return None

def generate_srt_from_segments(segments):
    """
    Génère un fichier SRT à partir des segments transcrits avec horodatages.
    """
    if not segments:
        return ""
        
    srt_content = ""
    index = 1

    for segment in segments:
        start_time = segment['start']
        end_time = segment['end']
        text = segment['text'].strip()

        # Formatage des horodatages en SRT (hh:mm:ss,ms)
        start_time_srt = format_time_srt(start_time)
        end_time_srt = format_time_srt(end_time)

        # Ajouter une entrée SRT
        srt_content += f"{index}\n{start_time_srt} --> {end_time_srt}\n{text}\n\n"
        index += 1

    return srt_content

def format_time_srt(seconds):
    """
    Convertit un temps en secondes en format SRT (hh:mm:ss,ms).
    """
    milliseconds = int((seconds % 1) * 1000)
    seconds = int(seconds)
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    return f"{hours:02}:{minutes:02}:{seconds:02},{milliseconds:03}"

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier envoyé'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'Aucun fichier sélectionné'}), 400
    
    if file and file.filename.endswith('.mp3'):
        try:
            # Sauvegarder le fichier temporairement
            temp_mp3 = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
            file.save(temp_mp3.name)
            
            # Transcrire l'audio
            segments = convert_mp3_to_text_with_timestamps(temp_mp3.name)
            if not segments:
                return jsonify({'error': 'Erreur lors de la transcription'}), 500
                
            # Générer le fichier SRT
            srt_content = generate_srt_from_segments(segments)
            
            # Sauvegarder le fichier SRT
            srt_file_path = temp_mp3.name.replace('.mp3', '.srt')
            with open(srt_file_path, 'w', encoding='utf-8') as srt_file:
                srt_file.write(srt_content)
            
            # Nettoyer le fichier MP3 temporaire
            os.unlink(temp_mp3.name)
            
            return jsonify({
                'success': True,
                'srt_content': srt_content,
                'message': 'Fichier SRT généré avec succès'
            }), 200
            
        except Exception as e:
            return jsonify({'error': f'Erreur lors du traitement: {str(e)}'}), 500
    
    return jsonify({'error': 'Type de fichier invalide'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
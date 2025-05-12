from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
import whisper
import json
import sys

app = Flask(__name__)
CORS(app)

def convert_mp3_to_text_with_timestamps(mp3_file_path):
    """
    Utilise Whisper pour transcrire un fichier MP3 et obtenir des horodatages précis.
    """
    try:
        model = whisper.load_model("base")
        result = model.transcribe(mp3_file_path, word_timestamps=True)
        return result['segments']
    except Exception as e:
        print(f"Erreur lors de la transcription: {str(e)}", file=sys.stderr)
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

def process_mp3_file(mp3_file_path):
    """
    Traite un fichier MP3 et retourne le contenu SRT.
    """
    try:
        segments = convert_mp3_to_text_with_timestamps(mp3_file_path)
        if not segments:
            print("Erreur: Aucun segment n'a été généré", file=sys.stderr)
            return None
            
        srt_content = generate_srt_from_segments(segments)
        return srt_content
    except Exception as e:
        print(f"Erreur lors du traitement: {str(e)}", file=sys.stderr)
        return None

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python app.py <mp3_file_path>", file=sys.stderr)
        sys.exit(1)
        
    mp3_file_path = sys.argv[1]
    if not os.path.exists(mp3_file_path):
        print(f"Erreur: Le fichier {mp3_file_path} n'existe pas", file=sys.stderr)
        sys.exit(1)
        
    srt_content = process_mp3_file(mp3_file_path)
    if srt_content:
        print(srt_content)
        sys.exit(0)
    else:
        sys.exit(1)
from flask import Flask, request, jsonify, render_template, send_from_directory

from werkzeug.utils import secure_filename
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
@app.route('/')
def home():
    return render_template('index.html')

# Set max upload size (e.g., 1GB)
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 200MB
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

ALLOWED_EXTENSIONS = {'json', 'xml', 'txt', 'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Serve uploaded files
@app.route('/uploads/<path:filename>', methods=['GET'])
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/uploads', methods=['POST'])
def upload_file():
    # Chunked upload support
    file = request.files.get('file')
    filename = request.form.get('filename')
    chunk_index = request.form.get('chunkIndex', type=int)
    total_chunks = request.form.get('totalChunks', type=int)
    if not file or not filename:
        return jsonify({'error': 'Missing file or filename'}), 400
    if not allowed_file(filename):
        return jsonify({'error': 'Invalid file type'}), 400
    temp_filename = secure_filename(filename) + '.part'
    temp_filepath = os.path.join(app.config['UPLOAD_FOLDER'], temp_filename)
    # Append chunk to temp file
    with open(temp_filepath, 'ab') as f:
        f.write(file.read())
    # If last chunk, rename to final filename
    if chunk_index == total_chunks - 1:
        final_filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(filename))
        os.rename(temp_filepath, final_filepath)
        return jsonify({'success': True, 'filename': filename}), 200
    return jsonify({'success': True, 'chunk': chunk_index}), 200

def main():
    app.run(debug=True)

if __name__ == '__main__':
    main()

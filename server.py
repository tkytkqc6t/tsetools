from flask import Flask, request, jsonify, render_template, send_from_directory

from werkzeug.utils import secure_filename
import os
import uuid

app = Flask(__name__, static_folder='static', template_folder='templates')
@app.route('/')
def home():
    return render_template('index.html')

# Each request contains one small chunk; the complete file may be larger.
app.config['MAX_CONTENT_LENGTH'] = 3 * 1024 * 1024
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

UPLOAD_CHUNK_SIZE = 2 * 1024 * 1024

ALLOWED_EXTENSIONS = {'json', 'xml', 'txt', 'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Serve uploaded files
@app.route('/uploads/<path:filename>', methods=['GET'])
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/uploads', methods=['POST'])
def upload_file():
    file = request.files.get('file')
    filename = request.form.get('filename')
    chunk_index = request.form.get('chunkIndex', type=int)
    total_chunks = request.form.get('totalChunks', type=int)
    total_size = request.form.get('totalSize', type=int)
    upload_id = request.form.get('uploadId', '')
    if not file or not filename or chunk_index is None or total_chunks is None or total_size is None:
        return jsonify({'error': 'Missing file or chunk metadata'}), 400
    if not allowed_file(filename):
        return jsonify({'error': 'Invalid file type'}), 400
    try:
        upload_id = str(uuid.UUID(upload_id))
    except (ValueError, AttributeError):
        return jsonify({'error': 'Invalid upload ID'}), 400
    if total_size < 0 or total_chunks != max(1, (total_size + UPLOAD_CHUNK_SIZE - 1) // UPLOAD_CHUNK_SIZE):
        return jsonify({'error': 'Invalid upload size or chunk count'}), 400
    if chunk_index < 0 or chunk_index >= total_chunks:
        return jsonify({'error': 'Invalid chunk index'}), 400

    expected_start = chunk_index * UPLOAD_CHUNK_SIZE
    expected_length = min(UPLOAD_CHUNK_SIZE, max(0, total_size - expected_start))
    chunk_data = file.read(UPLOAD_CHUNK_SIZE + 1)
    if len(chunk_data) != expected_length:
        return jsonify({'error': 'Chunk size does not match upload metadata'}), 400

    temp_filepath = os.path.join(app.config['UPLOAD_FOLDER'], upload_id + '.part')
    current_size = os.path.getsize(temp_filepath) if os.path.exists(temp_filepath) else 0
    if current_size != expected_start:
        return jsonify({'error': 'Chunks must be uploaded once, in order'}), 409

    mode = 'wb' if chunk_index == 0 else 'ab'
    with open(temp_filepath, mode) as output:
        output.write(chunk_data)

    if chunk_index == total_chunks - 1:
        if os.path.getsize(temp_filepath) != total_size:
            os.remove(temp_filepath)
            return jsonify({'error': 'Uploaded file size mismatch'}), 400
        final_filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(filename))
        os.replace(temp_filepath, final_filepath)
        return jsonify({'success': True, 'filename': secure_filename(filename)}), 200
    return jsonify({'success': True, 'chunk': chunk_index}), 200

def main():
    host = os.environ.get('TS_TOOLS_HOST', '127.0.0.1')
    port = int(os.environ.get('TS_TOOLS_PORT', '5000'))
    debug = os.environ.get('TS_TOOLS_DEBUG', '0') == '1'
    app.run(host=host, port=port, debug=debug)

if __name__ == '__main__':
    main()

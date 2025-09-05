from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
@app.route('/')
def home():
    return render_template('index.html')

# Set max upload size (e.g., 1GB)
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024  # 1GB
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

ALLOWED_EXTENSIONS = {'json', 'xml', 'txt', 'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploads', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        # Save file in chunks (streaming)
        with open(filepath, 'wb') as f:
            while True:
                chunk = file.stream.read(10*1024 * 1024)  # 10MB chunks
                if not chunk:
                    break
                f.write(chunk)
        return jsonify({'success': True, 'filename': filename}), 200
    return jsonify({'error': 'Invalid file type'}), 400

def main():
    app.run(debug=True)

if __name__ == '__main__':
    main()

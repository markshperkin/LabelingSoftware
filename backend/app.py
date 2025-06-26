# app.py
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
from werkzeug.utils import secure_filename
# from dotenv import load_dotenv

# # Load .env (if any)
# load_dotenv()

# Allowed file extensions
ALLOWED_CSV = {'csv'}
ALLOWED_VIDEO = {'mp4', 'mov', 'avi'}

def allowed_file(filename, allowed_ext):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_ext

def create_app():
    app = Flask(__name__)
    CORS(app)

    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    @app.route('/upload', methods=['POST'])
    def upload():
        # 1) Get files
        accel = request.files.get('accel')
        gyro  = request.files.get('gyro')
        video = request.files.get('video')

        # 2) Validate
        if not (accel and allowed_file(accel.filename, ALLOWED_CSV)):
            return jsonify(error='Missing or invalid accelerometer file'), 400
        if not (gyro and allowed_file(gyro.filename, ALLOWED_CSV)):
            return jsonify(error='Missing or invalid gyroscope file'), 400
        if not (video and allowed_file(video.filename, ALLOWED_VIDEO)):
            return jsonify(error='Missing or invalid video file'), 400

        # 3) Save to disk
        accel_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(accel.filename))
        gyro_path  = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(gyro.filename))
        video_name = secure_filename(video.filename)
        video_path = os.path.join(app.config['UPLOAD_FOLDER'], video_name)

        accel.save(accel_path)
        gyro.save(gyro_path)
        video.save(video_path)

        # 4) Parse CSVs into JSON
        df_accel = pd.read_csv(accel_path)
        df_gyro  = pd.read_csv(gyro_path)

        # Expect columns: timestamp, x, y, z
        accel_data = df_accel.to_dict(orient='records')
        gyro_data  = df_gyro.to_dict(orient='records')
        first_ts   = int(df_accel['timestamp'].iloc[0])

        # 5) Return payload
        return jsonify({
          'accelData': accel_data,
          'gyroData':  gyro_data,
          'videoUrl':  f'/uploads/{video_name}',
          'firstTimestamp': first_ts
        })

    @app.route('/labels', methods=['POST'])
    def labels():
        segments = request.get_json()
        if not isinstance(segments, list):
            return jsonify(error='Expected a list of segments'), 400

        # Write out labels.csv
        df = pd.DataFrame(segments)
        out_path = os.path.join(app.config['UPLOAD_FOLDER'], 'labels.csv')
        df.to_csv(out_path, index=False)

        return jsonify(status='ok')

    @app.route('/uploads/<path:filename>')
    def serve_uploads(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=False)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=int(os.getenv('PORT', 5000)))

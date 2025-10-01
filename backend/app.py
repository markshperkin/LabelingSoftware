import os
import json
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import pandas as pd
import pandas.errors

def create_app():
    app = Flask(__name__)
    CORS(app)

    DATA_FOLDER = os.getenv('DATA_FOLDER', 'data')
    os.makedirs(DATA_FOLDER, exist_ok=True)
    app.config['DATA_FOLDER'] = DATA_FOLDER

    @app.route('/runs', methods=['GET'])
    def list_runs():
        print(f"[list_runs] Looking in {DATA_FOLDER}")
        runs = []
        for run in sorted(os.listdir(DATA_FOLDER)):
            run_path = os.path.join(DATA_FOLDER, run)
            if not os.path.isdir(run_path):
                continue

            meta_path = os.path.join(run_path, 'metadata.json')
            try:
                status = json.load(open(meta_path))['status']
            except Exception as e:
                print(f"[list_runs] Could not read metadata.json for {run}: {e}")
                status = 'pending'

            files = os.listdir(run_path)
            accel_file = next((f for f in files if f.startswith('accel_') and f.endswith('.csv')), None)
            label_id = None
            if accel_file:
                label_id = accel_file.split('_', 1)[1].rsplit('.',1)[0]

            print(f"[list_runs] Found run={run}, status={status}, labelId={label_id}")
            runs.append({
                'id': run,
                'status': status,
                'labelId': label_id
            })
        return jsonify(runs)

    @app.route('/runs/<run_id>', methods=['GET'])
    def get_run(run_id):
        base = os.path.join(DATA_FOLDER, run_id)
        print(f"[get_run] Request for run {run_id}, base path = {base}")
        if not os.path.isdir(base):
            print(f"[get_run] Directory not found: {base}")
            return jsonify(error='Run not found'), 404

        files = os.listdir(base)
        print(f"[get_run] Files in {run_id}: {files}")

        accel_fname = next((f for f in files if f.startswith('accel_') and f.endswith('.csv')), None)
        gyro_fname  = next((f for f in files if f.startswith('gyro_')  and f.endswith('.csv')), None)
        video_fname = next((f for f in files if f.endswith('.mp4')), None)

        print(f"[get_run] accel={accel_fname}, gyro={gyro_fname}, video={video_fname}")

        if not accel_fname or not gyro_fname or not video_fname:
            print(f"[get_run] Missing one or more data files")
            return jsonify(error='Missing data files'), 400

        accel_path = os.path.join(base, accel_fname)
        gyro_path  = os.path.join(base, gyro_fname)
        print(f"[get_run] accel file size: {os.path.getsize(accel_path)} bytes")
        print(f"[get_run] gyro file size: {os.path.getsize(gyro_path)} bytes")

        try:
            accel_df = pd.read_csv(accel_path)
            gyro_df  = pd.read_csv(gyro_path)
            print(f"[get_run] Loaded accel rows={len(accel_df)}, gyro rows={len(gyro_df)}")
        except Exception as e:
            print(f"[get_run] Error reading CSVs: {e}")
            return jsonify(error='Error parsing CSV'), 500

        accel_data = accel_df.to_dict(orient='records')
        gyro_data  = gyro_df.to_dict(orient='records')

        meta = json.load(open(os.path.join(base, 'metadata.json')))
        status = meta.get('status', 'pending')
        print(f"[get_run] Metadata status = {status}")

        timestamp = accel_fname.split('_',1)[1].rsplit('.',1)[0]
        labels_fname = f'labels_{timestamp}.csv'
        labels_path = os.path.join(base, labels_fname)
        print(f"[get_run] Looking for labels file: {labels_fname}")

        try:
            labels = pd.read_csv(labels_path).to_dict(orient='records')
            print(f"[get_run] Loaded existing labels count = {len(labels)}")
        except (FileNotFoundError, pandas.errors.EmptyDataError):
            labels = []
            print(f"[get_run] No labels found, creating empty {labels_fname}")
            pd.DataFrame(labels, columns=['t_x','t_l','label']).to_csv(labels_path, index=False)

        return jsonify({
            'accelData': accel_data,
            'gyroData':  gyro_data,
            'videoUrl':  f'/data/{run_id}/{video_fname}',
            'labels':    labels,
            'status':    status
        })

    @app.route('/data/<run_id>/<path:filename>')
    def serve_data_file(run_id, filename):
        folder = os.path.join(DATA_FOLDER, run_id)
        return send_from_directory(folder, filename, as_attachment=False)

    @app.route('/runs/<run_id>/labels', methods=['POST'])
    def save_labels(run_id):
        segments = request.get_json()
        base = os.path.join(DATA_FOLDER, run_id)
        print(f"[save_labels] Saving {len(segments)} segments for run {run_id}")

        files = os.listdir(base)
        accel_fname = next((f for f in files if f.startswith('accel_') and f.endswith('.csv')), None)
        timestamp = accel_fname.split('_',1)[1].rsplit('.',1)[0]
        labels_fname = f'labels_{timestamp}.csv'
        labels_path = os.path.join(base, labels_fname)

        # pd.DataFrame(segments).to_csv(labels_path, index=False)  # creates/overwrites the labels csv files
        # print(f"[save_labels] Wrote labels to {labels_path}")

        # meta_path = os.path.join(base, 'metadata.json') # creates/overwrites the metadata in files
        # with open(meta_path, 'w') as f:
        #     json.dump({'status': 'completed'}, f)
        # print(f"[save_labels] Updated status to completed in metadata.json")

        return send_file(
            labels_path,
            mimetype='csv',
            as_attachment=True,
            download_name=labels_fname
        )

    @app.route('/runs/<run_id>/status', methods=['PATCH'])
    def update_status(run_id):
        new_status = request.json.get('status')
        if new_status not in ('pending','in_progress','completed'):
            return jsonify(error='Invalid status'), 400
        meta_path = os.path.join(DATA_FOLDER, run_id, 'metadata.json')
        with open(meta_path, 'w') as f:
            json.dump({'status': new_status}, f)
        print(f"[update_status] Set status={new_status} for run {run_id}")
        return jsonify(status='ok')

    return app

app = create_app()
if __name__ == '__main__':
    app.run(debug=True, port=int(os.getenv('PORT', 5000)))

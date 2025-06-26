import { useState, useRef } from 'react';
import './App.css';
import { uploadFiles, submitLabels } from './api';
import Charts from './components/Charts';
import VideoPlayer from './components/VideoPlayer';
import Navbar from './components/Navbar';

function App() {
  const [files, setFiles] = useState({ accel: null, gyro: null, video: null });
  const [sensorData, setSensorData] = useState(null);
  const [segments, setSegments] = useState([]);
  const videoRef = useRef(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);

  const handleFileChange = (e) => {
    setFiles(f => ({ ...f, [e.target.name]: e.target.files[0] }));
  };

  function handleSegmentComplete(segment) {
    setSegments(s => [...s, segment]);
  }

  async function handleUpload() {
    try {
      const { accelData, gyroData, videoUrl, firstTimestamp } =
        await uploadFiles(files.accel, files.gyro, files.video);

      const accel = accelData.map(d => ({
        ...d,
        timestamp: d.timestamp - firstTimestamp
      }));
      const gyro = gyroData.map(d => ({
        ...d,
        timestamp: d.timestamp - firstTimestamp
      }));

      setSensorData({ accel, gyro, videoUrl });
      setCurrentTimeMs(0);
    } catch(err) {
      console.error(err);
      alert('Upload failed :(');
    }
  }

  async function handleSaveSegments(segments) {
    try {
      await submitLabels(segments);
      alert('SAVED!');
    } catch(err) {
      console.error(err);
      alert('Labels failed to save');
    }
  }

  // called when you hover the chart
  const handleHover = (t_ms) => {
    if (videoRef.current) {
      videoRef.current.currentTime = t_ms / 1000;
    }
    setCurrentTimeMs(t_ms);
  };

  // compute max timestamp once per render
  const maxT = sensorData
    ? sensorData.accel[sensorData.accel.length - 1].timestamp
    : 1;
  const playPct = sensorData
  ? Math.min(Math.max(currentTimeMs / maxT, 0), 1) * 100
  : 0;

  return (
    <div className="App">
      <Navbar
        sensorData={sensorData}
        onUploadNew={() => setSensorData(null)}
        onExportLabels={() => handleSaveSegments(segments)}
      />

      { !sensorData ? (
        <div className="upload-form">
          <h2>Upload Sensor & Video Files</h2>

          <div className="input-group">
            <label htmlFor="accel">Accelerometer CSV</label>
            <input type="file" name="accel" accept=".csv" onChange={handleFileChange} />
          </div>
          <div className="input-group">
            <label htmlFor="gyro">Gyroscope CSV</label>
            <input type="file" name="gyro"  accept=".csv" onChange={handleFileChange} />
          </div>
          <div className="input-group">
            <label htmlFor="video">Ground Truth Video</label>
            <input type="file" name="video" accept=".mp4" onChange={handleFileChange} />
          </div>
          <button
            onClick={handleUpload}
            disabled={!(files.accel && files.gyro && files.video)}
          >
            Upload & Visualize
          </button>
        </div>
      ) : (
        <div className="labeling-container">
          <div className="visualization">
            <div className="video">
              <VideoPlayer
                ref={videoRef}
                src={sensorData.videoUrl}
                onTimeUpdate={sec => setCurrentTimeMs(sec * 1000)}
              />
            </div>

            <div className="graphs">
              <Charts
                accel={sensorData.accel}
                gyro={sensorData.gyro}
                onHover={handleHover}
                onSegmentComplete={handleSegmentComplete}
              />
              {/* declarative playhead */}
              <div className='playhead-container'>
              <div
                className="playhead-line"
                style={{
                  left: `calc(${(currentTimeMs / maxT) * 100}% - 1px)`
                }}
              />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

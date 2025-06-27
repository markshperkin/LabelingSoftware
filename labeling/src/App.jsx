import { useState, useRef, useEffect, useMemo } from 'react';
import './App.css';
import { uploadFiles, submitLabels } from './api';
import Charts from './components/Charts';
import VideoPlayer from './components/VideoPlayer';
import Navbar from './components/Navbar';

function App() {
  const [files, setFiles] = useState({ accel: null, gyro: null, video: null });
  const [rawData, setRawData]       = useState(null);
  const [trimmedData, setTrimmedData] = useState(null);
  const [segments, setSegments]     = useState([]);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const videoRef = useRef(null);
  const [activeLabel, setActiveLabel]     = useState(null);
  const [pendingSegments, setPendingSegments]      = useState([]);
  const [savedSegments, setSavedSegments]          = useState([]);

  const combinedSegments = useMemo(
    () => [...savedSegments, ...pendingSegments],
    [savedSegments, pendingSegments]
  );


  const handleFileChange = e => {
    setFiles(f => ({ ...f, [e.target.name]: e.target.files[0] }));
  };


  const handleUpload = async () => {
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

    setRawData({ accel, gyro, videoUrl });
    setCurrentTimeMs(0);
    setTrimmedData(null);
  };

  useEffect(() => {
    if (!rawData || !videoRef.current) return;
    const video = videoRef.current;
    const onMeta = () => {
      const durMs = video.duration * 1000;
      setTrimmedData({
        videoUrl: rawData.videoUrl,
        accel: rawData.accel.filter(pt => pt.timestamp <= durMs),
        gyro: rawData.gyro.filter(pt => pt.timestamp <= durMs)
      });
    };
    video.addEventListener('loadedmetadata', onMeta);
    return () => video.removeEventListener('loadedmetadata', onMeta);
  }, [rawData]);

  const handleTimeUpdate = sec => {
    if (!trimmedData || !videoRef.current) return;
    const maxT = trimmedData.accel[trimmedData.accel.length - 1].timestamp;
    const t_ms = (sec / videoRef.current.duration) * maxT;
    setCurrentTimeMs(t_ms);
  };

  const handleHover = t_ms => {
    if (videoRef.current) videoRef.current.currentTime = t_ms / 1000;
    setCurrentTimeMs(t_ms);
  };

  // ---- Labeling callbacks ----

  const handleSelectLabel = label => {
    setActiveLabel(label);
  };

  const handleSegmentComplete = ({ t_x, t_l, label }) => {
    if (!activeLabel) return;
    setPendingSegments(p => {
        const updated = [...p, { t_x, t_l, label}];
        console.log('Added pending segmest:', { t_x, t_l, label });
        console.log('Pending segment now:', updated)
        return updated;
    });
  };

  const handleUndo = () => {
    setPendingSegments(p => p.slice(0, -1));
  };

  const handleSavePending = () => {
    console.log('Saving pending segments:', pendingSegments);
    setSavedSegments(s => {
        const updatedSaved = [...s, ...pendingSegments];
        console.log('Saved segments now:', updatedSaved);
        return updatedSaved;
    });
    setPendingSegments([]);
    setActiveLabel(null);
  };

  const handleExportLabels = async () => {
    await submitLabels(savedSegments);
    alert('Exported!');
  };

  const maxT = trimmedData
    ? trimmedData.accel[trimmedData.accel.length - 1].timestamp
    : 1;
  const playPct = trimmedData
    ? Math.min(Math.max(currentTimeMs / maxT, 0), 1) * 100
    : 0;

  const handleSaveSegments = async segs => {
    await submitLabels(segs);
    alert('SAVED!');
  };

  return (
    <div className="App">
      <Navbar
        sensorData={trimmedData}
        onUploadNew={() => {
            setRawData(null);
            setSavedSegments([]);
            setPendingSegments([]);
        }}       
        onExportLabels={handleExportLabels}
        pendingCount={pendingSegments.length}
        onSelectLabel={handleSelectLabel}
        onUndo={handleUndo}
        onSavePending={handleSavePending}
      />

      {!rawData ? (
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

        // labeling interface

        <div className="labeling-container">
          <div className="visualization">
            <div className="video">
              <VideoPlayer
                ref={videoRef}
                src={rawData.videoUrl}
                onTimeUpdate={handleTimeUpdate}
              />
            </div>

            {trimmedData && (
              <div className="graphs">
                <Charts
                  accel={trimmedData.accel}
                  gyro={trimmedData.gyro}
                  activeLabel={activeLabel}
                  segments={combinedSegments}
                  onHover={handleHover}
                  onSegmentComplete={handleSegmentComplete}
                />
                <div className="playhead-container">
                  <div
                    className="playhead-line"
                    style={{ left: `calc(${playPct}% - 1px)` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

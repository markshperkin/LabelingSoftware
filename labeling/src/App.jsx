import { useState, useRef, useEffect, useMemo } from 'react';
import './App.css';
import { listRuns, getRun, saveLabels } from './api';
import Charts from './components/Charts';
import VideoPlayer from './components/VideoPlayer';
import Navbar from './components/Navbar';

function App() {
  const [rawData, setRawData] = useState(null);
  const [trimmedData, setTrimmedData] = useState(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const videoRef = useRef(null);
  const [activeLabel, setActiveLabel] = useState(null);
  const [pendingSegments, setPendingSegments] = useState([]);
  const [savedSegments, setSavedSegments] = useState([]);

  // run selector state
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);

  const combinedSegments = useMemo(
    () => [...savedSegments, ...pendingSegments],
    [savedSegments, pendingSegments]
  );

  useEffect(() => {
    listRuns()
      .then(data => {
        if (Array.isArray(data)) setRuns(data);
        else console.error('Expected runs array, got:', data);
      })
      .catch(err => console.error('listRuns failed', err));
  }, []);

  // when the user picks a run, load its data
  const handleRunSelect = async runId => {
    const { accelData, gyroData, videoUrl, labels, status } = await getRun(runId);
    // find the labelId for this run:
    const firstTs = accelData[0]?.timestamp ?? 0;

    // zero-base
    const accel = accelData.map(d => ({
      ...d,
      timestamp: d.timestamp - firstTs
    }));
    const gyro = gyroData.map(d => ({
      ...d,
      timestamp: d.timestamp - firstTs
    }));

    setRawData({ accel, gyro, videoUrl });
    setTrimmedData({ accel, gyro, videoUrl });
    setSavedSegments(labels);
    setPendingSegments([]);
    setCurrentTimeMs(0);
    setSelectedRun(runId);
  };

  // export (save) labels back to the server
  const handleExportLabels = async () => {
    if (!selectedRun) return;
    await saveLabels(selectedRun, savedSegments);
    alert('Labels saved to server for run ' + selectedRun);
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
    const data = trimmedData || rawData;
    if (!data || !videoRef.current) return;
    const maxT = data.accel.length
      ? data.accel[data.accel.length - 1].timestamp
      : 1;
    const t_ms = (sec / videoRef.current.duration) * maxT;
    setCurrentTimeMs(t_ms);
  };

  const handleHover = t_ms => {
    if (videoRef.current) videoRef.current.currentTime = t_ms / 1000;
    setCurrentTimeMs(t_ms);
  };

  // labeling callbacks

  const handleSelectLabel = label => {
    setActiveLabel(label);
  };

  const handleSegmentComplete = ({ t_x, t_l, label }) => {
    if (!activeLabel) return;

    const newStart = t_x - t_l / 2;
    const newEnd = t_x + t_l / 2;
    const existing = [...savedSegments, ...pendingSegments];

    for (const seg of existing) {
      const segStart = seg.t_x - seg.t_l / 2;
      const segEnd = seg.t_x + seg.t_l / 2;

      if (newStart <= segEnd && segStart <= newEnd) {
        alert('this segment overlaps an existing segment and was not added :(');
        return;
      }
    }

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


  const maxT = trimmedData
    ? trimmedData.accel[trimmedData.accel.length - 1].timestamp
    : 1;

  const playPct = trimmedData
    ? Math.min(Math.max(currentTimeMs / maxT, 0), 1) * 100
    : 0;


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

      {/* select run ui */}
        {!rawData ? (
          <div className="run-grid">
            {runs.map(run => (
              <div
                key={run.id}
                className="run-box"
                onClick={() => handleRunSelect(run.id)}
              >
                <div className="run-id">{run.id}</div>
                <div className={`status ${run.status}`}>
                  {run.status.replace('_', ' ')}
                </div>
              </div>
            ))}
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

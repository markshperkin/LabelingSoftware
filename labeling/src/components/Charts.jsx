import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';

const Charts = ({
  accel,
  gyro,
  onHover,
  onSegmentComplete
}) => {
  const [dragStart, setDragStart] = useState(null);

  const handleMouseDown = (e) => {
    if (e && e.activeLabel != null) {
      setDragStart(e.activeLabel);
    }
  };

  const handleMouseUp = (e) => {
    if (dragStart != null && e.activeLabel != null) {
      const tStart = dragStart;
      const tEnd = e.activeLabel;
      const t_x = (tStart + tEnd) / 2;
      const t_l = Math.abs(tEnd - tStart);
      const label = prompt('Enter label for this segment:');
      if (label) {
        onSegmentComplete({ t_x, t_l, label });
      }
    }
    setDragStart(null);
  };

  return (
    <div>
      <h3>Accelerometer</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={accel}
          onMouseMove={e => e.activeLabel != null && onHover(e.activeLabel)}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <XAxis 
            dataKey="timestamp"
            type="number"
            domain={[0, 'dataMax']}
            tickFormatter={t => `${t}ms`}
          />
          <YAxis />
          <Line type="monotone" dataKey="x" stroke="#FF4C4C" dot={false} />
          <Line type="monotone" dataKey="y" stroke="#4C9EFF" dot={false} />
          <Line type="monotone" dataKey="z" stroke="#4CFF88" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <h3>Gyroscope</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={gyro}
          onMouseMove={e => e.activeLabel != null && onHover(e.activeLabel)}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <XAxis 
            dataKey="timestamp"
            type="number"
            domain={[0, 'dataMax']}
            tickFormatter={t => `${t}ms`}
          />
          <YAxis />      
          <Line type="monotone" dataKey="x" stroke="#FF4C4C" dot={false} />
          <Line type="monotone" dataKey="y" stroke="#4C9EFF" dot={false} />
          <Line type="monotone" dataKey="z" stroke="#4CFF88" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(
  Charts,
  (prev, next) =>
    prev.accel === next.accel &&
    prev.gyro === next.gyro
);

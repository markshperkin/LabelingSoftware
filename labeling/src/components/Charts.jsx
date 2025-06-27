import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';

const Charts = ({ 
  accel, 
  gyro, 
  onHover,
  activeLabel,
  segments,
  onSegmentComplete
}) => {

  console.log('[Charts] accel.length =', accel?.length,
              'gyro.length =',  gyro?.length,
              'segments =', segments);

  const [startMs, setStartMs] = useState(null);
  const colors = {
    'Cycle': '#e74c9e',
    'Underwater': '#27de00',
    'Turn': '#27ae60',
    'Push': '#9980e9'
  };

  const handleClick = e => {
    if (!activeLabel || !e || e.activeLabel == null) return;

    const t = e.activeLabel;
    if (startMs == null) { // first click
      setStartMs(t);
    } else { // second click
      const tStart = startMs;
      const tEnd = t;
      const t_x = (tStart + tEnd) / 2;
      const t_l = Math.abs(tEnd - tStart);
      onSegmentComplete({ t_x, t_l, label: activeLabel});
      setStartMs(null);
    }
  };

  const renderSegments = () =>
    segments.map((seg, i) => {
      const half = seg.t_l / 2;
      const x1 = seg.t_x - half;
      const x2 = seg.t_x + half;
      return (
        <ReferenceArea
        key={i}
        x1={x1}
        x2={x2}
        stroke={colors[seg.label]}
        fill={colors[seg.label]}
        fillOpacity={0.2}
        />
      );
    });

  return (
    <div>
      <h3>Accelerometer</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={accel}
          onMouseMove={e => e.activeLabel != null && onHover(e.activeLabel)}
          onClick={handleClick}
        >
          <XAxis 
            dataKey="timestamp"
            type="number"
            domain={[0, 'dataMax']}
            tickFormatter={t => `${t}ms`}
          />
          <YAxis />
          {renderSegments()}
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
          onClick={handleClick}
        >
          <XAxis 
            dataKey="timestamp"
            type="number"
            domain={[0, 'dataMax']}
            tickFormatter={t => `${t}ms`}
          />
          <YAxis />
          {renderSegments()}   
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
    prev.gyro === next.gyro &&
    prev.activeLabel === next.activeLabel &&
    prev.segments === next.segments
);

import React, { forwardRef } from 'react';

const VideoPlayer = forwardRef(({ src, onTimeUpdate }, ref) => {
  const handleTimeUpdate = (e) => {
    if (onTimeUpdate) {
      onTimeUpdate(e.target.currentTime);
    }
  };

  return (
    <video
      ref={ref}
      src={src}
      controls
      width="100%"
      onTimeUpdate={handleTimeUpdate}
      style={{ marginTop: '16px' }}
    />
  );
});

export default VideoPlayer;

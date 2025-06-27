import React, { forwardRef, useRef, useImperativeHandle } from 'react';

const VideoPlayer = forwardRef(({ src, onLoadedMetadata, onTimeUpdate }, ref) => {
  const videoEl = useRef(null);

  // let parent ref access the <video> DOM node
  useImperativeHandle(ref, () => videoEl.current);

  const handleLoadedMetadata = (e) => {
    if (onLoadedMetadata) onLoadedMetadata(e);
  };

  const handleTimeUpdate = (e) => {
    if (onTimeUpdate) onTimeUpdate(e.target.currentTime);
  };

  return (
    <video
      ref={videoEl}
      src={src}
      controls
      width="100%"
      style={{ marginTop: '16px' }}
      onLoadedMetadata={handleLoadedMetadata}
      onTimeUpdate={handleTimeUpdate}
    />
  );
});

export default VideoPlayer;

import React, { useState } from 'react';
import '../styles/Navbar.css';

const Navbar = ({ 
  sensorData, 
  onUploadNew, 
  onExportLabels,
  pendingCount,
  onSelectLabel,
  onUndo,
  onSavePending
}) => {
  // hard coded labels for the dropdown
  const labels = [
    'Freestyle',
    'Backstroke',
    'Butterfly',
    'Breaststroke',
    'Underwater glide',
    'Underwater kick',
    'Push-off',
    'Turn',
    'Wall touch',
    'Rest'
  ];

  // a color for each
  const colorsLabels = {
    'Freestyle':        '#e74c3c', // red
    'Backstroke':       '#3498db', // blue
    'Butterfly':        '#f39c12', // orange
    'Breaststroke':     '#2ecc71', // green
    'Underwater glide': '#1abc9c', // teal
    'Underwater kick':  '#9b59b6', // purple
    'Push-off':         '#e67e22', // pumpkin
    'Turn':             '#d35400', // dark orange
    'Wall touch':       '#c0392b', // dark red
    'Rest':             '#7f8c8d'  // gray
  };

  const colorsLegend = {
    'X-axis': '#e74c3c',
    'Y-axis': '#27ae60',
    'Z-axis': '#2980b9'
  };

  const legend = ['X-axis', 'Y-axis', 'Z-axis'];
  const [activeLabel, setActiveLabel] = useState(null);

  const handleLabelClick = (label) => {
    setActiveLabel(label);
    onSelectLabel(label);
  }
  
  const handleCancelOrUndo = () => {
    if (pendingCount > 0) {
      onUndo();
    } else {
      setActiveLabel(null);
      onSelectLabel(null);
    }
  };

  
  return (
    <nav className="navbar">
      <ul>
        { !sensorData ? (
          <li>Welcome to the labeling app</li>
        ) : (
          <>
            <li>
              <button className="nav-button" onClick={onUploadNew}>
                Upload New File
              </button>
            </li>
            <li>
              <button className="nav-button" onClick={onExportLabels}>
                Export Labels
              </button>
            </li>

            {/* label selector */}
            <li className="dropdown">
              <button className="dropbtn">
                { activeLabel || 'Select Label' } ▾
              </button>
              <div className="dropdown-content">
                {labels.map(label => (
                  <a
                    key={label}
                    href="#"
                    onClick={() => handleLabelClick(label)}
                    style={{ color: colorsLabels[label] }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </li>

            { activeLabel && (
              <>
                <li>
                  <button className="nav-button" onClick={handleCancelOrUndo}>
                    { pendingCount > 0 ? 'Undo' : 'Cancel' }
                  </button>
                </li>
                <li>
                  <button
                    className="nav-button"
                    onClick={() => {
                      setActiveLabel(null);
                      onSelectLabel(null);
                      onSavePending();
                    }}
                    disabled={pendingCount === 0}
                  >
                    Save
                  </button>
                </li>
              </>
            )}

            <li className='dropdown'>
              <button className='dropbtn'>
                Legend ▾
              </button>
              <div className='dropdown-content'>
                {legend.map(label => (
                  <a
                    key={label}
                    href="#"
                    style={{ color: colorsLegend[label] }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </li>
            
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;

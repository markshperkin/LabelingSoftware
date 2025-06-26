import React from 'react';
import '../styles/Navbar.css';

const Navbar = ({ sensorData, onUploadNew, onExportLabels }) => {
  // hard‐coded labels for the dropdown
  const labels = ['Stroke Start', 'Stroke End', 'Turn', 'Push Off'];
  const legend = ['X-axis', 'Y-axis', 'Z-axis'];
  const colors = {
    'X-axis': '#e74c3c',
    'Y-axis': '#27ae60',
    'Z-axis': '#2980b9'
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
            <li className="dropdown">
              <button className="dropbtn">
                Labels ▾
              </button>
              <div className="dropdown-content">
                {labels.map(label => (
                  <a key={label} href="#">
                    {label}
                  </a>
                ))}
              </div>
            </li>
            <li className='dropdown'>
              <button className='dropbtn'>
                Legend ▾
              </button>
              <div className='dropdown-content'>
                {legend.map(label => (
                  <a
                    key={label}
                    href="#"
                    style={{ color: colors[label] }}
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

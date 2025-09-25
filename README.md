# IMU Data Labeling Software

## Overview
This project is a web-based labeling tool designed to annotate accelerometer and gyroscope time-series data. While it was originally developed for swimming activity analysis, it is general-purpose and can be adapted to other motion datasets involving IMU sensors.  
This tool was developed as part of my M.S. thesis research on human activity recognition using wearable sensor data. It was used to annotate swimming motion data collected from a single wrist-worn IMU worn by athletes from the [University of South Carolina's Division I SEC swim team](https://gamecocksonline.com/sports/swimming/).  

## Preview:
<img width="2530" height="1100" alt="image" src="https://github.com/user-attachments/assets/64a92152-1cd6-4e99-b298-02561af26edd" />

## Key Features
 - Intuitive interface for creating and managing class-specific segments  
 - Video synchronization support for accurate frame-by-frame labeling using ground truth footage  
 - Local database management  

## Database setup
This project does not rely on a traditional database management system. Instead, all labeled data is stored in a structured file system within the *backend/data/* directory.  
Inside the backend folder, create a "data" directory. Each data sample should reside in its own uniquely named subfolder (e.g., 01, 02, sample_01, etc.), containing the following files:  
```
backend/  
└── data/  
    └── 01/  
        ├── accel_<sample>.csv  
        ├── gyro_<sample>.csv  
        ├── labels_<sample>.csv    # generated automatically  
        ├── metadata.json  
        └── video01.mp4  
```
### Raw accelerometer and gyroscope 
Must be formatted as:  
```
timestamp, x, y, z
```
### metadata.json 
The labeling session should initially contain:
```
{
  "status": "pending"
}
```
### video.mp4 - Ground truth video
Note that the video must be shorter than the sensor data stream to ensure proper alignment during annotation.

## Installation

### install npm:
Follow this tutorial: https://www.geeksforgeeks.org/how-to-download-and-install-node-js-and-npm/

1. Clone this repository to your local machine:
    ```bash
    git clone https://github.com/markshperkin/LabelingSoftware.git
    ```

2. Navigate into the project directory:
    ```bash
    cd LabelingSoftware
    ```

3. Install the required packages:
    ```bash
    pip install -r requirements.txt
    ```
4. Using two terminals, init the system
   ```bash
   cd backend
   python app.py
   ```
   ```bash
   cd labeling
   npm run dev
   ```

## Usage

### Update the labeling interface:
 - Update the label names and colors in both *Charts.jsx* and *Navbar.jsx* who are located in *Labeling->src->components*
 - Ensure that each label matches its color name

### Start labeling:
1. Select a sample from the home screen.
2. Choose a label from the label bar.
3. Click once on the chart to start a segment, then click again to end it.
4. Press *Undo* to remove the most recent segment.
5. Once finished, press *Save* to store your annotations, and then *Export Labels* to generate the label file.
6. Press *Home* to select a new sample.

## Thesis Project
The thesis was guided by the following University of South Carolina faculty:  
 - [Homayoun Valafar](https://www.sc.edu/study/colleges_schools/engineering_and_computing/faculty-staff/homayounvalafar.php)
 - [Ramtin Zand](https://www.sc.edu/study/colleges_schools/engineering_and_computing/faculty-staff/zand.php)
 - [Vignesh Narayanan](https://sc.edu/study/colleges_schools/engineering_and_computing/faculty-staff/narayanan_vignesh.php)
 - [Forest Agostinelli](https://www.sc.edu/study/colleges_schools/engineering_and_computing/faculty-staff/forest_agostinelli.php)




# IMU Data Labeling Software

## Overview
This project is a web-based labeling tool designed to annotate accelerometer and gyroscope time-series data. While it was originally developed for swimming activity analysis, it is general-purpose and can be adapted to other motion datasets involving IMU sensors.

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
        ├── labels_<sample>.csv    # is generated automatically  
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
 - Update the label names and colors in both *Charts.jsx* and *Navbar.jsx* who are located in **Labeling->src->components**
 - Ensure that each label matches its color name


## Class Project

This project was developed as part of [Neural Networks and Their Applications class](https://cse.sc.edu/class/584) and [Machine Learning Systems class](https://cse.sc.edu/class/585) under the instruction of [Professor Vignesh Narayanan](https://sc.edu/study/colleges_schools/engineering_and_computing/faculty-staff/narayanan_vignesh.php) and [Professor Pooyan Jamshidi](https://sc.edu/study/colleges_schools/engineering_and_computing/faculty-staff/Jamshidi.php) at the University of South Carolina.


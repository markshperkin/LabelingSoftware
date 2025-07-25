# IMU Data Labeling Software

## Overview
This project is a web-based labeling tool designed to annotate accelerometer and gyroscope time-series data. While it was originally developed for swimming activity analysis, it is general-purpose and can be adapted to other motion datasets involving IMU sensors.

## Key Features
Intuitive interface for creating and managing class specific segments  
Video synchronization support for accurate frame by frame labeling using ground truth footage  
Local database management  

## Database setup
This project does not rely on a traditional database. Instead, all labeled data is stored in a structured file system within the backend/data/ directory.  
Inside the backend folder, create a "data" directory. Each data sample should reside in its own uniquely named subfolder (e.g., 01, 02, sample_01, etc.), containing the following files:  
```
backend/  
└── data/  
    └── 01/  
        ├── accel_<sample>.csv  
        ├── gyro_<sample>.csv  
        ├── labels_<sample>.csv    # is generated when automatically  
        ├── metadata.json  
        └── video01.mp4  
```
# Raw accelerometer and gyroscopre data must be formatted as:  
timestamp, x, y, z
# metadata.json for the labeling session initially contains:
{
  "status": "pending"
}
# video.mp4 is the ground truth video. Note, the video must be shorter than the sensor datastream to ensure proper alignment during annotation.




## Implementation Details

This project was developed based on the research paper **"[Deep High-Resolution Representation Learning for Human Pose Estimation](https://openaccess.thecvf.com/content_CVPR_2019/papers/Sun_Deep_High-Resolution_Representation_Learning_for_Human_Pose_Estimation_CVPR_2019_paper.pdf)"** 
by Ke Sun, Bin Xiao, Dong Liu, and Jingdong Wang. The paper introduces HRNet, which maintains high-resolution representations throughout the process, achieving superior accuracy in pose estimation tasks.
This project's implementation draws inspiration from Bin Xiao's official HRNet repository, which is available on GitHub [here](https://github.com/leoxiaobin/deep-high-resolution-net.pytorch?tab=readme-ov-file).

## Installation

1. Clone this repository to your local machine:
    ```bash
    git clone https://github.com/markshperkin/SwimmingPoseEstimation.git
    ```

2. Navigate into the project directory:
    ```bash
    cd SwimmingPoseEstimation
    ```

3. Install the required packages:
    ```bash
    pip install -r requirements.txt
    ```

## Usage

### 1. Testing the Model on a Swimming Video

First, open `Tester.py` and add the model and input video file paths in lines 182 and 188. <br>Next, run the `Tester.py` script. 
```bash
python Tester.py
```
This script will estimate keypoints found in the video and output a new video with the estimated keypoints.

### 2. Training the Model

Training the model will require NVidia GPU. In order to modify the learning rate, batch size, and the number of epochs go to lines 142 and 145. After a new minimum has been found, the trainer will save the model as a checkpoint.pth.
<br> To initialize the training, run the `hrnetTrainer.py`
```bash
python hrnetTrainer.py
```
## 3. System Testers
There are a few scripts to test various components of the system.
### Test the Model on One Frame:
The `hrnetTester.pt` script will test the accuracy of the model by loading a single frame on a desired model and showing it with the corresponding keypoints, the target ground truth for each keypoint (GT keypoint n), the confidence level for each predicted keypoint, 
the ground truth for each predicted keypoint (Pred Keypoint n), and the Euclidean distance from the target keypoint to the predicted keypoint.
<br>First, open `hrnetTester.pt` and add the desired model and frame for testing on lines 165 and 174. Next run `hrnetTester.py.
```bash
python hrnetTester.py
```
### Test the Data Augmentation Functionality:
The `testerAugmentation.py` script will test three data augmentation techniques, Horizontal Flip, Rotation, and Translation. The function will select a random frame from the dataset and apply the augmentations, showing the before and after frames with the corresponding keypoints.
<br> To run the augmentation tester:
```bash
python testerAugmentation.py


```
### Test the Data Loader:
The `testerDATALOADER.py` script will test the functionality of the dataloader by loading the dataset and displaying a batch of 4 frames with their name and corresponding keypoints.
<br> To run the dataloader tester:
```bash
python testerDATALOADER.py
```

## Class Project

This project was developed as part of [Neural Networks and Their Applications class](https://cse.sc.edu/class/584) and [Machine Learning Systems class](https://cse.sc.edu/class/585) under the instruction of [Professor Vignesh Narayanan](https://sc.edu/study/colleges_schools/engineering_and_computing/faculty-staff/narayanan_vignesh.php) and [Professor Pooyan Jamshidi](https://sc.edu/study/colleges_schools/engineering_and_computing/faculty-staff/Jamshidi.php) at the University of South Carolina.


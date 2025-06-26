import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:5000",
    headers: { 'Content-Type': 'multipart/form-data'}
});

// function to send files to backend
export function uploadFiles(accelFile, gyroFile, videoFile) {
    const form = new FormData();
    form.append('accel', accelFile);
    form.append('gyro', gyroFile);
    form.append('video', videoFile);
    return api.post('/upload', form).then(res => res.data);
}

// function to send labels to backend
export function submitLabels(segments) {
    return axios.post(
        '${import.meta.env.VITE_API_URL}/labels', segments
    ).then(res => res.data)
}
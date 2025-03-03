Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
    faceapi.nets.faceExpressionNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights')
]).then(startVideo);

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            const video = document.getElementById('video');
            video.srcObject = stream; 
            video.play(); 
            video.addEventListener('play', () => {
                const canvas = document.getElementById('overlay');
                const displaySize = { width: video.width, height: video.height };
                faceapi.matchDimensions(canvas, displaySize); 
                
                setInterval(async () => {
                    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceExpressions();
                    const resizedDetections = faceapi.resizeResults(detections, displaySize);
                    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); 
                    faceapi.draw.drawDetections(canvas, resizedDetections); 
                    if (detections.length > 0) {
                        const emotions = detections[0].expressions;
                        const maxEmotion = Object.entries(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
                        document.getElementById('emotion').innerText = `You look ${maxEmotion}!`;
                    } else {
                        document.getElementById('emotion').innerText = 'No face detected';
                    }
                }, 100);
            });
        })
        .catch(err => {
            console.error('Error accessing webcam:', err);
            document.getElementById('emotion').innerText = 'Webcam access denied';
        });
}const emotionMap = {
    happy: '😊', sad: '😢', surprised: '😲', angry: '😠', neutral: '😐'
};
document.getElementById('emotion').innerText = `You look ${maxEmotion}! ${emotionMap[maxEmotion] || ''}`;
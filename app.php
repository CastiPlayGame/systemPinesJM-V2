<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grabación con Detección de Voz</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }

        button {
            margin: 5px;
            padding: 10px;
        }

        #estado {
            margin: 10px 0;
        }
    </style>
</head>

<body>
    <h1>Grabación con Detección de Voz</h1>
    <button id="startBtn">Iniciar Grabación</button>
    <button id="stopBtn">Detener Grabación</button>
    <p id="estado">Estado: Esperando...</p>
    <audio id="audioReproduccion" controls></audio>
    <br>
    <textarea id="base64Output" rows="6" cols="50" placeholder="Audio en Base64"></textarea>

    <script>
        let mediaRecorder;
        let audioChunks = [];
        let audioContext;
        let analyser;
        let microphone;
        let recordingStartTime;
        let voiceDetected = false;
        let voiceStartTime;
        let voiceEndTime;
        let silenceStartTime;
        let analysisInterval;
        let mediaStream;

        const SILENCE_THRESHOLD = 5;
        const SILENCE_DURATION = 1.5

        document.getElementById('startBtn').onclick = startRecording;
        document.getElementById('stopBtn').onclick = stopRecording;

        function updateStatus(message) {
            document.getElementById('estado').textContent = `Estado: ${message}`;
        }

        async function startRecording() {
            audioChunks = [];
            voiceDetected = false;
            voiceStartTime = null;
            voiceEndTime = null;
            silenceStartTime = null;
            recordingStartTime = Date.now();
            updateStatus('Grabando...');

            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    audio: true
                });
                audioContext = new AudioContext();
                microphone = audioContext.createMediaStreamSource(mediaStream);
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 2048;
                microphone.connect(analyser);

                analysisInterval = setInterval(analyzeAudio, 100);

                mediaRecorder = new MediaRecorder(mediaStream);
                mediaRecorder.ondataavailable = e => {
                    if (e.data.size > 0) audioChunks.push(e.data);
                };
                mediaRecorder.onstop = processRecording;
                mediaRecorder.start();
            } catch (error) {
                updateStatus(`Error: ${error.message}`);
            }
        }

        function analyzeAudio() {
            const bufferLength = analyser.fftSize;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteTimeDomainData(dataArray);

            const rms = calculateRMS(dataArray);
            const currentTime = (Date.now() - recordingStartTime) / 1000;

            if (rms > SILENCE_THRESHOLD) {
                silenceStartTime = null;
                if (!voiceDetected) {
                    voiceDetected = true;
                    voiceStartTime = currentTime;
                }
            } else {
                if (voiceDetected) {
                    if (!silenceStartTime) {
                        silenceStartTime = Date.now();
                    } else {
                        const silenceDuration = (Date.now() - silenceStartTime) / 1000;
                        if (silenceDuration > SILENCE_DURATION && !voiceEndTime) {
                            voiceEndTime = currentTime;
                            stopRecording();
                        }
                    }
                }
            }
        }

        function calculateRMS(dataArray) {
            const sum = dataArray.reduce((acc, val) => {
                const sample = val - 128;
                return acc + (sample * sample);
            }, 0);
            return Math.sqrt(sum / dataArray.length);
        }

        function stopRecording() {
            if (mediaRecorder?.state === 'recording') {
                clearInterval(analysisInterval);
                if (voiceDetected && !voiceEndTime) {
                    voiceEndTime = (Date.now() - recordingStartTime) / 1000;
                }
                mediaRecorder.stop();
                cleanupResources();
            }
        }

        function cleanupResources() {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => {
                    track.stop();
                });
                mediaStream = null;
            }

            if (audioContext) {
                audioContext.close();
                audioContext = null;
            }

            if (analysisInterval) {
                clearInterval(analysisInterval);
                analysisInterval = null;
            }

            analyser = null;
            microphone = null;
            mediaRecorder = null;
        }

        async function processRecording() {
            updateStatus('Procesando audio...');

            if (voiceStartTime && voiceEndTime) {
                const audioBlob = new Blob(audioChunks, {
                    type: 'audio/webm'
                });
                try {
                    const formData = new FormData();
                    formData.append('FFmpeg', '');
                    formData.append('audio', audioBlob, 'recording.webm');
                    formData.append('start', voiceStartTime - 0.20);
                    formData.append('end', voiceEndTime - 1.2);

                    const response = await fetch('api/code-edit.php', {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();
                    playBase64Audio(result.audioBase64)

                    if (result.success) {
                        document.getElementById('base64Output').value = result.audioBase64;
                        document.getElementById('audioReproduccion').src = result.audioUrl;
                        updateStatus(`Grabación finalizada. Voz detectada: ${voiceStartTime.toFixed(2)}s - ${voiceEndTime.toFixed(2)}s`);
                    } else {
                        updateStatus('Error al procesar el audio');
                    }

                    const take_task = await fetch('http://localhost:8080/take_task', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            prompt: result.audioBase64
                        })
                    })
                    
                    const take_task_response = await take_task.json()
                    take_task(take_task_response.response)

                } catch (error) {
                    updateStatus('Error al procesar el audio');
                }
            } else {
                updateStatus('No se detectó voz');
            }

            cleanupResources();
        }

        function take_task(task) {

            switch (task) {
                case "next":

                    break;

                default:
                    break;
            }

        }

        function playBase64Audio(base64Audio) {
            try {
                // Eliminar el encabezado del data URL si existe
                const base64Data = base64Audio.replace(/^data:audio\/\w+;base64,/, "");

                // Crear un Blob desde el base64
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);

                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                const audioBlob = new Blob([byteArray], {
                    type: 'audio/wav'
                });

                // Crear URL del blob
                const audioUrl = URL.createObjectURL(audioBlob);

                // Crear elemento de audio y reproducirlo
                const audio = new Audio(audioUrl);

                audio.onloadedmetadata = () => {
                    console.log('Duración del audio:', audio.duration, 'segundos');
                };

                audio.onerror = (error) => {
                    console.error('Error al cargar el audio:', error);
                };

                // Reproducir el audio
                audio.play()
                    .then(() => console.log('Reproducción iniciada'))
                    .catch(error => console.error('Error en la reproducción:', error));

                // Limpiar URL cuando el audio termine
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    console.log('Reproducción finalizada');
                };

                return audio; // Retornar el elemento de audio por si necesitas controlarlo después
            } catch (error) {
                console.error('Error al procesar el audio base64:', error);
                throw error;
            }
        }
    </script>
</body>

</html>
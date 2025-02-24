var filters = { "client": "", "total": { "method": "", "input": "" }, "date": { "start": "", "end": "" }, "status": "", "price": { "method": "", "input": "" } };


let dictAIClass;
var dictAI = false;

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
let voicePeakCount = 0;
let lastVoiceTime;
let ws = null;
let uuidConversation = null;

// Add audio feedback variables
const processingSound = new Audio('resc/audio/sound_listen.mp3'); // Ajusta la ruta según tu estructura
const errorSound = new Audio('resc/audio/sound_error.mp3'); // Ajusta la ruta según tu estructura

const REQUIRED_PEAK_COUNT = 5;
const SILENCE_THRESHOLD = 32;
const MIN_SILENCE_THRESHOLD = 24.5;

const SILENCE_DURATION = 2;

function updateTable() {
    const scrollOld = $('#ListRetained table tbody').scrollTop();
    $.ajax({
        type: "POST",
        url: "api/code-obtain.php",
        data: "Accounting&Retained&List&filters=" + JSON.stringify(filters),
        cache: false,
        success: function (data) {
            $(document).find("#ListRetained table tbody").html(data);
            $(document).find("#qinput").trigger('keyup');
            $('#ListRetained table tbody').scrollTop(scrollOld);
        }
    });
}

function loadFilter() {
    const doc = $(document);
    doc.find('#filter-client').val(filters.client);
    doc.find('#filter-status').val(filters.status);
    doc.find(`input[name="filter-total-lessThan-greaterThan"][value="${filters.total.method}"]`).prop('checked', true);
    doc.find('#filter-total').val(filters.total.input);
    doc.find('#filter-date-start').val(filters.date.start);
    doc.find('#filter-date-end').val(filters.date.end);
    doc.find(`input[name="filter-price-lessThan-greaterThan"][value="${filters.price.method}"]`).prop('checked', true);
    doc.find('#filter-price').val(filters.price.input);
}


class DictAI {
    constructor(itemsList) {
        this.items = JSON.parse(itemsList);
        this.items = Object.values(this.items).map(item => {
            const total = Object.entries(item.packs).reduce((sum, [size, quantity]) => {
                return sum + (parseInt(size) * parseInt(quantity));
            }, 0);

            const formattedPacks = Object.entries(item.packs).map(([key, value]) => {
                return `${value} Paquetes de ${key}`;
            });

            return {
                code: item.code,
                total: total,
                packs: formattedPacks
            };
        });
        this.items.sort((a, b) => a.code.localeCompare(b.code));

        this.check = [];
        this.current = 0;

        // Inicializa el selector en el primer ítem (si existe)
        this.updateSelector();
    }

    // Función para actualizar el selector (efecto de "highlight")
    updateSelector() {
        // Quitar el efecto de todas las filas
        document.querySelectorAll('tr.highlighted').forEach(tr => tr.classList.remove('highlighted'));
        // Agregar el efecto a la fila actual, si existe
        if (this.current < this.items.length) {
            const currentCode = this.items[this.current].code;
            const tr = document.getElementById('cont' + currentCode);
            if (tr) {
                tr.classList.add('highlighted');
            }
        }
    }

    async next() {
        if (this.current >= this.items.length) {
            let message = "Ya no hay más ítems para revisar.";
            if (this.items.length !== this.check.length) {
                message += ` Faltan ${this.items.length - this.check.length} ítems por confirmar.`;
            }
            await ttsClass.hablarAsync([{ role: "speak", content: message }]);
            return;
        }
        this.current++;
        // Actualizamos el selector para quitar el efecto del ítem anterior
        this.updateSelector();

        let nextItem = this.items[this.current];
        await ttsClass.hablarAsync([
            { role: "speak", content: `Siguiente ítem: ${nextItem.code}` },
            { role: "speak", content: `Total de piezas: ${nextItem.total}` },
            { role: "speak", content: `Contiene: ${nextItem.packs.join(", ")}` }
        ]);
        // Actualizamos el selector para el nuevo ítem
        this.updateSelector();
    }

    async back() {
        if (this.current <= 0) {
            let message = "Ya estás en el primer ítem.";
            if (this.items.length !== this.check.length) {
                message += ` Faltan ${this.items.length - this.check.length} ítems por confirmar.`;
            }
            await ttsClass.hablarAsync([{ role: "speak", content: message }]);
            return;
        }
        this.current--;
        // Actualizamos el selector para el ítem anterior
        this.updateSelector();
        let prevItem = this.items[this.current];
        await ttsClass.hablarAsync([
            { role: "speak", content: `Ítem anterior: ${prevItem.code}` },
            { role: "speak", content: `Total de piezas: ${prevItem.total}` },
            { role: "speak", content: `Contiene: ${prevItem.packs.join(", ")}` }
        ]);
    }

    async repeat() {
        let currentItem = this.items[this.current];
        await ttsClass.hablarAsync([
            { role: "speak", content: `Repitiendo: ${currentItem.code}` },
            { role: "speak", content: `Total de piezas: ${currentItem.total}` },
            { role: "speak", content: `Contiene: ${currentItem.packs.join(", ")}` }
        ]);
    }

    async content() {
        let currentItem = this.items[this.current];
        await ttsClass.hablarAsync([
            { role: "speak", content: `Contenido del ítem ${currentItem.code}:` },
            { role: "speak", content: currentItem.packs.join(", ") }
        ]);
    }

    async ready() {
        if (this.current >= this.items.length) {
            await ttsClass.hablarAsync([{ role: "speak", content: "No hay ítem para confirmar." }]);
            return;
        }

        let currentItem = this.items[this.current];
        if (this.check.includes(this.current)) {
            await ttsClass.hablarAsync([{ role: "speak", content: `El ítem ${currentItem.code} ya está confirmado.` }]);
            return;
        }

        this.check.push(this.current);
        // Agregar la clase 'ready' para marcar visualmente el ítem confirmado (verde)
        const tr = document.getElementById('cont' + currentItem.code);
        if (tr) {
            tr.classList.add('ready');
        }
        await ttsClass.hablarAsync([{ role: "speak", content: `Ítem ${currentItem.code} confirmado.` }]);
        await this.next()
    }

    async remove() {
        if (this.current >= this.items.length) {
            await ttsClass.hablarAsync([{ role: "speak", content: "No hay ítem para desconfirmar." }]);
            return;
        }

        let currentItem = this.items[this.current];
        if (!this.check.includes(this.current)) {
            await ttsClass.hablarAsync([{ role: "speak", content: `El ítem ${currentItem.code} no está confirmado.` }]);
            return;
        }

        this.check.splice(this.check.indexOf(this.current), 1);
        // Quitar la clase 'ready' para volver al estilo normal
        const tr = document.getElementById('cont' + currentItem.code);
        if (tr) {
            tr.classList.remove('ready');
        }
        await ttsClass.hablarAsync([{ role: "speak", content: `Ítem ${currentItem.code} desconfirmado.` }]);
    }

    async status() {
        let message;
        if (this.items.length === this.check.length) {
            message = "Todos los ítems han sido confirmados.";
        } else {
            message = `Faltan ${this.items.length - this.check.length} ítems por confirmar.`;
        }
        ttsClass.hablarAsync([{ role: "speak", content: message }]);
    }
}


$(document).ready(function () {
    const waitForTransition = (el, duration) => new Promise(resolve => {
        let done = false;
        const end = (e) => { if (e && e.target !== el) return; if (!done) { done = true; el.removeEventListener('transitionend', end); resolve(); } };
        el.addEventListener('transitionend', end);
        setTimeout(() => { if (!done) { done = true; el.removeEventListener('transitionend', end); resolve(); } }, duration + 100);
    });
    async function transicionAnimacion(el, animName, dur, targetOpac) {
        // Extraer scale actual
        const style = window.getComputedStyle(el);
        let currentScale = 1;
        const t = style.transform;
        if (t && t !== 'none') {
            const m = t.match(/scale\(([^)]+)\)/);
            if (m) currentScale = parseFloat(m[1]);
            else if (t.startsWith('matrix')) {
                const vals = t.slice(7, -1).split(', ');
                const a = parseFloat(vals[0]), b = parseFloat(vals[1]);
                currentScale = Math.sqrt(a * a + b * b);
            }
        }
        // Salida: reducir opacidad y escala
        el.style.transition = 'opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)';
        el.style.opacity = '0';
        el.style.transform = `translate(-50%, -50%) scale(${currentScale * 0.9})`;
        await waitForTransition(el, 500);
        // Reiniciar animaciones y aplicar la nueva
        el.style.transition = 'none';
        el.style.animation = 'none';
        void el.offsetWidth; // Forzar reflow
        el.style.transition = 'opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)';
        el.style.animation = `${animName} ${dur}s infinite`;
        el.style.opacity = targetOpac;
        el.style.transform = `translate(-50%, -50%) scale(${currentScale})`;
        await waitForTransition(el, 500);
        // Restaura transición por defecto (opcional)
        el.style.transition = 'all 1s ease';
    }
    async function animacionHeartbeat(el) {
        removeSmallCircles();
        await transicionAnimacion(el, 'heartbeat', 1, '0.8');
    }
    async function animacionPulse(el) {
        removeSmallCircles();
        await transicionAnimacion(el, 'pulse', 2, '1');
    }
    function removeSmallCircles() {
        document.querySelectorAll('.smallCircle').forEach(c => c.remove());
    }
    async function animacionCirculos() {
        const mainCircle = document.getElementById('mainCircle');
        let container = document.getElementById('animationContainer');


        // Animar el círculo grande
        mainCircle.style.transform = 'translate(-50%, -50%) scale(0.6)';
        await waitForTransition(mainCircle, 1000);

        // Eliminar círculos pequeños previos de forma segura
        const smallCircles = container.querySelectorAll('.smallCircle');
        smallCircles.forEach(c => c.remove());

        // Obtener dimensiones del contenedor
        const containerRect = container.getBoundingClientRect();

        // Calcular el centro
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;

        // Radio para los círculos pequeños
        const radio = 70;

        // Crear 6 círculos pequeños
        for (let i = 0; i < 6; i++) {
            const angle = i * 60 * (Math.PI / 180);
            const small = document.createElement('div');
            small.className = 'smallCircle';

            // Calcular posiciones
            const finalX = centerX + radio * Math.cos(angle);
            const finalY = centerY + radio * Math.sin(angle);

            // Posición inicial en el centro
            small.style.left = centerX + 'px';
            small.style.top = centerY + 'px';
            container.appendChild(small);

            // Animar a posición final
            setTimeout(() => {
                small.style.transform = 'translate(-50%, -50%) scale(1)';
                small.style.opacity = '1';
                small.style.left = finalX + 'px';
                small.style.top = finalY + 'px';
            }, 200);

            // Iniciar ciclo de animación
            animateHideShow(small, centerX, centerY, finalX, finalY);
        }
    }
    function animateHideShow(el, cx, cy, fx, fy) {
        const delay = Math.random() * 500 + 1000;
        setTimeout(() => {
            el.style.left = cx + 'px';
            el.style.top = cy + 'px';
            el.style.transform = 'translate(-50%, -50%) scale(0)';
            el.style.opacity = '0';

            setTimeout(() => {
                el.style.left = fx + 'px';
                el.style.top = fy + 'px';
                el.style.transform = 'translate(-50%, -50%) scale(1)';
                el.style.opacity = '1';
                animateHideShow(el, cx, cy, fx, fy);
            }, 500);
        }, delay);
    }

    function stopAllAnimations() {
        removeSmallCircles();
        const mainCircle = document.getElementById('mainCircle');
        if (mainCircle) {
            mainCircle.style.transition = 'none';
            mainCircle.style.animation = 'none';
            mainCircle.style.opacity = '1';
            mainCircle.style.transform = 'translate(-50%, -50%) scale(1)';
        }
        const container = document.getElementById('animationContainer');
        if (container) {
            const smallCircles = container.querySelectorAll('.smallCircle');
            smallCircles.forEach(c => c.remove());
        }
    }


    $(document).on('change', 'select#statusChange', function () {
        var modalFooter = $('.modal-footer');
        var modalBody = $('.modal-body');
        var retainedChangeStatusBtn = modalFooter.find('button#retainedChangeStatus');
        var retainedEditBtn = modalFooter.find('button#retainedEdit');
        var alertBox = modalBody.find('#alert');
        var commentBox = modalBody.find('#coment');

        // Reset initial state
        retainedChangeStatusBtn.text('Guardar').removeAttr('hidden');
        retainedEditBtn.attr('hidden', true);
        commentBox.removeAttr('hidden');
        alertBox.attr('hidden', true);

        if (this.value == '4') {
            alertBox.text('¡OJO! Este Pedido se va a eliminar y los productos se regresarán a sus depósitos correspondientes')
                .attr('class', 'alert alert-warning')
                .removeAttr('hidden');
            retainedChangeStatusBtn.text('Anular').removeAttr('hidden');
        } else if (this.value == 'edit') {
            alertBox.text('¡OJO! Usted podrá modificar, eliminar y agregar. Los productos eliminados o modificados se restablecerán en sus depósitos correspondientes')
                .attr('class', 'alert alert-info')
                .removeAttr('hidden');
            commentBox.attr('hidden', true);
            retainedChangeStatusBtn.attr('hidden', true);
            retainedEditBtn.removeAttr('hidden');
        }
    });
    $(document).on('click', '#retainedEdit', function () {
        var id = $(this).attr('data');
        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: "Accounting&Retained&Buy&uuid=" + id,
            cache: false,
            success: function (data) {
                var json = JSON.parse(data);
                if (json[0] != true) {
                    Swal.fire({
                        title: "!Ups. Algo Salio Mal",
                        text: json[1],
                        icon: "error"
                    });
                    return;
                }
                const Session = new $_SESSION("listSold");
                Session.val = { "client": JSON.parse(json[1]['info']), "items": JSON.parse(json[1]['buy']) };
                Session.Save();
                const Mode = new $_SESSION("modePoint");
                Mode.val = { "mode": "Retained", "uuid": id };
                Mode.Save();
                document.location = "index.php?Accounting&Point";
            }
        });
    });
    $(document).on('click', '#retainedChangeStatus', function () {
        var id = $(this).attr('data');
        if ($('#statusChange option:selected').val() == 4) {
            Swal.fire({
                title: "Quieres Anular Este Pedido",
                showCancelButton: true,
                confirmButtonText: "Si",
                cancelButtonText: `No`,
                icon: "warning",
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        type: "POST",
                        url: "api/code-edit.php",
                        data: "Point&retainedChange&Null&coment=" + $('textarea#coment').val() + "&status=" + $('#statusChange option:selected').val() + "&uuid=" + id,
                        cache: false,
                        success: function (response) {
                            var json = JSON.parse(response);
                            if (json.success) {
                                updateTable();
                                Swal.fire({
                                    title: "Operacion Exitosa",
                                    text: "Su Pedido Ha Sido Anulado",
                                    icon: "success"
                                });
                                return;
                            }
                            Swal.fire({
                                title: "!Ups. Algo Salio Mal",
                                text: json.message,
                                icon: "error"
                            });

                        }
                    });
                }
            });
        } else {
            Swal.fire({
                title: "Quieres Cambiar El Estado",
                showCancelButton: true,
                confirmButtonText: "Si",
                cancelButtonText: `No`,
                icon: "warning",
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        type: "POST",
                        url: "api/code-edit.php",
                        data: "Point&retainedChange&coment=" + $('textarea#coment').val() + "&status=" + $('#statusChange option:selected').val() + "&uuid=" + id,
                        cache: false,
                        success: function (response) {
                            var json = JSON.parse(response);
                            if (json.success) {
                                updateTable();
                                Swal.fire({
                                    title: "Operacion Exitosa",
                                    text: "El Estado Ha Sido Cambiado",
                                    icon: "success"
                                });
                                return;
                            }
                            Swal.fire({
                                title: "!Ups. Algo Salio Mal",
                                text: json.message,
                                icon: "error"
                            });
                        }
                    });
                }
            });
        }
    });

    $(document).on('click', '#ListAI', function () {
        var qrValue = $(this).attr('data');

        // Generate a QR Code in a temporary div
        var tempDiv = document.createElement("div");
        var qr = new QRCode(tempDiv, {
            text: qrValue,
            width: 256,
            height: 256,
        });

        // Use setTimeout to ensure the QR code is generated before attempting to display it
        setTimeout(function () {
            // Display the QR code inside a SweetAlert2 modal
            Swal.fire({
                title: "Código QR",
                text: "Aquí está tu código QR:",
                html: tempDiv, // Use the generated QR code's container
                width: 300,
                heightAuto: true,
                showCloseButton: true,
                confirmButtonText: "Cerrar"
            });
        }, 500); // Delay for 500 milliseconds to ensure the QR code is ready
    });

    $(document).on('click', "#retainedReport", function () {
        const vars = $(this)
        $.ajax({
            beforeSend: function () {
                Swal.fire({
                    html: new sweet_loader().loader("Procesando"),
                    showDenyButton: false,
                    showCancelButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false
                });
            },
            type: "POST",
            url: urlAPI + "document/view/pdf/fnz",
            data: JSON.stringify({
                "type": "pend",
                "uuid": vars.attr("data"),
                "update": true
            }),
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            contentType: "application/json",
            cache: false,
            success: function (data) {
                Swal.close();
                var result = JSON.parse(data);
                var binaryString = atob(result["response"]);

                var len = binaryString.length;
                var bytes = new Uint8Array(len);
                for (var i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                var blob = new Blob([bytes], { type: 'application/pdf' });
                var url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    title: "Operación Errada",
                    html: error,
                    icon: "error"
                });
            }
        });

    });

    function updateStatus(message) {
        $(document).find("#statusAI").text(`${message}`);
    }

    function stopProcess() {
        dictAI = false;
        stopRecording();
        stopAllAnimations();
        cleanupResources();
    }

    async function startRecording() {
        const mainCircle = $(document).find('#mainCircle')[0];
        audioChunks = [];
        voiceDetected = false;
        voiceStartTime = null;
        lastVoiceTime = Date.now();

        voiceEndTime = null;
        silenceStartTime = null;
        recordingStartTime = Date.now();
        try {
            await animacionPulse(mainCircle);
            updateStatus('Esperando');
            mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            audioContext = new AudioContext();
            microphone = audioContext.createMediaStreamSource(mediaStream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            microphone.connect(analyser);

            analysisInterval = setInterval(analyzeAudio, 50);

            mediaRecorder = new MediaRecorder(mediaStream);
            mediaRecorder.ondataavailable = e => {
                if(!voiceDetected && audioChunks.length > 200){
                    const elementsToRemove = Math.min(100, audioChunks.length);
                    audioChunks.splice(0, elementsToRemove);
                }
                if (e.data.size > 0) audioChunks.push(e.data);
            };
            mediaRecorder.onstop = async () => {
                if (!dictAI) {
                    return
                }
                processRecording();
                updateStatus('Procensado');
                await animacionPulse(mainCircle);
                await animacionCirculos();
            };
            mediaRecorder.start();
        } catch (error) {
            updateStatus(`Error`);
            stopProcess()
        }
    }

    function analyzeAudio() {
        if (!voiceDetected) {
            audioChunks = []
        }


        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        const rms = calculateRMS(dataArray);
        const mainCircle = $('#mainCircle')[0];

        if (rms > SILENCE_THRESHOLD) {
            // Se detecta audio por encima del umbral
            silenceStartTime = null;
            lastVoiceTime = Date.now();

            if (!voiceDetected) {
                // Primera detección: se marca el inicio exacto y se inicia el conteo de picos
                voiceDetected = true;
                voiceStartTime = Math.max(0, ((Date.now() - recordingStartTime) / 1000) - 1.2)  // Inicio exacto
                voicePeakCount = 1;            // Iniciamos el conteo de picos

                updateStatus('Escuchando');
                animacionHeartbeat(mainCircle);
            } else {
                // Si ya se estaba detectando, se cuentan picos solo si el nivel supera un umbral más alto
                if (rms > MIN_SILENCE_THRESHOLD) {
                    voicePeakCount++;
                }
            }
        } else {
            // Cuando el audio cae por debajo del umbral (posible silencio)
            if (voiceDetected) {
                if (!silenceStartTime) {
                    silenceStartTime = Date.now();
                } else {
                    const silenceDuration = (Date.now() - silenceStartTime) / 1000;
                    if (silenceDuration > SILENCE_DURATION && !voiceEndTime) {
                        if (voicePeakCount >= REQUIRED_PEAK_COUNT) {
                            // Se han detectado suficientes picos: finalizamos la grabación
                            voiceEndTime = (Date.now() - recordingStartTime) / 1000;
                            stopRecording();
                        } else {
                            // No se han acumulado los picos requeridos: reiniciamos el estado
                            updateStatus('Esperando');
                            animacionPulse(mainCircle);

                            // Reiniciamos las variables de detección
                            voiceDetected = false;
                            voicePeakCount = 0;
                            voiceStartTime = null;
                            silenceStartTime = null;
                        }
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
            updateStatus('...');
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
    // Función para reproducir el audio base64
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
            const audioBlob = new Blob([byteArray], { type: 'audio/wav' });

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

    async function processRecording() {
        if (!dictAI) {
            return
        }
        cleanupResources();

        console.log(voiceStartTime, voiceEndTime)

        if (voiceStartTime && voiceEndTime) {
            // Play processing sound
            processingSound.play().catch(err => console.log('Error playing sound:', err));
            
            try {
                const audioBlob = new Blob(audioChunks, {
                    type: 'audio/webm'
                });
    
                // Convert blob to base64
                const reader = new FileReader();
                const base64Promise = new Promise((resolve, reject) => {
                    reader.onloadend = () => {
                        // Extract the base64 data from the result
                        const base64Data = reader.result.split(',')[1];
                        resolve(base64Data);
                    };
                    reader.onerror = reject;
                });
    
                reader.readAsDataURL(audioBlob);
                const base64Audio = await base64Promise;
    
                updateStatus('Pensando');
                // Send message through WebSocket
                ws.send(JSON.stringify({
                    type: 'take_task',
                    id: uuidConversation,
                    prompt: base64Audio
                }));

                // Listen for WebSocket response
                ws.onmessage = async (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'take_task.response') {
                        updateStatus('Hablando');
                        switch (data.response) {
                            case "next":
                                await dictAIClass.next()
                                break;

                            case "back":
                                await dictAIClass.back()
                                break;

                            case "repeat":
                                await dictAIClass.repeat()
                                break;

                            case "content":
                                await dictAIClass.content()
                                break;

                            case "ready":
                                await dictAIClass.ready()
                                break;

                            case "remove":
                                await dictAIClass.remove()
                                break;

                            case "status":
                                await dictAIClass.status()
                                break;

                            case "none":
                            default:
                                await processingSound.play().catch(err => console.log('Error playing sound:', err));
                                setTimeout(async () => {
                                    await processingSound.play().catch(err => console.log('Error playing sound:', err));
                                }, 500);

                                break;
                        }

                        $(document).find("#readyItems").text(`Listos ${dictAIClass.check.length}`)
                        $(document).find("#missingItems").text(`Faltan ${dictAIClass.items.length - dictAIClass.check.length}`)

                        stopAllAnimations()
                        startRecording()
                    } else if (data.type === 'error') {
                        // Play error sound
                        errorSound.play().catch(err => console.log('Error playing sound:', err));
                        
                        updateStatus('Error');
                        $(document).find("#btnDictAI").trigger("click");
                        stopAllAnimations();
                        stopRecording();
                    }
                };

            } catch (error) {
                // Play error sound
                errorSound.play().catch(err => console.log('Error playing sound:', err));
                
                console.log(error)
                updateStatus('Error');
                $(document).find("#btnDictAI").trigger("click");
                stopAllAnimations();
                stopRecording();
            }
        } else {
            // Play error sound
            errorSound.play().catch(err => console.log('Error playing sound:', err));
            
            updateStatus('...');
            $(document).find("#btnDictAI").trigger("click");
            stopAllAnimations();
            stopRecording();
        }
    }


    // Close WebSocket connection when clicking closeView
    $(document).on('click', '#closeView', function() {
        stopProcess();
        if (ws) {
            ws.close();
            ws = null;
        }
    });


    $(document).on('click', '#closeView', function () {
        ws = null;
        uuidConversation = null;
        stopProcess();
    });

    $(document).on('click', "#reportList", function () {
        const vars = $(this)
        $.ajax({
            beforeSend: function () {
                Swal.fire({
                    html: new sweet_loader().loader("Procesando"),
                    showDenyButton: false,
                    showCancelButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false
                });
            },
            type: "POST",
            url: urlAPI + "document/view/pdf/fnz",
            data: JSON.stringify({
                "type": "retained",
                "uuid": vars.attr("data"),
                "update": true
            }),
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            contentType: "application/json",
            cache: false,
            success: function (data) {
                Swal.close();
                console.log(data);
                var result = JSON.parse(data);
                var binaryString = atob(result["response"]);

                var len = binaryString.length;
                var bytes = new Uint8Array(len);
                for (var i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                var blob = new Blob([bytes], { type: 'application/pdf' });
                var url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    title: "Operación Errada",
                    html: error,
                    icon: "error"
                });
            }
        });

    });

    $(document).on('click', "#retainedReportInventory", function () {
        ws = new WebSocket(urlAPI_AI_WS);
        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };
        // Wait for the WebSocket connection to open before sending a message
        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: 'conversation.create',
                agent: 'normal'
            }));
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'conversation.create.response') {
                    uuidConversation = data.id;
                }
            };
        };
        new modalPinesJM().create("Reatined&ReportInv&uuid=" + $(this).attr("data"), 3);
    });
    //Filters

    $(document).on('click', '#btnDictAI', async function () {
        if (!dictAI) {
            //await dictAIClass.repeat()
            dictAI = true
            $(this).css({ 'opacity': '0' })
                .hover(
                    () => {
                        $(this).css({ 'opacity': '1' });
                    },
                    () => {
                        $(this).css({ 'opacity': '0' });
                    }
                );
            setTimeout(() => {
                $(this).text("Detener");
            }, 300);
            startRecording()

        } else {
            stopProcess()
            updateStatus("...")
            $(this).css({ 'opacity': '1' })
                .off('mouseenter mouseleave')
                .text("Iniciar");
        }
        console.log(dictAI)

    });


    $(document).on('click', '#saveFilters', function () {
        const doc = $(document);
        filters.client = doc.find('#filter-client option:selected').val();
        filters.status = doc.find('#filter-status option:selected').val();
        filters.date.start = doc.find('#filter-date-start').val();
        filters.date.end = doc.find('#filter-date-end').val();

        const totalInput = doc.find('#filter-total').val();
        const totalMethod = doc.find('input[name="filter-total-lessThan-greaterThan"]:checked');
        if (totalInput === '') {
            totalMethod.prop('checked', false);
            filters.total.method = '';
            filters.total.input = '';
        } else if (totalMethod.length) {
            filters.total.method = totalMethod.val();
            filters.total.input = totalInput;
        }

        const priceInput = doc.find('#filter-price').val();
        const priceMethod = doc.find('input[name="filter-price-lessThan-greaterThan"]:checked');
        if (priceInput === '') {
            priceMethod.prop('checked', false);
            filters.price.method = '';
            filters.price.input = '';
        } else if (priceMethod.length) {
            filters.price.method = priceMethod.val();
            filters.price.input = priceInput;
        }

        updateTable()
    });

    $(document).on('click', '#resetFilters', function () {
        filters = { "client": "", "total": { "method": "", "input": "" }, "date": { "start": "", "end": "" }, "status": "", "price": { "method": "", "input": "" } };
    });
});
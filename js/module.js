const httpErrorCodes = {
    100: 'Continue',
    101: 'Switching Protocols',
    102: 'Processing',
    103: 'Early Hints',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    207: 'Multi-Status',
    208: 'Already Reported',
    226: 'IM Used',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    // add more error codes here as needed
};
const meses = {
    "Ene": "Enero",
    "Feb": "Febrero",
    "Mar": "Marzo",
    "Abr": "Abril",
    "May": "Mayo",
    "Jun": "Junio",
    "Jul": "Julio",
    "Ago": "Agosto",
    "Sept": "Septiembre",
    "Oct": "Octubre",
    "Nov": "Noviembre",
    "Dic": "Diciembre",
};
const updateTime = 30
const updateShort = 15
const updateSLong = 60
const DepositosAvaiable = 1

const urlAPI = "http://localhost/Api/"
const urlAPI_AI = "http://192.168.1.179:8080"
const urlAPI_AI_WS = "ws://192.168.1.179:8080"

const apiKey = "NS20gEo80zV6F3WoxFOR5UKgztqilJ63"


const verifyCheck = 15
const codeStatus = ["text-danger", "text-warning", "text-success"];


class messageTemp {
    constructor(title, body, option, subtitle = null) {
        $('#liveToast .toast-header strong').text(title);
        $('#liveToast .toast-body').html(body);
        if (subtitle != null && !$.isArray(subtitle)) {
            $('#liveToast .toast-header small').html(subtitle);
        } else if ($.isArray(subtitle)) {
            function diffInMinutes(date1, date2) {
                const diffInMilliseconds = date2 - date1;
                const diffInMinutes = diffInMilliseconds / (1000 * 60);
                return Math.abs(diffInMinutes);
            }
            // Usage example:
            const date1 = subtitle[0]
            const date2 = new Date();

            const minutesDifference = diffInMinutes(date1, date2);
            console.log(minutesDifference);
            $('#liveToast .toast-header small').text(minutesDifference + " " + subtitle[1]);
        }
        switch (option) {
            case 'success':
                $('#liveToast .toast-header i').attr('class', 'bi bi-check-square-fill text-success');
                break;
            case 'error':
                $('#liveToast .toast-header i').attr('class', 'bi bi-x-circle-fill text-danger');
                break;
            case 'info':
                $('#liveToast .toast-header i').attr('class', 'bi bi-exclamation-circle-fill text-info');
                break;
            case 'question':
                $('#liveToast .toast-header i').attr('class', 'bi bi-question-circle-fill text-warning');
                break;
            case 'warning':
                $('#liveToast .toast-header i').attr('class', 'bi bi-exclamation-triangle-fill text-warning');
                break;
        }
        $('.toast').toast('show');


    }
}

class modalPinesJM {
    create(data, size = 1,) {
        const func = this;
        const sizes = ['modal-dialog modal-sm', 'modal-dialog', 'modal-dialog modal-lg', 'modal-dialog modal-xl', 'modal-dialog modal-fullscreen']
        $.ajax({
            type: "POST",
            url: "api/code-modal.php",
            data: data,
            cache: false,
            success: function (response) {
                if (response == 'close') {
                    func.close();
                    return;
                }
                $('.modal-content').html(response);
                $("#modal").modal("show");
                $("#modal #modalSize").attr('class', sizes[size]);
            }
        });
    }
    close() {
        $('.modal-content').html('');
        $("#modal").modal("hide");
    }
}

class sweet_loader {
    constructor() {
        this.sweet_loader = '<div class="spinner-border text-primary m-3" style="width: 7rem; height: 7rem;" role="status"><span class="visually-hidden">Loading...</span></div>';
    }
    loaderOnly() {
        return this.sweet_loader;
    }
    loader(title) {
        return `<div class="flex-column h-100 w-100 d-flex justify-content-center align-items-center">${this.sweet_loader}<h5 style="color:var(--secondary_text_color)">${title}<h5></div>`
    }
}

class TTS {
    constructor() {
        this.voicesLoaded = false;
        this.voices = [];
        this.speaking = false;
        this.conversationIndex = 0;
        this.conversation = [];
        this.resolveHablarPromise = null; // Nueva propiedad para la promesa

        window.speechSynthesis.onvoiceschanged = () => {
            this.voices = window.speechSynthesis.getVoices();
            console.log(this.voices);
            this.voicesLoaded = true;
        };
    }

    // Método existente (sin cambios)
    hablar(conversation) {
        if (this.speaking) {
            this.detener();
        }
        this.speaking = true;
        this.conversation = conversation;
        this.conversationIndex = 0;

        const interval = setInterval(() => {
            if (this.voicesLoaded) {
                clearInterval(interval);
                this.speakNext();
            }
        }, 100);
    }

    // Nuevo método async
    hablarAsync(conversation) {
        return new Promise((resolve) => {
            if (this.speaking) {
                this.detener();
            }
            this.speaking = true;
            this.conversation = conversation;
            this.conversationIndex = 0;
            this.resolveHablarPromise = resolve; // Guardar resolve

            const interval = setInterval(() => {
                if (this.voicesLoaded) {
                    clearInterval(interval);
                    this.speakNext();
                }
            }, 100);
        });
    }

    detener() {
        this.speaking = false;
        window.speechSynthesis.cancel();
        if (this.resolveHablarPromise) {
            this.resolveHablarPromise(); // Resolver si se detiene manualmente
            this.resolveHablarPromise = null;
        }
    }

    speakNext() {
        if (!this.speaking) {
            return;
        }
        if (this.conversationIndex < this.conversation.length) {
            const item = this.conversation[this.conversationIndex];

            if (item.role === 'speak') {
                const msg = new SpeechSynthesisUtterance(item.content);
                const selectedVoice = this.voices[7] || window.speechSynthesis.getVoices()[0];
                msg.voice = selectedVoice;
                msg.rate = 1.1;
                msg.pitch = 0.85;
            
                msg.onend = () => {
                    this.conversationIndex++;
                    this.speakNext();
                };
            
                // Manejador de errores para avanzar en caso de fallo
                msg.onerror = () => {
                    console.error('Error al reproducir:', item.content);
                    this.conversationIndex++;
                    this.speakNext();
                };
            
                window.speechSynthesis.speak(msg);
            }
             else if (item.role === 'sleep') {
                setTimeout(() => {
                    this.conversationIndex++;
                    this.speakNext();
                }, item.content * 1000);
            }
        } else {
            this.speaking = false;
            if (this.resolveHablarPromise) {
                this.resolveHablarPromise(); // Resolver la promesa al finalizar
                this.resolveHablarPromise = null;
            }
        }
    }
}
function numberFormat(num) {
    if (num >= 1e12) {
        return (num / 1e12).toFixed(1) + 'T';
    } else if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + 'k';
    } else {
        return num.toString();
    }
}


function numberInput(i) {
    i.value = i.value.replace(/[^0-9]/g, '').replace(/(\..*?)\..*/g, '$1');
}

function formatDate(dateString) {
    const date = new Date(dateString.replace(" ", "T")); // Parsear la fecha
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
    const formattedDate = date.toLocaleString('en-GB', options);
    return formattedDate.replace(',', '');
}


function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (error) {
        return false;
    }
}

function mergeObjectValues(a, b, operator = "+") {
    function convertToNumbers(obj) {
        const result = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                result[key] = Number(obj[key]);
            }
        }
        return result;
    }

    const numA = convertToNumbers(a);
    const numB = convertToNumbers(b);

    var mergedJson = { ...numA, ...numB };
    for (const key of Object.keys(mergedJson)) {
        if (numA[key] !== undefined && numB[key] !== undefined) {
            if (operator == "+") {
                mergedJson[key] = numA[key] + numB[key];
            } else if (operator == "-") {
                mergedJson[key] = numA[key] - numB[key];
            }
        }
    }
    return mergedJson;
}

function format_bytes(n_bytes) {
    if (n_bytes < 1024) return n_bytes + 'b';
    else if (n_bytes < 1024 * 1024) return (n_bytes / 1024).toFixed(1) + 'Kb';
    else if (n_bytes < 1024 * 1024 * 1024) return (n_bytes / (1024 * 1024)).toFixed(1) + 'Mb';
    else if (n_bytes < 1024 * 1024 * 1024 * 1024) return (n_bytes / (1024 * 1024 * 1024)).toFixed(1) + 'Gb';
    else return (n_bytes / (1024 * 1024 * 1024 * 1024)).toFixed(1) + 'Tb';
}

class $_SESSION {
    constructor(key) {
        this.key = key
        this.val = "";
        this.Get();
    }
    Get() {
        if (this.Exists()) {
            if (isValidJSON(sessionStorage.getItem(this.key))) {
                this.val = JSON.parse(sessionStorage.getItem(this.key));
            } else {
                this.val = sessionStorage.getItem(this.key);
            }
        }
    }
    Del() {
        sessionStorage.removeItem(this.key);
    }
    Exists() {
        return sessionStorage.getItem(this.key) !== null;
    }
    Save() {
        if (typeof this.val === "object") {
            sessionStorage.setItem(this.key, JSON.stringify(this.val));
            this.Get();
            return;
        }
        sessionStorage.setItem(this.key, this.val);
        this.Get();
    }
}

const ttsClass = new TTS();

$(document).ready(function () {
    $('.toast').on('show.bs.toast', function () {
        console.log('SHOW');
        $(this).parent().css('z-index', '1080');
    });
    $('.toast').on('hidden.bs.toast', function () {
        $(this).parent().css('z-index', '-1');
        console.log('HIDE');
    });
    /*
    $(".toggle-btn").click(function () {
        $("#sidebar").toggleClass("expand");
    });*/
    //Modal
    $(document).on('click', '#modalBtn', function () {
        var btn = $(this);
        new modalPinesJM().create(btn.attr('modal-data-locate'), btn.attr('modal-size'));
    });
    $(document).on('change', 'input[name="filter-dates"]', function () {
        const doc = $(document);
        let dateStart = new Date(doc.find('#filter-date-start').val());
        let dateEnd = new Date(doc.find('#filter-date-end').val());
        if (dateEnd < dateStart) {
            doc.find('#filter-date-end').val('');
            new messageTemp('Pines Jm', '!Ojo: La fecha final es invalida, por ser menor a la del comienzo', 'info');
        }
    });
});
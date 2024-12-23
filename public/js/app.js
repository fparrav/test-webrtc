// Inicialización de Socket.IO y WebRTC
const socket = io();
const webrtc = new WebRTCHandler(socket);
let isInCall = false;

const callButton = document.getElementById('callButton');

// Manejador del botón de llamada
callButton.addEventListener('click', async () => {
    if (!isInCall) {
        // Iniciar nueva llamada
        const success = await webrtc.startCall();
        if (success) {
            callButton.textContent = 'Finalizar Llamada';
            isInCall = true;
        }
    } else {
        // Finalizar llamada existente
        webrtc.endCall();
        socket.emit('end-call');
        callButton.textContent = 'Iniciar Llamada';
        isInCall = false;
    }
});

// Eventos de señalización WebRTC
socket.on('offer', async (offer) => {
    if (!isInCall) {
        const success = await webrtc.handleOffer(offer);
        if (success) {
            callButton.textContent = 'Finalizar Llamada';
            isInCall = true;
        }
    }
});

socket.on('answer', async (answer) => {
    await webrtc.handleAnswer(answer);
});

socket.on('ice-candidate', async (candidate) => {
    await webrtc.handleIceCandidate(candidate);
});

socket.on('end-call', () => {
    webrtc.endCall();
    callButton.textContent = 'Iniciar Llamada';
    isInCall = false;
});

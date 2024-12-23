/**
 * Clase que maneja toda la lógica de WebRTC
 * Se encarga de gestionar las conexiones peer-to-peer, streams de video/audio
 * y la señalización a través de Socket.IO
 */
class WebRTCHandler {
    constructor(socket) {
        this.socket = socket;
        this.peerConnection = null;
        this.localStream = null;
        // Configuración de servidores STUN para NAT traversal
        this.config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ]
        };
    }

    // Configura la conexión peer-to-peer y sus event listeners
    async setupPeerConnection() {
        this.peerConnection = new RTCPeerConnection(this.config);
        
        this.peerConnection.onicecandidate = event => {
            if (event.candidate) {
                this.socket.emit('ice-candidate', event.candidate);
            }
        };

        this.peerConnection.ontrack = event => {
            const remoteVideo = document.getElementById('remoteVideo');
            remoteVideo.srcObject = event.streams[0];
        };

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
        }
    }

    // Inicia una llamada: solicita permisos de media y crea una oferta
    async startCall() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            document.getElementById('localVideo').srcObject = this.localStream;
            await this.setupPeerConnection();
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            this.socket.emit('offer', offer);
            return true;
        } catch (error) {
            console.error('Error starting call:', error);
            return false;
        }
    }

    // Maneja una oferta recibida: configura el peer local y envía una respuesta
    async handleOffer(offer) {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            document.getElementById('localVideo').srcObject = this.localStream;
            await this.setupPeerConnection();
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            this.socket.emit('answer', answer);
            return true;
        } catch (error) {
            console.error('Error handling offer:', error);
            return false;
        }
    }

    // Procesa la respuesta recibida del peer remoto
    async handleAnswer(answer) {
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            return true;
        } catch (error) {
            console.error('Error handling answer:', error);
            return false;
        }
    }

    // Agrega candidatos ICE para establecer la mejor ruta de conexión
    async handleIceCandidate(candidate) {
        try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            return true;
        } catch (error) {
            console.error('Error handling ice candidate:', error);
            return false;
        }
    }

    // Limpia recursos y finaliza la llamada
    endCall() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        document.getElementById('localVideo').srcObject = null;
        document.getElementById('remoteVideo').srcObject = null;
    }
}

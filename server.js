/**
 * Servidor de señalización para WebRTC
 * Maneja la conexión inicial entre peers y retransmite
 * mensajes de señalización usando Socket.IO
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Configuración del servidor
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Manejo de conexiones Socket.IO
io.on('connection', (socket) => {
    console.log('Nueva conexión:', socket.id);

    // Retransmitir oferta a todos los demás peers
    socket.on('offer', (offer) => {
        socket.broadcast.emit('offer', offer);
    });

    // Retransmitir respuesta al peer inicial
    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer);
    });

    // Retransmitir candidatos ICE
    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.emit('ice-candidate', candidate);
    });

    // Manejar finalización de llamada
    socket.on('end-call', () => {
        socket.broadcast.emit('end-call');
    });

    // Limpiar cuando un peer se desconecta
    socket.on('disconnect', () => {
        socket.broadcast.emit('end-call');
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
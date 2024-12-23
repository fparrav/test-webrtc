# Aplicación de Video Llamadas con WebRTC

Esta aplicación implementa video llamadas peer-to-peer utilizando WebRTC y Socket.IO para la señalización.

## Características

- Video llamadas en tiempo real
- Audio bidireccional
- Interfaz simple con un solo botón
- Conexión automática peer-to-peer
- Soporte para NAT traversal usando servidores STUN

## Estructura del Proyecto

```
test-webrtc/
├── public/
│   ├── css/
│   │   └── styles.css          # Estilos de la aplicación
│   ├── js/
│   │   ├── app.js             # Lógica principal y eventos
│   │   └── webrtc.js          # Clase WebRTCHandler
│   └── index.html             # Página principal
├── server.js                  # Servidor Express y Socket.IO
└── package.json              # Dependencias y scripts
```

## Requisitos Previos

- Node.js v12 o superior
- npm v6 o superior
- Navegador moderno con soporte WebRTC
- Cámara web y micrófono
- Cuenta en ngrok para pruebas externas

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone <url-repositorio>
   cd test-webrtc
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

## Uso Local

1. Iniciar el servidor:
   ```bash
   npm start
   ```

2. Abrir en el navegador:
   ```
   http://localhost:3000
   ```

## Pruebas con Dispositivos Externos (usando ngrok)

1. Instalar ngrok globalmente:
   ```bash
   npm install -g ngrok
   ```

2. Configurar ngrok:
   ```bash
   ngrok config add-authtoken <TU-AUTHTOKEN>
   ```

3. Iniciar túnel ngrok:
   ```bash
   ngrok http 3000
   ```

4. Usar la URL HTTPS generada por ngrok en dispositivos externos

## Cómo Funciona

1. El servidor maneja:
   - Servir archivos estáticos
   - Gestionar conexiones Socket.IO
   - Retransmitir señalización WebRTC

2. El cliente (webrtc.js):
   - Gestiona conexiones peer-to-peer
   - Maneja streams de audio/video
   - Procesa señalización ICE

3. Flujo de una llamada:
   - Usuario A presiona "Iniciar Llamada"
   - Se solicitan permisos de media
   - Se crea y envía oferta WebRTC
   - Usuario B recibe y acepta la oferta
   - Se establece conexión peer-to-peer
   - El video/audio fluye directamente entre peers

## Solución de Problemas

- **No se ve el video remoto**: Verificar permisos de cámara
- **No hay conexión**: Comprobar configuración de firewall
- **Error de CORS**: Verificar configuración de Socket.IO
- **Problemas de NAT**: Asegurar acceso a servidores STUN

## Notas de Desarrollo

- La aplicación usa WebRTC para comunicación peer-to-peer
- Socket.IO solo se usa para señalización inicial
- Los servidores STUN ayudan con NAT traversal
- La conexión es totalmente encriptada (DTLS)

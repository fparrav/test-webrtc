import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";

// Conectar al servidor actual
const socket = io(window.location.origin); // Esto usará la misma URL base que el navegador

function App() {
  const [isCalling, setIsCalling] = useState(false); // Cambio de estado
  const [error, setError] = useState(null); // Mensajes de error
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    socket.on("asistencia_finalizada", () => {
      finalizarAsistencia();
    });

    // Manejar ofertas entrantes
    socket.on("offer", async (offer) => {
      if (!isCalling) {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("answer", answer);
      }
    });

    // Manejar respuestas entrantes
    socket.on("answer", async (answer) => {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    // Manejar candidatos ICE entrantes
    socket.on("ice-candidate", async (candidate) => {
      try {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (e) {
        console.error("Error agregando candidato ICE:", e);
      }
    });

    // Limpiar los listeners al desmontar el componente
    return () => {
      socket.off("asistencia_finalizada");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [isCalling]); // Actualizar dependencia

  const iniciarPeerConnection = async (stream) => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // Puedes agregar más servidores STUN/TURN si es necesario
      ],
    });

    // Manejar candidatos ICE generados localmente
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", event.candidate);
      }
    };

    // Manejar streams remotos
    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Agregar el stream local al peer connection
    stream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, stream);
    });
  };

  const toggleCall = async () => {
    if (!isCalling) {
      try {
        // Solicitar acceso a cámara y micrófono
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localVideoRef.current.srcObject = stream;

        // Iniciar llamada
        socket.emit("solicitar_asistencia");
        setIsCalling(true);

        await iniciarPeerConnection(stream);

        // Crear oferta
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit("offer", offer);
      } catch (err) {
        console.error(err);
        setError("No se pudo acceder a la cámara y el micrófono.");
      }
    } else {
      // Finalizar llamada
      finalizarAsistencia();
    }
  };

  const finalizarAsistencia = () => {
    socket.emit("finalizar_asistencia");
    setIsCalling(false);

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Detener videollamada
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
      remoteVideoRef.current.srcObject = null;
    }
  };

  return (
    <div>
      <h1>Test WebRTC</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}{" "}
      {/* Mostrar mensajes de error */}
      <div>
        <button onClick={toggleCall}>
          {isCalling ? "Finalizar Llamada" : "Iniciar Llamada"}
        </button>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: "20px",
        }}
      >
        <div>
          <h3>Mi Video</h3>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            style={{ width: "300px" }}
          />
        </div>
        <div>
          <h3>Video Remoto</h3>
          <video ref={remoteVideoRef} autoPlay style={{ width: "300px" }} />
        </div>
      </div>
    </div>
  );
}

export default App;

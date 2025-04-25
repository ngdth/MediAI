import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:8080'); // Đảm bảo trỏ đúng tới server

const VideoCall = () => {
  const { roomId } = useParams(); // Chính là videoCallCode
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const location = useLocation();
  const autoStart = location.state?.autoStart;
  const autoAnswer = location.state?.autoAnswer;

  const [localStream, setLocalStream] = useState(null);
  const [mySocketId, setMySocketId] = useState('');
  const [incomingCall, setIncomingCall] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    socket.on('your-id', (id) => {
      setMySocketId(id);
    });

    socket.emit('join-video-room', roomId);

    socket.on('call-made', async ({ offer }) => {
      setIncomingCall(true);
      window.offer = offer;

      // 👇 Nếu có autoAnswer thì trả lời luôn
      if (autoAnswer && !callStarted) {
        await answerCall();
      }
    });

    socket.on('answer-made', async ({ answer }) => {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', ({ candidate }) => {
      peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    if (autoStart && !callStarted) {
      startCall();
    }

    return () => {
      socket.off('your-id');
      socket.off('call-made');
      socket.off('answer-made');
      socket.off('ice-candidate');
    };
  }, [roomId, autoStart, autoAnswer]);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          roomId: roomId,
        });
      }
    };

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    return pc;
  };

  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;
    setLocalStream(stream);

    const pc = createPeerConnection();
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    peerConnectionRef.current = pc;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit('call-user', {
      offer,
      roomId: roomId,
    });

    setCallStarted(true);
  };

  const answerCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;
    setLocalStream(stream);

    const pc = createPeerConnection();
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    peerConnectionRef.current = pc;

    await pc.setRemoteDescription(new RTCSessionDescription(window.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit('make-answer', {
      answer,
      roomId: roomId,
    });

    setIncomingCall(false);
    setCallStarted(true);
  };

  const endCall = () => {
    peerConnectionRef.current?.close();
    setCallStarted(false);
    setIncomingCall(false);
    localVideoRef.current.srcObject = null;
    remoteVideoRef.current.srcObject = null;
  };

  const toggleMute = () => {
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    setIsVideoOff(!isVideoOff);
  };

  return (
    <div className="video-call-container">
      <h2>🔗 Video Call WebRTC</h2>
      <p>Room Code: <code>{roomId}</code></p>
      <div className="video-container">
        <video ref={localVideoRef} autoPlay muted playsInline />
        <video ref={remoteVideoRef} autoPlay playsInline />
      </div>

      {!callStarted && <button onClick={startCall} disabled={!roomId}>Start Call</button>}
      {incomingCall && !callStarted && <button onClick={answerCall}>Answer Call</button>}
      {callStarted && <button onClick={endCall}>End Call</button>}

      {callStarted && (
        <div className="control-buttons">
          <div className="mute-btn" onClick={toggleMute}>
            {isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          </div>
          <div className="video-btn" onClick={toggleVideo}>
            {isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;

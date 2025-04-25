import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8080'); // Thay bằng URL server của bạn

const VideoCall = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [mySocketId, setMySocketId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [incomingCall, setIncomingCall] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [callerId, setCallerId] = useState('');
  const [isMuted, setIsMuted] = useState(false); // State kiểm tra micro
  const [isVideoOff, setIsVideoOff] = useState(false); // State kiểm tra camera

  useEffect(() => {
    // Nhận socket ID
    socket.on('your-id', (id) => {
      setMySocketId(id);
    });

    // Nhận cuộc gọi đến
    socket.on('call-made', async ({ offer, caller }) => {
      setIncomingCall(true);
      setCallerId(caller);
      window.offer = offer;
    });

    // Nhận câu trả lời
    socket.on('answer-made', async ({ answer }) => {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // Nhận ICE candidate
    socket.on('ice-candidate', ({ candidate }) => {
      peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      socket.off('your-id');
      socket.off('call-made');
      socket.off('answer-made');
      socket.off('ice-candidate');
    };
  }, []);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          target: targetId || callerId,
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
      target: targetId,
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
      target: callerId,
    });

    setIncomingCall(false);
    setCallStarted(true);
  };

  const endCall = () => {
    peerConnectionRef.current?.close();
    setCallStarted(false);
    setIncomingCall(false);
    setTargetId('');
    setCallerId('');
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
      <p>Your Socket ID: <code>{mySocketId}</code></p>
      <input
        placeholder="Enter socket ID to call"
        value={targetId}
        onChange={(e) => setTargetId(e.target.value)}
        disabled={callStarted}
      />
      <div className="video-container">
        <video ref={localVideoRef} autoPlay muted playsInline />
        <video ref={remoteVideoRef} autoPlay playsInline />
      </div>

      {!callStarted && <button onClick={startCall} disabled={!targetId}>Start Call</button>}
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

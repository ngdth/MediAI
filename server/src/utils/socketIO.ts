import { Server as IOServer } from 'socket.io';
import http from 'http';

export const initSocketServer = (server: http.Server) => {
  const io = new IOServer(server, {
    cors: {
      origin: "https://api.amma-care.com",
      methods: ["GET", "POST"],
      credentials: true,
    }
  });

  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);
    socket.emit('your-id', socket.id);

    // Join room theo videoCallCode
    socket.on('join-video-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`📌 Socket ${socket.id} joined room ${roomId}`);
    });

    // Gửi lời gọi tới phòng
    socket.on('call-user', ({ offer, roomId }) => {
      socket.to(roomId).emit('call-made', {
        offer,
        caller: socket.id,
      });
    });

    // Trả lời cuộc gọi
    socket.on('make-answer', ({ answer, roomId }) => {
      socket.to(roomId).emit('answer-made', {
        answer,
        callee: socket.id,
      });
    });

    // ICE Candidate
    socket.on('ice-candidate', ({ candidate, roomId }) => {
      socket.to(roomId).emit('ice-candidate', {
        candidate,
        from: socket.id,
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });
};

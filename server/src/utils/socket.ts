import { Server as IOServer } from 'socket.io';
import http from 'http';

export const initSocketServer = (server: http.Server) => {
  const io = new IOServer(server, {
    cors: {
      origin: '*',
    }
  });

  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);
    socket.emit('your-id', socket.id);

    socket.on('call-user', ({ offer, target }) => {
      io.to(target).emit('call-made', {
        offer,
        caller: socket.id,
      });
    });

    socket.on('make-answer', ({ answer, target }) => {
      io.to(target).emit('answer-made', {
        answer,
        callee: socket.id,
      });
    });

    socket.on('ice-candidate', ({ candidate, target }) => {
      io.to(target).emit('ice-candidate', {
        candidate,
        from: socket.id,
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });
};

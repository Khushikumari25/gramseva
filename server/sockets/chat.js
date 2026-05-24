const ChatMessage = require('../models/ChatMessage');
const jwt = require('jsonwebtoken');

const initSocket = (io) => {
  // Authentication middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    socket.join(socket.userId);

    // Send message
    socket.on('sendMessage', async (data) => {
      try {
        const { receiver, message, productRef } = data;
        const chatMessage = await ChatMessage.create({
          sender: socket.userId,
          receiver,
          message,
          productRef
        });

        // Emit to receiver
        io.to(receiver).emit('newMessage', {
          _id: chatMessage._id,
          sender: socket.userId,
          message,
          productRef,
          createdAt: chatMessage.createdAt
        });

        // Confirm to sender
        socket.emit('messageSent', { _id: chatMessage._id, status: 'sent' });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Get chat history
    socket.on('getChatHistory', async (data) => {
      try {
        const { otherUserId, page = 1 } = data;
        const messages = await ChatMessage.find({
          $or: [
            { sender: socket.userId, receiver: otherUserId },
            { sender: otherUserId, receiver: socket.userId }
          ]
        })
          .sort({ createdAt: -1 })
          .skip((page - 1) * 50)
          .limit(50);

        socket.emit('chatHistory', messages.reverse());
      } catch (error) {
        socket.emit('error', { message: 'Failed to load chat' });
      }
    });

    // Mark messages as read
    socket.on('markRead', async (data) => {
      try {
        await ChatMessage.updateMany(
          { sender: data.senderId, receiver: socket.userId, isRead: false },
          { isRead: true }
        );
        io.to(data.senderId).emit('messagesRead', { reader: socket.userId });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      io.to(data.receiver).emit('userTyping', { sender: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};

module.exports = initSocket;

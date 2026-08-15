const initNotificationSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('join', ({ role, id }) => {
      socket.join(`${role}_${id}`);
    });

    socket.on('disconnect', () => {
      
    });
  });
};

module.exports = { initNotificationSocket };

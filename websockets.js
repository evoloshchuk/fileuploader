var sio = require('socket.io');

/**
 * Enable socket.io server to work with current express server.
 */
exports.attach = function(server) {
    // Start listening.
    var io = sio.listen(server);

    // It is a bit dissapointing, but Heroku Cedar stack does not support
    // websockets at the moment, so we have to use xhr-polling.
    io.configure(function () { 
        io.set("transports", ["xhr-polling"]); 
        io.set("polling duration", 300);
    });

    /**
     * For every new incoming connection let's return the id of this connection
     * back to the client, so it can be passed around, so it can be found later
     * by normal request handled by express server.
     */
    io.sockets.on('connection', function (socket) {
        socket.emit('connection', socket.id);
    });
    
    // Export current socket.io server
    exports.io = io;
};

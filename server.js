var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];
    strangers = [];
    stranger= 'dddd';
//specify the html we will use
app.use('/', express.static(__dirname + '/www'));
//bind the server to the 80 port
//server.listen(3000);//for local test
server.listen(process.env.PORT || 3000);//publish to heroku
//server.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000);//publish to openshift
//console.log('server started on port'+process.env.PORT || 3000);
//handle the socket


Array.prototype.removeByValue = function(val) {
    for(var i=0; i<this.length; i++) {
      if(this[i] == val) {
        this.splice(i, 1);
        break;
      }
    }
  }
io.sockets.on('connection', function(socket) {
    //new user login
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            //socket.userIndex = users.length;
            //添加一个用户
            socket.nickname = nickname;
            //如果只有一个用户在线 ， 那么等待 ， 知道知道配对成功 ， 进入“wait”
            if(strangers.indexOf(nickname) == -1){
                strangers.push(nickname);
            }
            if(strangers[strangers.length-2]){
                users.push(nickname);
                stranger = strangers[strangers.length-2]
                socket.emit('loginSuccess',nickname,stranger);
                io.sockets.emit('system', nickname, users.length, 'login');
            }else{
                socket.emit('wait',nickname)
            }


            
        };
    });
    socket.on('hangWait', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            // socket.emit('nickExisted');
        } else {
            //socket.userIndex = users.length;
            socket.nickname = nickname;
            if(strangers.indexOf(nickname) == -1){
                strangers.push(nickname);
            }

            if(strangers[strangers.length-2]){
                users.push(nickname);
                stranger = strangers[strangers.length-1]
                socket.emit('loginSuccess',nickname,stranger);
                io.sockets.emit('system', nickname, users.length, 'login');
                strangers.pop();
                strangers.pop();

            }else{
                socket.emit('wait',nickname)
            }
            
        };

    })
    ;



    //user leaves
    socket.on('disconnect', function() {
        if (socket.nickname != null) {

            //users.splice(socket.userIndex, 1);
            users.splice(users.indexOf(socket.nickname), 1);
            strangers.splice(users.indexOf(socket.nickname), 1);
            socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
        }
    });
    //new message get
    socket.on('postMsg', function(msg, color,stranger) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color,stranger);
    });
    //new image get
    socket.on('img', function(imgData, color) {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });
});

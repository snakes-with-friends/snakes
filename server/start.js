'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const {resolve} = require('path')
const passport = require('passport')
const PrettyError = require('pretty-error')
const finalHandler = require('finalhandler')
const chalk = require('chalk')
const socketio = require('socket.io')

// PrettyError docs: https://www.npmjs.com/package/pretty-error

// Bones has a symlink from node_modules/APP to the root of the app.
// That means that we can require paths relative to the app root by
// saying require('APP/whatever').
//
// This next line requires our root index.js:
const pkg = require('APP')

const app = express()

if (!pkg.isProduction && !pkg.isTesting) {
  // Logging middleware (dev only)
  app.use(require('volleyball'))
}

// Pretty error prints errors all pretty.
const prettyError = new PrettyError()

// Skip events.js and http.js and similar core node files.
prettyError.skipNodeFiles()

// Skip all the trace lines about express' core and sub-modules.
prettyError.skipPackage('express')

module.exports = app
  // Session middleware - compared to express-session (which is what's used in the Auther workshop), cookie-session stores sessions in a cookie, rather than some other type of session store.
  // Cookie-session docs: https://www.npmjs.com/package/cookie-session
  .use(require('cookie-session')({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'an insecure secret key']
  }))

  // Body parsing middleware
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())

  // Authentication middleware
  .use(passport.initialize())
  .use(passport.session())

  // Serve static files from ../public
  .use(express.static(resolve(__dirname, '..', 'public')))

  // Serve our api - ./api also requires in ../db, which syncs with our database
  .use('/api', require('./api'))

  // Send index.html for anything else.
  .get('/*', (_, res) => res.sendFile(resolve(__dirname, '..', 'public', 'index.html')))

  // Error middleware interceptor, delegates to same handler Express uses.
  // https://github.com/expressjs/express/blob/master/lib/application.js#L162
  // https://github.com/pillarjs/finalhandler/blob/master/index.js#L172
  .use((err, req, res, next) => {
    console.error(prettyError.render(err))
    finalHandler(req, res)(err)
  })

if (module === require.main) {
  // Start listening only if we're the main module.
  //
  // https://nodejs.org/api/modules.html#modules_accessing_the_main_module
  const server = app.listen(
    process.env.PORT || 1337,
    () => {
      console.log(`--- Started HTTP Server for ${pkg.name} ---`)
      const { address, port } = server.address()
      const host = address === '::' ? 'localhost' : address
      const urlSafeHost = host.includes(':') ? `[${host}]` : host
      console.log(`Listening on http://${urlSafeHost}:${port}`)
    }
  )
  // adding socketio
  const io = socketio(server)
    // use socket server as an event emitter in order to listen for new connctions
  io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
      console.log(chalk.cyan('message: ' + msg))
    })
    // receives the newly connected socket
    // called for each browser that connects to our server
    console.log(chalk.magenta('A new client has connected'))
    console.log(chalk.yellow('socket id: ', socket.id))

    // event that runs anytime a socket disconnects
    socket.on('disconnect', function () {
      console.log('socket id ' + socket.id + ' has disconnected. :(')
    })

    // emit events
    io.emit()
  })

  /*
  ROOMS: this may work for the rooms of the game, so the players wait for all the people to join the room
  */

  // var drawHistory = {};

  // io.on('connection', function (socket) {

  //     // scope issues
  //     var room = null;

  //     // listens to 37 emit
  //     socket.on('wantToJoinRoomPlox', function (roomName) {
  //         room = roomName;
  //         socket.join(roomName);

  //         if (!drawHistory[roomName]) {
  //             drawHistory[roomName] = [];
  //         }

  //         // console.log('drawhistory: ', drawHistory)
  //         socket.emit('drawHistory', drawHistory[roomName]);
  //     });

  //     socket.on('newDraw', function (start, end, color) {
  //         // data
  //         console.log('new draw', start, end, color)
  //         drawHistory[room].push({ start: start, end: end, color: color });
  //         socket.broadcast.to(room).emit('someoneElseDrew', start, end, color);
  //     });

  // });
}

// This check on line 64 is only starting the server if this file is being run directly by Node, and not required by another file.
// Bones does this for testing reasons. If we're running our app in development or production, we've run it directly from Node using 'npm start'.
// If we're testing, then we don't actually want to start the server; 'module === require.main' will luckily be false in that case, because we would be requiring in this file in our tests rather than running it directly.
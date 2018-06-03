const express = require( 'express' )
const app = express()
const server = require( 'http' )
	.Server( app )
const io = require( 'socket.io' )( server )

// Sockets
io.on( 'connection', ( socket ) => {
	console.log( `User connected with id: '${socket.id}'` )
	socket.emit( 'connected', socket.id )
	socket.on( 'disconnect', () => {
		console.log( `User disconnected with id: '${socket.id}'` )
	} )
} )

// Server
server.listen( 8080, () => {
	console.log( 'Server started on port: 8080' )
} )

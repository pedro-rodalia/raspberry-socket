const express = require( 'express' )
const path = require( 'path' )
const fs = require( 'fs' )
const Gpio = require( 'onoff' )
	.Gpio

const app = express()
const server = require( 'http' )
	.Server( app )

const io = require( 'socket.io' )( server )

// Dummy data
const gpio = [ {
	name: 'Green led A',
	pin: 1,
	mode: 'out',
	value: false
}, {
	name: 'Green led B',
	pin: 2,
	mode: 'out',
	value: false
}, {
	name: 'Red led A',
	pin: 3,
	mode: 'out',
	value: false
}, {
	name: 'Red led B',
	pin: 4,
	mode: 'out',
	value: false
} ]

class gpioConfig {
	constructor( name, pinNumber, mode ) {
		this.name = name
		this.pinNumber = pinNumber
		this.pin = null
		switch ( mode ) {
		case 'output':
			asOutput()
			break;
		case 'input':
			asInput()
			break;
		default:
			this.mode = null
		}
	}

	getMode() {
		return this.mode
	}

	getName() {
		return this.name
	}

	asInput() {
		this.pin = new Gpio( this.pinNumber, 'in', 'both' )
		this.mode = 'input'
	}

	asOutput() {
		this.pin = new Gpio( this.pinNumber, 'out' )
		this.mode = 'output'
	}

	unSet() {
		return this.pin.unexport()
	}
}

gpio.push( new gpioConfig( 'Red led C', '4', 'output' ) )

// Sockets
io.on( 'connection', ( socket ) => {
	// log user connection
	console.log( `User connected with id: '${socket.id}'` )

	// emit connection confirmation and system data
	socket.emit( 'connected', socket.id )
	socket.emit( 'report', gpio )

	// listen to toggle event
	socket.on( 'toggle', ( pin ) => {
		// update system data
		const index = gpio.findIndex( ( gpio ) => pin == gpio.pin )
		gpio[ index ].value = !gpio[ index ].value
		// emit updated system data
		socket.emit( 'report', gpio )
		// log system data changes
		console.log( `Pin number ${pin} changed its value` )
	} )

	// listen to disconnect event
	socket.on( 'disconnect', () => {
		// log user disconnection
		console.log( `User disconnected with id: '${socket.id}'` )
	} )

} )

// Server
server.listen( 8080, () => {
	console.log( 'Server started on port: 8080' )
} )

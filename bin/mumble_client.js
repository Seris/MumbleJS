/**
 * Mumble Client
 * License: Apache License v2.0 (http://www.apache.org/licenses/LICENSE-2.0)
 */

let tls = require("tls"),
  util = require("util"),
  EventEmitter = require('events').EventEmitter;

let PacketBuilder = require(__dirname + "/packet.js");

// Adding events
util.inherits(MumbleClient, EventEmitter);

/**
 * Mumble Client
 * @constructor
 * @param {Object} options "MumbleJS Options"
 */
function MumbleClient (options) {
  this._version = "0.1.0";
  this._release = "MumbleJS";

  this._onSocketConnected = this._onSocketConnected.bind(this);
  this._initSocketHandler = this._initSocketHandler.bind(this);
  this._onSocketData = this._onSocketData.bind(this);
  this._checkForPacket = this._checkForPacket.bind(this);
  this._onNewPacket = this._onNewPacket.bind(this);
  this._etablishConnection = require(__dirname + '/protocol.js').bind(this);

  this._options = {
    host: options.host || '127.0.0.1',
    port: options.port || 64738,
    pfx: options.pfx,

    rejectUnauthorized: options,
    secureProtocol: "TLSv1_client_method",

    username: options.username,
    password: options.password || null,
    
    protoFile: options.protoFile || (__dirname + "/../proto/Mumble.proto")
  };

  this._socket = tls.connect(this._options, this._onSocketConnected);
}


/**
 * Fired when the tls socket is connected
 */
MumbleClient.prototype._onSocketConnected = function () {
  this.emit("connect", this);
  this._initSocketHandler();
  this._etablishConnection();
};


/**
 * Preparing to receive data from the socket
 */
MumbleClient.prototype._initSocketHandler = function () {
  this._buffer = new Buffer(0);
  this._processingPacket = false;
  this._currentPacket = null;

  this._packetBuilder = new PacketBuilder(this._options.protoFile);
  this.on("packet", this._onNewPacket);

  this._socket.on("data", this._onSocketData);
};


/**
 * Emit packet directly in MumbleClient
 * @param  {String} type
 * @param  {Array}  payload
 */
MumbleClient.prototype._onNewPacket = function(type, payload){
  this.emit(type, payload);
};


/**
 * Handle Mumble Packet
 * @param {Buffer} data
 */
MumbleClient.prototype._onSocketData = function (data) {
  if(data){
    this._buffer = Buffer.concat([this._buffer, data]);
    this.emit("socket-data", data);
  }

  if(this._processingPacket || this._buffer.length < 6)
    return;

  this._processingPacket = true;

  this._currentPacket = {
    type_id: this._buffer.readUInt16BE(0),
    size: this._buffer.readUInt32BE(2)
  };


  this._buffer = this._buffer.slice(6);

  this.on("socket-data", this._checkForPacket);
  this._checkForPacket();
};


/**
 * Prepare to receive a new packet
 * @param  {Integer} type Type of the packet
 * @param  {Integer} size Size of the packet
 */
MumbleClient.prototype._checkForPacket = function () {
  if(this._buffer.length < this._currentPacket.size)
    return;

  this.removeListener("socket-data", this._checkForPacket);

  let packet = this._currentPacket;
  packet.payload = this._buffer.slice(0, packet.size);
  this._buffer = this._buffer.slice(packet.size);

  packet = this._packetBuilder.decodePacket(packet.type_id, packet.payload);
  if(packet === null)
    console.error("Received an unknown packet. Dropping.");
  else
    this.emit("packet", packet.type, packet.payload);

  this._processingPacket = false;
  this._onSocketData();
};


MumbleClient.prototype._sendPacket = function (type, payload, cb) {
  let packet = this._packetBuilder.buildPacket(type, payload);
  packet = packet.toBuffer();

  let id = new Buffer(2),
    length = new Buffer(4);

  id.writeUInt16BE(PacketBuilder.packets.get_id(type), 0);
  length.writeUInt32BE(packet.length, 0);

  this._socket.write(id);
  this._socket.write(length);
  this._socket.write(packet, cb);
};


// Exporting MumbleClient
module.exports = MumbleClient;

/**
 * Build packet
 * License: Apache License v2.0 (http://www.apache.org/licenses/LICENSE-2.0)
 */

let protobufjs = require("protobufjs");

function PacketBuilder (protoFile) {
  this._protoFile = protoFile;
  this._builder = protobufjs.loadProtoFile(protoFile);
  this._proto = this._builder.result.MumbleProto;
}

PacketBuilder.packets = require(__dirname + "/types.js");

PacketBuilder.prototype.buildPacket = function(type, payload){
  if(this._proto[type]){
    return new this._proto[type](payload || {});
  } else {
    throw new TypeError(type + ' is not defined in ' + this._protoFile);
  }
};


PacketBuilder.prototype.decodePacket = function(type_id, payload){
  let type = PacketBuilder.packets[type_id];
  if(this._proto[type]){
    return {
      type: type,
      payload: new this._proto[type].decode(payload || {})
    };
  } else {
    return null;
  }
};

module.exports = PacketBuilder;
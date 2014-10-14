/**
 * List types of packet defined by the mumble protocol
 * License: Apache License v2.0 (http://www.apache.org/licenses/LICENSE-2.0)
 */

let types = [];
types[0]  = 'Version';
types[1]  = 'UDPTunnel';
types[2]  = 'Authenticate';
types[3]  = 'Ping';
types[4]  = 'Reject';
types[5]  = 'ServerSync';
types[6]  = 'ChannelRemove';
types[7]  = 'ChannelState';
types[8]  = 'UserRemove';
types[9]  = 'UserState';
types[10] = 'BanList';
types[11] = 'TextMessage';
types[12] = 'PermissionDenied';
types[13] = 'ACL';
types[14] = 'QueryUsers';
types[15] = 'CryptSetup';
types[16] = 'ContextActionModify';
types[17] = 'ContextAction';
types[18] = 'UserList';
types[19] = 'VoiceTarget';
types[20] = 'PermissionQuery';
types[21] = 'CodecVersion';
types[22] = 'UserStats';
types[23] = 'RequestBlob';
types[24] = 'ServerConfig';
types[25] = 'SuggestConfig';

// Return the id of a packet types
types.get_id = types.indexOf;

module.exports = types;
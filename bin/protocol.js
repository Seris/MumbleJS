/**
 * Mumble Protocol Implementation
 * License: Apache License v2.0 (http://www.apache.org/licenses/LICENSE-2.0)
 */

let os = require('os');

let MumbleVersions = {
  "1.2.4": 0x10204
};

function MumbleProtocol () {
  this._sendPacket("Version", {
    version: 0,
    release: this._release + "-" + this._version,
    os: os.type(),
    os_version: os.release()
  });

  this._sendPacket("Authenticate", {
    username: this._options.username,
    password: this._options.password,
    celt_versions: 0x8000000b
  });
}

module.exports = MumbleProtocol;

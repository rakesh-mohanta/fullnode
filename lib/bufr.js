/**
 * This is a convenience class for reading Varints and other basic types from a
 * buffer. This class is most useful for reading Varints, and also for signed
 * or unsigned integers of various types. It can also read a buffer in reverse
 * order, which is useful in bitcoin which uses little endian numbers a lot so
 * you find that you must reverse things. You probably want to use it like:
 * varint = BufR(buf).readVarint()
 */
var BN = require('./bn');

var BufR = function BufR(buf) {
  if (!(this instanceof BufR))
    return new BufR(buf);
  if (Buffer.isBuffer(buf)) {
    this.set({buf: buf});
  }
  else if (buf) {
    var obj = buf;
    this.set(obj);
  }
};

BufR.prototype.set = function(obj) {
  this.buf = obj.buf || this.buf || undefined;
  this.pos = obj.pos || this.pos || 0;
  return this;
};

BufR.prototype.eof = function() {
  return this.pos >= this.buf.length;
};

BufR.prototype.read = function(len) {
  if (typeof len === 'undefined')
    var len = this.buf.length;
  var buf = this.buf.slice(this.pos, this.pos + len);
  this.pos = this.pos + len;
  return buf;
};

BufR.prototype.readReverse = function(len) {
  if (typeof len === 'undefined')
    var len = this.buf.length;
  var buf = this.buf.slice(this.pos, this.pos + len);
  this.pos = this.pos + len;
  var buf2 = new Buffer(buf.length);
  for (var i = 0; i < buf2.length; i++)
    buf2[i] = buf[buf.length - 1 - i];
  return buf2;
};

BufR.prototype.readUInt8 = function() {
  var val = this.buf.readUInt8(this.pos);
  this.pos = this.pos + 1;
  return val;
};

BufR.prototype.readInt8 = function() {
  var val = this.buf.readInt8(this.pos);
  this.pos = this.pos + 1;
  return val;
};

BufR.prototype.readUInt16BE = function() {
  var val = this.buf.readUInt16BE(this.pos);
  this.pos = this.pos + 2;
  return val;
};

BufR.prototype.readInt16BE = function() {
  var val = this.buf.readInt16BE(this.pos);
  this.pos = this.pos + 2;
  return val;
};

BufR.prototype.readUInt16LE = function() {
  var val = this.buf.readUInt16LE(this.pos);
  this.pos = this.pos + 2;
  return val;
};

BufR.prototype.readInt16LE = function() {
  var val = this.buf.readInt16LE(this.pos);
  this.pos = this.pos + 2;
  return val;
};

BufR.prototype.readUInt32BE = function() {
  var val = this.buf.readUInt32BE(this.pos);
  this.pos = this.pos + 4;
  return val;
};

BufR.prototype.readInt32BE = function() {
  var val = this.buf.readInt32BE(this.pos);
  this.pos = this.pos + 4;
  return val;
};

BufR.prototype.readUInt32LE = function() {
  var val = this.buf.readUInt32LE(this.pos);
  this.pos = this.pos + 4;
  return val;
};

BufR.prototype.readInt32LE = function() {
  var val = this.buf.readInt32LE(this.pos);
  this.pos = this.pos + 4;
  return val;
};

BufR.prototype.readUInt64BEBN = function() {
  var buf = this.buf.slice(this.pos, this.pos + 8);
  var bn = BN().fromBuffer(buf);
  this.pos = this.pos + 8;
  return bn;
};

BufR.prototype.readUInt64LEBN = function() {
  var buf = this.readReverse(8);
  var bn = BN().fromBuffer(buf);
  return bn;
};

BufR.prototype.readVarintNum = function() {
  var first = this.readUInt8();
  switch (first) {
    case 0xFD:
      return this.readUInt16LE();
    case 0xFE:
      return this.readUInt32LE();
    case 0xFF:
      var bn = this.readUInt64LEBN();
      var n = bn.toNumber();
      if (n <= Math.pow(2, 53))
        return n;
      else
        throw new Error('number too large to retain precision - use readVarintBN');
    default:
      return first;
  }
};

BufR.prototype.readVarintBuf = function() {
  var first = this.buf.readUInt8(this.pos);
  switch (first) {
    case 0xFD:
      return this.read(1 + 2);
    case 0xFE:
      return this.read(1 + 4);
    case 0xFF:
      return this.read(1 + 8);
    default:
      return this.read(1);
  }
};

BufR.prototype.readVarintBN = function() {
  var first = this.readUInt8();
  switch (first) {
    case 0xFD:
      return BN(this.readUInt16LE());
    case 0xFE:
      return BN(this.readUInt32LE());
    case 0xFF:
      return this.readUInt64LEBN();
    default:
      return BN(first);
  }
};

module.exports = BufR;

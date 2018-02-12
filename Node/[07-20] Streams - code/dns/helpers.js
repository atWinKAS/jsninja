const bitwise = require('bitwise').default;

module.exports = {
  getBits(buf, start, length) {
    const byte = buf
      .slice(start, length)
      .toString('binary')
      .charCodeAt(0);

    return bitwise.byte.read(byte);
  },
  writeByte(bits) {
    const empty = new Array(8 - bits.length);

    return bitwise.byte.write([...empty, ...bits]);
  },
  parseQName(buf) {
    let tmpBuf = Buffer.from(buf);

    result = [];

    while (tmpBuf.length > 0) {
      const length = tmpBuf[0];
      if (length === 0) {
        break;
      }
      const subDomain = tmpBuf.slice(1, length + 1);

      tmpBuf = tmpBuf.slice(length + 1);
      result.push(subDomain.toString('utf8'));
    }
    return result.join('.');
  },
  qetBitsArr(byte, len) {
    const bits = bitwise.byte.read(byte);

    return bits.slice(8 - len);
  },
  modifyBuffer(buf, offset, data, length) {
    const tempBuffer = Buffer.alloc(length);
    const bits = data
      .toString('2')
      .split('')
      .map(i => +i);

    bitwise.buffer.modify(tempBuffer, bits, length * 8 - bits.length);
    tempBuffer.copy(buf, offset, 0, length);
    console.log('222', tempBuffer);
    return buf;
  },
  domainToQName(domain) {
    const tokens = domain.split('.');
    const qname = Buffer.alloc(domain.length + 2);

    const buffers = tokens.map(token => {
      const tokenBuff = Buffer.from(token);
      const tempBuffer = Buffer.alloc(tokenBuff.length + 1);

      tempBuffer[0] = tokenBuff.length;
      tokenBuff.copy(tempBuffer, 1, 0);
      return tempBuffer;
    });

    return Buffer.concat([...buffers, Buffer.alloc(1)]);
  },
};

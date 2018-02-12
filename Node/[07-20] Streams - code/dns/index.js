const dgram = require('dgram');
const bitwise = require('bitwise').default;
const helper = require('./helpers');
const records = require('./records.json');

const HOST = '127.0.0.1';
const PORT = '53';

const server = dgram.createSocket('udp4');

function parseQuery(msg) {
  const thirdBits = helper.getBits(msg, 2, 3); // 3 byte
  const fourthBits = helper.getBits(msg, 3, 4);
  const qr = thirdBits[0];

  const opCode = helper.writeByte(thirdBits.slice(1, 5));
  const z = helper.writeByte(fourthBits.slice(1, 4));
  const rcode = helper.writeByte(fourthBits.slice(4, 8));

  return {
    header: {
      id: msg.slice(0, 2),
      qr: thirdBits[0],
      opcode: opCode,
      aa: thirdBits[5],
      tc: thirdBits[6],
      rd: thirdBits[7],
      ra: fourthBits[0],
      z,
      rcode,
      qcount: msg.slice(4, 6),
      ancount: msg.slice(6, 8),
      nscount: msg.slice(8, 10),
      arcount: msg.slice(10, 12),
    },
    question: {
      qclass: msg.slice(msg.length - 2, msg.length),
      qtype: msg.slice(msg.length - 4, msg.length - 2),
      qname: msg.slice(12, msg.length - 4),
    },
  };
}

function formatResponse(request, record) {
  return {
    header: {
      id: request.header.id,
      qr: 1,
      opcode: 0,
      aa: 0,
      tc: 0,
      rd: 0,
      ra: 0,
      z: 0,
      rcode: 0,
      qcount: 1,
      ancount: record.length,
      nscount: 0,
      arcount: 0,
    },
    question: {
      ...request.question,
    },
    record,
  };
}

function formatBuffer(request) {
  const qNameLength = request.question.qname.length;
  const bufLength = 16 + qNameLength;
  let buf = Buffer.alloc(bufLength);
  request.header.id.copy(buf, 0, 0, 2);
  buf[2] = bitwise.byte.write([
    request.header.qr,
    ...helper.qetBitsArr(request.header.opcode, 4),
    request.header.aa,
    request.header.tc,
    request.header.rd,
  ]);

  buf[3] = bitwise.byte.write([
    request.header.ra,
    ...helper.qetBitsArr(request.header.z, 3),
    ...helper.qetBitsArr(request.header.rcode, 4),
  ]);

  helper.modifyBuffer(buf, 4, request.header.qcount, 2);
  helper.modifyBuffer(buf, 6, request.header.ancount, 2);
  helper.modifyBuffer(buf, 8, request.header.nscount, 2);
  helper.modifyBuffer(buf, 10, request.header.arcount, 2);

  request.question.qname.copy(buf, 12, 0, qNameLength);
  request.question.qtype.copy(buf, 12 + qNameLength, 0, 2);
  request.question.qclass.copy(buf, 12 + qNameLength + 2, 0, 2);

  let recordStart = 12 + qNameLength + 4;

  request.record.forEach(r => {
    let tempBuf = Buffer.alloc(buf.length + r.qname.length + 14);
    buf.copy(tempBuf, 0, 0, buf.length);

    r.qname.copy(tempBuf, recordStart, 0, r.qname.length);

    helper.modifyBuffer(tempBuf, recordStart + r.qname.length, r.qtype, 2);

    helper.modifyBuffer(tempBuf, recordStart + r.qname.length + 2, r.qclass, 2);
    helper.modifyBuffer(tempBuf, recordStart + r.qname.length + 4, r.ttl, 4);
    console.log(r.rdLength);
    helper.modifyBuffer(
      tempBuf,
      recordStart + r.qname.length + 8,
      r.rdLength,
      2,
    );

    helper.modifyBuffer(
      tempBuf,
      recordStart + r.qname.length + 10,
      r.rdata,
      r.rdLength,
    );
    console.log('!!', tempBuf);

    recordStart = recordStart + r.qname.length + 14;

    buf = tempBuf;
  });
  return buf;
}

server.on('message', (msg, info) => {
  const request = parseQuery(msg);
  const domain = helper.parseQName(request.question.qname);

  const record = records[domain].map(i => ({
    ...i,
    qname: helper.domainToQName(domain),
    rdata: parseInt(i.rdata),
  }));

  if (!record) {
    return;
  }
  const response = formatResponse(request, record);
  const responseBuffer = formatBuffer(response);

  server.send(
    responseBuffer,
    0,
    responseBuffer.length,
    info.port,
    info.address,
  );
});

server.bind(PORT, HOST);

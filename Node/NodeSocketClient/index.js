const WebSocket = require('ws');
const ws = new WebSocket('ws://rpn.javascript.ninja:8080');

ws.on('open', function open() {
  console.log('connected.');
});

ws.on('message', function incoming(data) {
  
  if (data.indexOf('Token:') == 0) {
    console.log('\nBingo!!!');
    console.log('------------------');
    console.log(data);
    console.log('------------------\n');
    return;
  }

  console.log('evaluating: ' + data);
  var result = rpn(data);
  console.log(' = ' + result);
  ws.send(result);
  console.log('\n');
});

ws.on('close', function close() {
  console.log('disconnected');
});

function rpn(input) {
  var ar = input.split(/\s+/),
    st = [],
    token;
  while (token = ar.shift()) {
    if (token == +token) {
      st.push(token);
    } else {
      var n2 = st.pop(),
        n1 = st.pop();
      var re = /^[\+\-\/\*]$/;
      if (n1 != +n1 || n2 != +n2 || !re.test(token)) {
        throw new Error('Invalid expression: ' + input);
      }
      st.push(eval(n1 + token + ' ' + n2));
    }
  }
  if (st.length !== 1) {
    throw new Error('Invalid expression: ' + input);
  }
  return st.pop();
}

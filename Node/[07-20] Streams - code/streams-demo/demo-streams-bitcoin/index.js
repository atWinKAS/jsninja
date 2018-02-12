const fetch = require('universal-fetch');
const { Readable } = require('stream');

const getCurrentPrice = () =>
  fetch('https://api.coindesk.com/v1/bpi/currentprice.json')
    .then(r => r.json())
    .then(data => data.bpi.USD.rate_float);

class BitcoinPriceStream extends Readable {
  constructor(options) {
    super({
      ...options,
      objectMode: true,
    });
    this.oldPrice = NaN;
  }

  async updatePrice() {
    const price = await getCurrentPrice();
    if (this.oldPrice !== price) {
      this.oldPrice = price;
      this.push({ price });
    } else {
      setTimeout(() => this.updatePrice(), 5000);
    }
  }

  _read() {
    this.updatePrice();
  }
}

const bStream = new BitcoinPriceStream();
bStream.on('data', price => {
  console.log(price);
});
setInterval(() => {
  console.log('test');
}, 100000000);

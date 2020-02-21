const crypto = require('crypto');

const hmac = crypto.createHmac('sha256','sercet-key');

hmac.update('hello,nodejs');

hmac.update('hello,lorry');

console.log(hmac.digest('hex')); //a86098d1c3983cd3220c39b59af8ab55f3cc674e2ea1c366bd65ef5151258c91
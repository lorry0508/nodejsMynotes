const crypto = require('crypto');

const hash = crypto.createHash('md5');

// 可任意多次调用update()
hash.update('hello,world');
hash.update('hello,nodejs');

console.log(hash.digest('hex')); // cd3e64e7e87896b245d7a30ccfc1a048
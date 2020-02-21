const crypto = require('crypto');

const sha1 = crypto.createHash('sha1');

// 可任意多次调用update()
sha1.update('hello,world');
sha1.update('hello,nodejs');

console.log(sha1.digest('hex')); //652cac9fda4b517e3dd9d59a9dc4e2c328862e85
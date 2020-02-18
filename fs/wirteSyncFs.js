'use strict';

var fs = require('fs');

var data = 'hello,lorry';

fs.writeFileSync('output.txt',data)
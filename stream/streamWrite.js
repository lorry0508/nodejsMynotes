'use strict';

var fs = require("fs");

var wsl = fs.createReadStream('output1.txt','utf-8');

wsl.write('使用stream写入文本数据。。。\n');

wsl.write('end');

wsl.end();
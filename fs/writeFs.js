'use strict';

var fs = require("fs");

var data = 'hello,nodeJs';

fs.writeFile('ouput.txt',data,function(err) {
    if(err) {
        console.log(err)
    } else {
        console.log('ok')
    }
});
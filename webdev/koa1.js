var koa = require('koa');
var app = koa();

app.use('/test',function *() {
    yield doReadFile1();
    var data = yield doReadFile2();
    this.body = data;
})

app.listen(3000);
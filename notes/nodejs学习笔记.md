## nodejs学习笔记

### 1.模块的概念

为了编写可维护的代码，我们把很多函数分组，分别放到不同的文件里，这样，每个文件包含的代码就相对较少，很多编程语言都采用这种组织代码的方式。在Node环境中，一个.js文件就称之为一个模块（module）。

优点：最大的好处是大大提高了代码的可维护性。其次，编写代码不必从零开始。当一个模块编写完毕，就可以被其他地方引用。我们在编写程序的时候，也经常引用其他模块，包括Node内置的模块和来自第三方的模块。

### 2.CommonJS规范

这种模块加载机制成为CommonJs规范。在当前规范下，每一个.js文件都是一个模块，它们内部使用的变量名和函数名互不冲突。一个模块向对外暴露变量（函数），可以通过module.exports = "变量"；一个变量想要使用其他模块暴露的变量（函数），通过 var ref  = require('module_name');就能获取到其他模块暴露的变量(函数)。

### 3.深入理解模块原理

nodeJs实现“模块”这个功能，并不需要语法层面的支持。Node.js也并不会增加任何JavaScript语法。实现“模块”功能的奥妙就在于JavaScript是一种函数式编程语言，它支持闭包。如果我们把一段JavaScript代码用一个函数包装起来，这段代码的所有“全局”变量就变成了函数内部的局部变量。

```
//我们编写的hello.js是这样的
var s = 'Hello';
var name = 'world';
console.log(s + ' ' + name + '!');

//Node.js加载了hello.js后，它可以把代码包装一下，变成这样执行：
(function () {
    // 读取的hello.js代码:
    var s = 'Hello';
    var name = 'world';

    console.log(s + ' ' + name + '!');
    // hello.js代码结束
})();
```

如果Node.js继续加载其他模块，这些模块中定义的“全局”变量`s`也互不干扰。所以，Node利用JavaScript的函数式编程的特性，轻而易举地实现了模块的隔离。

模块的输出`module.exports`怎么实现？

```
// 准备module对象:
var module = {
    id: 'hello',
    exports: {}
};
var load = function (module) {
    // 读取的hello.js代码:
    function greet(name) {
        console.log('Hello, ' + name + '!');
    }
    
    module.exports = greet;
    // hello.js代码结束
    return module.exports;
};
var exported = load(module);
// 保存module:
save(module, exported);
```

可见，变量`module`是Node在加载js文件前准备的一个变量，并将其传入加载函数，我们在`hello.js`中可以直接使用变量`module`原因就在于它实际上是函数的一个参数：

```
module.exports = greet;
```

通过把参数`module`传递给`load()`函数，`hello.js`就顺利地把一个变量传递给了Node执行环境，Node会把`module`变量保存到某个地方。由于Node保存了所有导入的`module`，当我们用`require()`获取module时，Node找到对应的`module`，把这个`module`的`exports`变量返回，这样，另一个模块就顺利拿到了模块的输出：

```
var greet = require('./hello');
```

### 4.module.exports   和 exports

方法一：对module.exports赋值

```
//hello.js
function hello() {
	console.log("hello world");
};
function great() {
	console.log('hello,' + name + '!');
};
module.exports = {
	hello: hello,
	great: great
};
```

方法二：直接使用exports

```
//hello.js
function hello() {
	console.log('hello world!');	
};
function great(name) {
	console.log('hello,' + name + '!');
};
exports.hello = hello;
exports.great = great;
```

但是不能直接对exports赋值

```
// 代码可以执行，但是模块并没有输出任何变量:
exports = {
	hello: hello,
	greet: greet
}
```

建议使用module.exports = {}来输出模块变量，更简单。

### 5.常用基本模块

#### 1)global

JavaScript有且仅有一个全局对象，在浏览器中，叫`window`对象；在nodeJs中，叫global对象，例如使用global.console。

#### 2)process

process是nodeJs提供的一个对象，代表当前nodeJs进程，通过process对象可以拿到很多有用的信息。

#### 3)fs

fs就是文集系统模块，负责读写文件，同时提供了同步和异步的方法。

##### 一、异步读取文件

sample.txt为文本文件，编码格式为utf-8

```js
'use strict';

var fs = require('fs');

fs.readFile('sample.txt', 'utf-8', function (err, data) {
    if (err) {
        console.log(err);
    } else {
        console.log(data);
    }
});
```

如果文件为二进制文件，sample.png

```js
'use strict';

var fs = require('fs');

fs.readFile('sample.png', function (err, data) {
    if (err) {
        console.log(err);
    } else {
        console.log(data);
        console.log(data.length + ' bytes');
    }
});
```

当读取二进制文件时，不传入文件编码时，回调函数的`data`参数将返回一个`Buffer`对象。在Node.js中，`Buffer`对象就是一个包含零个或任意个字节的数组（注意和Array不同）。

```js
//Buffer对象可以和String作转换，例如，把一个Buffer对象转换成String：
// Buffer -> String
var text = data.toString('utf-8');
console.log(text);

//或者把一个String转换成Buffer：
// String -> Buffer
var buf = Buffer.from(text, 'utf-8');
console.log(buf);
```

##### 二、同步读取文件

同步读取的函数和异步函数相比，多了一个`Sync`后缀，并且不接收回调函数，函数直接返回结果。

```js
'use strict';

var fs = require('fs');

var data = fs.readFileSync('sample.txt', 'utf-8');
console.log(data);
```

如果同步读取文件发生错误，则需要用`try...catch`捕获该错误：

```js
try {
    var data = fs.readFileSync('sample.txt', 'utf-8');
    console.log(data);
} catch (err) {
    // 出错了
}
```

##### 三、写文件（同步）

写文件是通过fs.writeFile()实现的

```js
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
```

`writeFile()`的参数依次为文件名、数据和回调函数。如果传入的数据是String，默认按UTF-8编码写入文本文件，如果传入的参数是`Buffer`，则写入的是二进制文件。回调函数由于只关心成功与否，因此只需要一个`err`参数。

##### 四、写文件（异步）

writeFileSync()

```js
'use strict';

var fs = require('fs');

var data = 'hello,lorry';

fs.writeFileSync('output.txt',data)
```

##### 五、stat

如果我们要获取文件大小，创建时间等信息，可以使用`fs.stat()`，它返回一个`Stat`对象，能告诉我们文件或目录的详细信息：

```js
'use strict';

var fs = require('fs');

fs.stat('sample.txt', function(err, stat) {
    if(err) {
        console.log(err);
    } else {
        // 是否文件
        console.log('isFile:' + stat.isFile());
        // 是否目录
        console.log('isDirectory:' + stat.isDirectory());
        if(stat.isFile()) {
            // 文件大小
            console.log('size:' + stat.size);
            // 创建时间，Date对象
            console.log('creat time:' + stat.birthtime);
            // 修改时间，Date对象
            console.log('modified time:' + stat.mtime);
        }
    }
})
```

注意：stat()`也有一个对应的同步函数`statSync()。

##### 六、使用同步，还是异步

由于Node环境执行的JavaScript代码是服务器端代码，所以，绝大部分需要在服务器运行期反复执行业务逻辑的代码，*必须使用异步代码*，否则，同步代码在执行时期，服务器将停止响应，因为JavaScript只有一个执行线程。服务器启动时如果需要读取配置文件，或者结束时需要写入到状态文件时，可以使用同步代码，因为这些代码只在启动和结束时执行一次，不影响服务器正常运行时的异步执行。



#### 4）stream

`stream`是Node.js提供的又一个仅在服务区端可用的模块，目的是支持“流”这种数据结构。

在Node.js中，流也是一个对象，我们只需要响应流的事件就可以了：`data`事件表示流的数据已经可以读取了，`end`事件表示这个流已经到末尾了，没有数据可以读取了，`error`事件表示出错了。

```js
'use strict';

var fs = require('fs');

//打开一个流
var rs = fs.createReadStream('sample.txt','utf-8');

rs.on('data',function(chunk) {
    console.log('data');
    console.log(chunk);
})

rs.on('end',function() {
    console.log('end');
})

rs.on('error',function(err) {
    console.log('error' + err)
})
```

要注意，`data`事件可能会有多次，每次传递的`chunk`是流的一部分数据。

要以流的形式写入文件，只需要不断调用`write()`方法，最后以`end()`结束：

```js
'use strict';

var fs = require("fs");

var ws1 = fs.createReadStream('output1.txt','utf-8');

ws1.write('使用stream写入文本数据。。。\n');

ws1.write('end');

ws1.end();

var ws2 = fs.createWirteStream('output2.txt');

ws2.write(new Buffer('使用stream写入二进制数据。。。、\n','utf-8'));

ws2.write(new Buffer('end','utf-8'));

ws2.end();
```

所有可以读取数据的流都继承自`stream.Readable`，所有可以写入的流都继承自`stream.Writable`。

#### 5)pipe

就像可以把两个水管串成一个更长的水管一样，两个流也可以串起来。一个`Readable`流和一个`Writable`流串起来后，所有的数据自动从`Readable`流进入`Writable`流，这种操作叫`pipe`。

在Node.js中，`Readable`流有一个`pipe()`方法，就是用来干这件事的。

让我们用`pipe()`把一个文件流和另一个文件流串起来，这样源文件的所有数据就自动写入到目标文件里了，所以，这实际上是一个复制文件的程序：

```js
'use strict';

var fs = require('fs');

var rs = fs.createReadStream('sample.txt');
var ws = fs.createWriteStream('copied.txt');

rs.pipe(ws);
```

默认情况下，当`Readable`流的数据读取完毕，`end`事件触发后，将自动关闭`Writable`流。如果我们不希望自动关闭`Writable`流，需要传入参数：

```js
readable.pipe(writable, { end: false });
```

#### 6)http

##### HTTP协议

(http://www.liaoxuefeng.com/wiki/1016959663602400/1017804782304672)

##### HTTP服务器

`http`模块提供的`request`和`response`对象。

`request`对象封装了HTTP请求，我们调用`request`对象的属性和方法就可以拿到所有HTTP请求的信息；

`response`对象封装了HTTP响应，我们操作`response`对象的方法，就可以把HTTP响应返回给浏览器。

##### 文件服务器

解析URL需要用到Node.js提供的`url`模块，它使用起来非常简单，通过`parse()`将一个字符串解析为一个`Url`对象：

```js
'use strict';

var url = require("url");

console.log(url.parse('http://user:pass@host.com:8080/path/to/file?query=string#hash'));
```

处理本地文件目录需要使用Node.js提供的`path`模块，它可以方便地构造目录：

```js
'use strict';

var path = require('path');

// 解析当前目录:
var workDir = path.resolve('.'); // '/Users/michael'

// 组合完整的文件路径:当前目录+'pub'+'index.html':
var filePath = path.join(workDir, 'pub', 'index.html');
// '/Users/michael/pub/index.html'
```

使用`path`模块可以正确处理操作系统相关的文件路径。在Windows系统下，返回的路径类似于`C:\Users\michael\static\index.html`，这样，我们就不关心怎么拼接路径了。

最后，我们实现一个文件服务器`file_server.js`：

```js
'use strict';

var
    fs = require('fs'),
    url = require('url'),
    path = require('path'),
    http = require('http');

// 从命令行参数获取root目录，默认是当前目录:
var root = path.resolve(process.argv[2] || '.');

console.log('Static root dir: ' + root);

// 创建服务器:
var server = http.createServer(function (request, response) {
    // 获得URL的path，类似 '/css/bootstrap.css':
    var pathname = url.parse(request.url).pathname;
    // 获得对应的本地文件路径，类似 '/srv/www/css/bootstrap.css':
    var filepath = path.join(root, pathname);
    // 获取文件状态:
    fs.stat(filepath, function (err, stats) {
        if (!err && stats.isFile()) {
            // 没有出错并且文件存在:
            console.log('200 ' + request.url);
            // 发送200响应:
            response.writeHead(200);
            // 将文件流导向response:
            fs.createReadStream(filepath).pipe(response);
        } else {
            // 出错了或者文件不存在:
            console.log('404 ' + request.url);
            // 发送404响应:
            response.writeHead(404);
            response.end('404 Not Found');
        }
    });
});

server.listen(8080);

console.log('Server is running at http://127.0.0.1:8080/');
```

没有必要手动读取文件内容。由于`response`对象本身是一个`Writable Stream`，直接用`pipe()`方法就实现了自动读取文件内容并输出到HTTP响应。

在命令行运行`node file_server.js /path/to/dir`，把`/path/to/dir`改成你本地的一个有效的目录，然后在浏览器中输入`http://localhost:8080/index.html`，只要当前目录下存在文件`index.html`，服务器就可以把文件内容发送给浏览器。

#### 7)crypto

crypto模块的目的是为了提供通用的加密和哈希算法。用纯JavaScript代码实现这些功能不是不可能，但速度会非常慢。Nodejs用C/C++实现这些算法后，通过cypto这个模块暴露为JavaScript接口，这样用起来方便，运行速度也快。

##### MD5和SHA1

MD5是一种常用的哈希算法，用于给任意数据一个“签名”。这个签名通常用一个十六进制的字符串表示：

```js
const crypto = require('crypto');

const hash = crypto.createHash('md5');

// 可任意多次调用update()
hash.update('hello,world');
hash.update('hello,nodejs');

console.log(hash.digest('hex')); // cd3e64e7e87896b245d7a30ccfc1a048
```

`update()`方法默认字符串编码为`UTF-8`，也可以传入Buffer。如果要计算SHA1，只需要把`'md5'`改成`'sha1'`，就可以得到SHA1的结果`1f32b9c9932c02227819a4151feed43e131aca40`。还可以使用更安全的`sha256`和`sha512`。

##### Hmac

Hmac算法也是一种哈希算法，它可以利用MD5或SHA1等哈希算法。不同的是，Hmac还需要一个密钥：

```js
const crypto = require('crypto');

const hmac = crypto.createHmac('sha256','sercet-key');

hmac.update('hello,nodejs');

hmac.update('hello,lorry');

console.log(hmac.digest('hex')); //a86098d1c3983cd3220c39b59af8ab55f3cc674e2ea1c366bd65ef5151258c91
```

只要密钥发生了变化，那么同样的输入数据也会得到不同的签名，因此，可以把Hmac理解为用随机数“增强”的哈希算法。

##### AES

AES是一种常用的对称加密算法，加解密都用同一个密钥。crypto模块提供了AES支持，但是需要自己封装好函数，便于使用：

```js
const crypto = require('crypto');

function aesEncrypt(data, key) {
    const cipher = crypto.createCipher('aes192', key);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function aesDecrypt(encrypted, key) {
    const decipher = crypto.createDecipher('aes192', key);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

var data = 'Hello, this is a secret message!';
var key = 'Password!';
var encrypted = aesEncrypt(data, key);
var decrypted = aesDecrypt(encrypted, key);

console.log('Plain text: ' + data);
console.log('Encrypted text: ' + encrypted);
console.log('Decrypted text: ' + decrypted);
```

运行结果如下：

```js
Plain text: Hello, this is a secret message!
Encrypted text: 8a944d97bdabc157a5b7a40cb180e7...
Decrypted text: Hello, this is a secret message!
```

注意到：AES有很多不同的算法，如`aes192`，`aes-128-ecb`，`aes-256-cbc`等，AES除了密钥外还可以指定IV（Initial Vector），不同的系统只要IV不同，用相同的密钥加密相同的数据得到的加密结果也是不同的。加密结果通常有两种表示方法：hex和base64，这些功能Nodejs全部都支持，但是在应用中要注意，如果加解密双方一方用Nodejs，另一方用Java、PHP等其它语言，需要仔细测试。如果无法正确解密，要确认双方是否遵循同样的AES算法，字符串密钥和IV是否相同，加密后的数据是否统一为hex或base64格式。

##### Diffie-Hellman

DH算法是一种密钥交换协议，它可以让双方在不泄漏密钥的情况下协商出一个密钥来。

用crypto模块实现DH算法如下：

```js
const crypto = require('crypto');

// xiaoming's keys:
var ming = crypto.createDiffieHellman(512);
var ming_keys = ming.generateKeys();

var prime = ming.getPrime();
var generator = ming.getGenerator();

console.log('Prime: ' + prime.toString('hex'));
console.log('Generator: ' + generator.toString('hex'));

// xiaohong's keys:
var hong = crypto.createDiffieHellman(prime, generator);
var hong_keys = hong.generateKeys();

// exchange and generate secret:
var ming_secret = ming.computeSecret(hong_keys);
var hong_secret = hong.computeSecret(ming_keys);

// print secret:
console.log('Secret of Xiao Ming: ' + ming_secret.toString('hex'));
console.log('Secret of Xiao Hong: ' + hong_secret.toString('hex'));
```

##### RSA

RSA算法是一种非对称加密算法，即由一个私钥和一个公钥构成的密钥对，通过私钥加密，公钥解密，或者通过公钥加密，私钥解密。其中，公钥可以公开，私钥必须保密。
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
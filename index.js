let express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname, 'public/current')));


var proxy = require('http-proxy-middleware');

app.use('/ajax', proxy({
    target: "http://m.maoyan.com/",
    changeOrigin: true
}));

app.listen(3000,function(){
    console.log('server start@127.0.0.1:3000')
})
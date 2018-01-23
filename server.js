#!/usr/bin/env node

var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    hostname = process.env.HOSTNAME || '0.0.0.0',
    port = parseInt(process.env.PORT, 10) || 8080,
    publicDir = process.argv[2] || __dirname + '/public',
    path = require('path'),
    fs = require("fs"),
    formidable=require("formidable"); 


app.get("/", function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
    res.end("<!DOCTYPE html>"
            +"<html>"
            +"<head>"
              +"<meta charset=utf-8>"
              +"<title>Simple Express Static Server</title>"
            +"</head>"
            +"<body>"
              +"Hello World"
            +"</body>"
            +"</html>");
});

app.post('/upload/*', function (req, res) { 
  var reg = /\/upload\/((\w|-|\s|\/)+)/ig;
  req.url.replace(reg, function(s,value) {
    handle(req, res, value+'/');
  });
});

app.post('/upload', function (req, res) { 
  handle(req, res, '');
});  

function handle(req, res, platform){
    var form=new formidable.IncomingForm();
    form.encoding = "utf-8";
    form.uploadDir=publicDir;
    form.keepExtensions = true;
    // form.maxFieldsSize = 200 * 1024 * 1024;
    form.on('fileBegin', function(name, file) {
      var destPath=publicDir+platform;
      file.path=destPath+file.name;
      mkdirsSync(destPath);
      console.log('fileBeg'+JSON.stringify(file)); 
    });
    
    form.parse(req,function (err,fields,files) {
        if(files.file){
            var path='http://'+hostname+':'+port+'/'+platform+files.file.name;
            console.log(path);
            res.write(JSON.stringify({err:0,path:path}));
            // res.send('文件上传成功'); 
            res.end();
        }
    }); 
}

function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {  
        return true;  
    } else {  
        if (mkdirsSync(path.dirname(dirname))) {  
            fs.mkdirSync(dirname);  
            return true;  
        }  
    }  
}  

app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(publicDir));
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

console.log("Simple file server showing %s listening at http://%s:%s", publicDir, hostname, port);
app.listen(port, hostname);
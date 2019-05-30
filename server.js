#!/usr/bin/env node

var program = require('commander'),
    path = require('path'),
    fs = require("fs"),
    formidable = require("formidable")
    underscore = require('underscore'),
    qrcode = require('qrcode-terminal'),
    express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    pkg = require('./package.json');

var version = pkg.version;

function before(obj, method, fn) {
  var old = obj[method];

  obj[method] = function() {
    fn.call(this);
    old.apply(this, arguments);
  };
}


before(program, 'outputHelp', function() {
  this.allowUnknownOption();
});

program
  .version(version)
  .usage('[option] [dir]')
  .option('-p, --port <port-number>', 'set port for server (defaults is 8080)')
  .option('-i, --ip <ip-address>', 'set ip address for server (defaults is automatic getting by program)')
  .parse(process.argv);

if (program.args.length == 0) {
  console.log('Please, specify a folder to serve')
  process.exit();
}

var hostname = program.ip || underscore
  .chain(require('os').networkInterfaces())
  .values()
  .flatten()
  .find(function(iface) {
    return iface.family === 'IPv4' && iface.internal === false;
  })
  .value()
  .address,
    port = parseInt(program.port, 10) || 8080,
    publicDir = program.args[0] || __dirname + '/public'; 
    
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
    var formDataName = ''
    var form = new formidable.IncomingForm();
    form.encoding = "utf-8";
    form.uploadDir=publicDir;
    form.keepExtensions = true;
    // form.maxFieldsSize = 200 * 1024 * 1024;
    // console.log(form)
    form.on('field', function(name, value) {
      
    })

    form.on('file', function(name, file) {
      
    })

    form.on('end', function() {
      
    })

    form.on('error', function(err) {
      console.log('error:' + JSON.stringify(err))
    })

    form.on('fileBegin', function(name, file) {
      console.log('fileBegin' + JSON.stringify(file));
      formDataName = name
      var destPath = publicDir + platform;
      file.path = destPath + file.name;
      mkdirsSync(destPath);
       
    });
    
    form.parse(req,function (err,fields,files) {
        if(files[formDataName]){
            var path = 'http://' + hostname + ':' + port + '/' + platform + files[formDataName].name;
            console.log(path);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify({code:0,message:'',data:{path:path}}));
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

var serverUrl = "http://"+hostname+":"+port
qrcode.generate(serverUrl+'/index.html');
console.log("Simple file server showing %s listening at %s", publicDir, serverUrl);
app.listen(port, hostname);
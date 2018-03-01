load('api_mqtt.js');
load('api_gpio.js');
load('api_timer.js');
load('api_dht.js');
load('api_sys.js');

let pin = 0, topicLight = 'glaera' + '/feeds/light/json';
let statusTrigger =  'glaera'  + '/feeds/status/json';
let stateTopic = 'glaera' + '/feeds/state/json'; 
let LED = 12;
let tpin = 14;

// Initialize DHT library
let dht = DHT.create(tpin, DHT.DHT11);


GPIO.set_mode(LED, GPIO.MODE_OUTPUT);
GPIO.write(LED, true)

GPIO.set_button_handler(pin, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function() {
  print('going to send');
  
  let ok = MQTT.pub( stateTopic, getState());
  print('status sent?',ok);
 
}, null);

MQTT.sub(topicLight, function(conn, topic, msg) {
  print('Teceived Topic:', topic, 'message:', msg);
  let jmsg = JSON.parse(msg);
  if (jmsg.last_value === 'ON' || jmsg.last_value === '1') {
    GPIO.write(LED, true);
  } else {
    GPIO.write(LED, false);
    print('turning off')
  }
}, null);

MQTT.sub(statusTrigger, function(conn, topic, msg) {
  print('Received Topic:', topic, 'message:', msg);
 

  let LED_STATE = GPIO.read(LED);

  MQTT.pub( stateTopic, getState());
 
}, null);

function getState() {
  let t = JSON.stringify(dht.getTemp());
  let h = JSON.stringify(dht.getHumidity());

  if (isNaN(h) || isNaN(t)) {
    print('Failed to read data from sensor');
   
  }
  
  let LED_STATE = JSON.stringify(GPIO.read(LED));

  //let toreturn = JSON.stringify({temperature:t,light:LED_STATE,humidity:h});
  let toreturn = t + ',' + h + ',' +LED_STATE;
  return toreturn;
}

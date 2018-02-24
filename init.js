load('api_mqtt.js');
load('api_gpio.js');
load('api_timer.js');
load('api_dht.js');

let pin = 0, topic = 'light';

let LED = 12;
let tpin = 14;

// Initialize DHT library
let dht = DHT.create(tpin, DHT.DHT11);


GPIO.set_mode(LED, GPIO.MODE_OUTPUT);
GPIO.write(LED, true)

GPIO.set_button_handler(pin, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function() {
  print('going to send');
  let t = dht.getTemp();
  let h = dht.getHumidity();

  if (isNaN(h) || isNaN(t)) {
    print('Failed to read data from sensor');
   
  }

  print('Temperature:', t, '*C');
  print('Humidity:', h, '%');
  MQTT.pub('light', JSON.stringify(t));
  print('sent');
}, null);

MQTT.sub(topic, function(conn, topic, msg) {
  print('Topic:', topic, 'message:', msg);
  if (msg === 'ON' || msg === '1') {
    GPIO.write(LED, false);
  } else {
    GPIO.write(LED, true);
  }
  GPIO.toggle(LED);
  //GPIO.write(LED, false)
}, null);

MQTT.sub("status", function(conn, topic, msg) {
  print('Topic:', topic, 'message:', msg);
 
  let t = dht.getTemp();
  let h = dht.getHumidity();

  if (isNaN(h) || isNaN(t)) {
    print('Failed to read data from sensor');
   
  }
  
  let LED_STATE = GPIO.read(LED);

  print('Temperature:', t, '*C');
  print('Humidity:', h, '%');
  MQTT.pub('state', getState());
 
}, null);

function getState() {
  let t = dht.getTemp();
  let h = dht.getHumidity();

  if (isNaN(h) || isNaN(t)) {
    print('Failed to read data from sensor');
   
  }
  
  return JSON.stringify({temperature:t,light:LED_STATE,humidity:h});
  
}


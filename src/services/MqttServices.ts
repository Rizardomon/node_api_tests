import mqtt, { MqttClient } from 'mqtt';


class MqttHandler {
  password: string;
  username: string;
  host: string;
  mqttClient: MqttClient;

  constructor() {
    this.mqttClient = null;
    this.host = 'mqtt://157.245.223.123';
    this.username = 'sammy';
    this.password = 'Lime#1234';
  }

  connect() {
    // Connect mqtt with credentials
    this.mqttClient = mqtt.connect(this.host, { username: this.username, password: this.password });

    // Mqtt error calback
    this.mqttClient.on('error', (err) => {
      console.log(err);
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on('connect', () => {
      console.log(`mqtt client connected`);
    });

    // mqtt subscriptions
    this.mqttClient.subscribe('mytopic', { qos: 0 });

    // When a message arrives, console.log it
    this.mqttClient.on('message', function (topic, message) {
      console.log(message.toString());
    });

    this.mqttClient.on('close', () => {
      console.log(`mqtt client disconnected`);
    });
  }

  // Sends a mqtt message
  sendMessage(topic: string, message: string) {
    this.mqttClient.publish(topic, message);
  }
}

export { MqttHandler }
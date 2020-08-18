// To collect ruuvitag measurements using ruuvistation gateway and ubuntu server
// https://github.com/vicanso/influxdb-nodejs
// RuuviStation does not send all fields, which are collected by ruuvicollector
// set http://<ip-address>:8080/ruuvigw as gateway in ruuvistation

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.post('/ruuvigw', (req, res) => {
    const Influx = require('influxdb-nodejs');

    data = req.body;    
    if (data.hasOwnProperty('tags')) {
        datat = data['tags']
        datarow = JSON.stringify(datat)
        dataa = datat[0]
        console.log('Got data:', dataa['updateAt'] + ': ' + dataa['temperature'] + ', ' + dataa['id']);
        mac_old = dataa['id']
        mac = mac_old.replace(/:/g, "")
    }
    else
        console.log('Got header:', data['time'] + ': ' + data['deviceId'] + ', ' + ', ' + data['batteryLevel']);

    const client = new Influx('http://127.0.0.1:8086/ruuvi')
//    const client = new Influx('http://user:pwd@127.0.0.1:8086/ruuvi?auth=basic');
    const fieldSchema = {
        absoluteHumidity: 'f',
        accelerationX: 'f',
        accelerationY: 'f',
        accelerationZ: 'f',
        batteryVoltage: 'f',
        dataFormat: 'i',
        measurementSequenceNumber: 'i',
        movementCounter: 'i',
        humidity: 'f',
        pressure: 'f',
        rssi: 'i',
        txPower: 'i',
        temperature: 'f',
//      updateAt: 's',                                                                                                         
    };
    const tagSchema = {
        mac: '*',
    };
    client.schema('ruuvi_measurements', fieldSchema, tagSchema, {
        stripUnknown: true,
    });
    client.write('ruuvi_measurements')
        .tag({
            mac: mac,
        })
        .field({
            absoluteHumidity: dataa['absoluteHumidity'],
            accelerationX: dataa['accelX'],
            accelerationY: dataa['accelY'],
            accelerationZ: dataa['accelZ'],
            batteryVoltage: dataa['voltage'],
            dataFormat: dataa['dataFormat'],
            measurementSequenceNumber: dataa['measurementSequenceNumber'],
            movementCounter: dataa['movementCounter'],
            humidity: dataa['humidity'],
            pressure: dataa['pressure'],
            rssi: dataa['rssi'],
            txPower: dataa['txPower'],
            temperature: dataa['temperature'],
//          updateAt: dataa['updateAt'],                                                                                       
        })
        .then(() => console.info('write point success'))
        .catch(console.error);

    res.sendStatus(200);
});

app.listen(8080, () => console.log(`Started server at http://localhost:8080!`));

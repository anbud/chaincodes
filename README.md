# Example chaincodes

## Description
This repo contains two example chaincodes (`sensors` and `global`) that are used as a part of the development process.

## Global
Global chaincode is used to store topology data on the Hyperledger Fabric blockchain.

### Methods
- `initLedger(identifier, initialState)`: Invoked when the ledger is initialized. `identifier` should be unique and `initialState` is the first topology in JSON format.
- `insert(identifier, newState)`: Invoked when the topology has been modified. Stores the new topology on the blockchain. `identifier` is unique and `newState` is the new topology in JSON format.
- `delete(identifier)`: Deletes the topology related to the unique `identifier`.
- `query(identifier)`: Fetch the latest topology related to the unique `identifier`

## Sensors
Sensors chaincode is used to store sensor data on the Hyperledger Fabric Blockchain.

### Methods
- `querySensor(sensorId)`: Returns the latest stored data from `sensorId`.
- `initLedger(owner)`: Initializes a dummy sensors when the ledger is initialized. `owner` is the owner of the sensor.
- `createSensor(sensorId, owner, make, model)`: Creates a new sensor on the blockchain. `sensorId` should be unique, `owner` is the owner of the sensors, `make` and `model` are related to sensor's type.
- `queryAllSensors()`: Returns latest data from all available sensors.
- `changeSensorValue(sensorId, newData)`: Stores new sensor data on the blockchain. 
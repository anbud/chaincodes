const shim = require('fabric-shim')
const util = require('util')

const Chaincode = class {
    async Init(stub) {
        await stub.putState('Init', Buffer.from('OK'))
        
        return shim.success()
    }

    async Invoke(stub) {
        let ret = stub.getFunctionAndParameters()
        
        let method = this[ret.fcn]
        
        if (!method) {
            return shim.error(`${ret.fcn} not found.`)
        }

        try {
            let payload = await method(stub, ret.params)
            
            return shim.success(payload)
        } catch (err) {
            return shim.error(err)
        }
    }

    async querySensor(stub, args) {
        if (args.length != 1) {
            throw new Error(`Expecting 1 param (sensor number), got ${args.length}.`)
        }

        let value = await stub.getState(args[0])
        
        if (!value) {
            throw new Error(JSON.stringify({
                error: `State for ${args[0]} doesn't exist.`
            }))
        }

        return value
    }

    async initLedger(stub, args) {
        if (args.length != 1) {
            throw new Error(`Expecting 1 param (gateway name), got ${args.length}.`)
        }

        let sensors = [{
            make: 'Test',
            model: 'Test',
            timestamp: new Date(),
            owner: args[0],
            value: 'init'
        }] // add other sensors for init here...
    
        sensors.forEach((i, ind) => {
            i.type = 'sensor'

            await stub.putState(`Sensor${ind}`, Buffer.from(JSON.stringify(i)))
        })
    }

    async createSensor(stub, args) {
        if (args.length != 4) {
            throw new Error(`Expecting 4 params, got ${args.length}.`)
        }

        await stub.putState(args[0], Buffer.from(JSON.stringify({
            type: 'sensor',
            make: args[2],
            model: args[3],
            timestamp: new Date(),
            owner: args[1],
            value: 'init'
        })))
    }

    async queryAllSensors(stub, args) {
        let iterator = await stub.getStateByRange('Sensor0', 'Sensor999')

        let results = []
        while (true) {
            let res = await iterator.next()

            if (res.value && res.value.value.toString()) {
                let jsonRes = {}

                jsonRes.Key = res.value.key
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'))
                } catch (err) {
                    jsonRes.Record = res.value.value.toString('utf8')
                }
                
                results.push(jsonRes)
            }
            
            if (res.done) {
                await iterator.close()

                return Buffer.from(JSON.stringify(results))
            }
        }
    }

    async changeSensorValue(stub, args) {
        if (args.length != 2) {
            throw new Error(`Expecting 2 params, got ${args.length}.`)
        }
 
        let sensor = JSON.parse(await stub.getState(args[0]))
        
        sensor.value = args[1]
        sensor.timestamp = new Date() 

        await stub.putState(args[0], Buffer.from(JSON.stringify(sensor)))
    }
}

shim.start(new Chaincode())

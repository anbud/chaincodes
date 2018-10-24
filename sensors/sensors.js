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

        await stub.putState(`Sensor0`, Buffer.from(JSON.stringify({
            make: 'Dummy',
            model: 'Dummy',
            timestamp: new Date().getTime(),
            owner: args[0],
            value: 'init',
            type: 'sensor'
        })))

        return shim.success()
    }

    async createSensor(stub, args) {
        if (args.length != 4) {
            throw new Error(`Expecting 4 params, got ${args.length}.`)
        }

        await stub.putState(args[0], Buffer.from(JSON.stringify({
            type: 'sensor',
            make: args[2],
            model: args[3],
            timestamp: new Date().getTime(),
            owner: args[1],
            value: 'init'
        })))

        return Buffer.from('OK')
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
        sensor.timestamp = new Date().getTime()

        await stub.putState(args[0], Buffer.from(JSON.stringify(sensor)))

        return Buffer.from('OK')
    }
}

shim.start(new Chaincode())

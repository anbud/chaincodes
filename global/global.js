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

    async insert(stub, args) {
        if (args.length != 2) {
            throw new Error(`Expecting 2 params, got ${args.length}.`)
        }
        
        await stub.putState(args[0], Buffer.from(JSON.stringify({
            state: args[1]
        })))
        
        return shim.success()
    }

    async delete(stub, args) {
        if (args.length != 1) {
            throw new Error(`Expecting 1 param, got ${args.length}.`)
        }

        await stub.deleteState(args[0]);
    }

    async query(stub, args) {
        if (args.length != 1) {
            throw new Error(`Expecting 1 param (gateway id), got ${args.length}.`)
        }

        let value = await stub.getState(args[0])
        
        if (!value) {
            throw new Error(JSON.stringify({
                error: `State for ${args[0]} doesn't exist.`
            }))
        }

        return value
    }
}

shim.start(new Chaincode())

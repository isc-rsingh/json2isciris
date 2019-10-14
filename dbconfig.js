/**
 * Creates a Document database in ISC IRIS and 
 * creates the properties defined in a config file 
 */
var fs = require('fs')
var axios = require('axios')
var config = require('config')

var HOST = config.get('dbConfig.host')
var PORT = config.get('dbConfig.port')
var DBNAMESPACE = config.get('dbConfig.namespace')
var DBNAME = config.get('dbConfig.dbname')

const api = axios.create({
    baseURL: HOST + ":" + PORT + "/api/docdb/v1/" + DBNAMESPACE,
    timeout: 10000
})

// create the properties
function createProperties() {
    var fn = config.get("schemaFileName")
    var fdata = fs.readFileSync(fn)
    var propertyNames = JSON.parse(fdata)

    for (var prop in propertyNames) {
        let proptype = Object.keys(propertyNames[prop])[0]
        // let proptype = "%" + keyname.replace(/^./, keyname[0].toUpperCase())
        let url = "/prop/"+DBNAME+"/"+prop+"?type="+proptype+"&path=$."+prop+"&unique=0"
        // let url = `/prop/{DBNAME}`
        api.post(url, {})
            .then(function (response) {
                console.log("\nurl: " + url)
                console.log("status: " + response.status)
                console.log("data: " + JSON.stringify(response.data))
            })
            .catch(function (error) {
                console.log("\nError: " + JSON.stringify(error.message))
                console.log("url: " + url)
            });
    }
}

//// write schema to IRIS ////
api.delete("/db/"+DBNAME)                       // delete the database
    .then((response) => {
        console.log("status: " + response.status)
        console.log("data: " + JSON.stringify(response.data))
    })
    .catch((error) => {
        console.log(error)
    })
    .finally(() => {                            // create the database
        api.post("/db/"+DBNAME+"?type=documentType", {})
            .then(function (response) {
                console.log("status: " + response.status)
                console.log("data: " + JSON.stringify(response.data))
                createProperties()              // create indexed properties
            })
            .catch(function (error) {
                console.log("error: " + JSON.stringify(error.message))
            });
    });


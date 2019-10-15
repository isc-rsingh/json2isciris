/**
 * Writes JSON objects to the database by reading in a JSON file 
 * identified in the config file as `dataFileName`, finding 
 * an array of objects identified in the config file as having 
 * the name `arrayName`, and iterating through them.
 */
var axios = require('axios')
var fs = require('fs')
var config = require('config')

var HOST = config.get('dbConfig.host')
var PORT = config.get('dbConfig.port')
var DBNAMESPACE = config.get('dbConfig.namespace')
var DBNAME = config.get('dbConfig.dbname')

const api = axios.create({
    baseURL: HOST + ":" + PORT + "/api/docdb/v1/" + DBNAMESPACE,
    timeout: 10000, 
    auth: {
        username: config.get('dbConfig.username'),
        password: config.get('dbConfig.password')
    },
    headers: {'Content-Type': 'application/json'}
})

var fn = config.get("dataFileName")
var fdata = fs.readFileSync(fn)
var data = JSON.parse(fdata)

var arrayName = config.get("arrayName")

data[arrayName].forEach(item => {
    api.post("/doc/"+DBNAME+"/", item)
    .then(function (response) {
        console.log("status: " + response.status)
        console.log("data: " + JSON.stringify(response.data))
    })
    .catch(function (error) {
        console.log(error)
    });    
});

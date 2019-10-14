/**
 * Discover all the data types in a JSON data file.
 */
var fs = require('fs')

var MAXITEMS = config.get('maxItems')
var MINTHRESHOLD = config.get('minThreshold')

var fn = config.get('dataFileName')
var fdata = fs.readFileSync(fn)
var data = JSON.parse(fdata)

var arrayName = config.get("arrayName")
var itemCount = 0
var itemslength = data[arrayName].length

var propertyNames = extractProperties()
console.log("\nextractProperties:")
console.log("propertyNames: ")
console.log(propertyNames)
console.log("itemCount: " + itemCount)

aggregateNumericProperties()
console.log("\naggregateNumericProperties:")
console.log(propertyNames)

preferPrevalentProperty()
console.log("\npreferPrevalentProperty:")
console.log(propertyNames)

pruneUncommonProperties()
console.log("\npruneUncommonProperties:")
console.log(propertyNames)


outfileName = config.get("schemaFileName")
fs.writeFileSync(outfileName, JSON.stringify(propertyNames), 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
 
    console.log("JSON file has been saved.");
}); 

/**
 * Remove properties that were found < MINTHRESHOLD of the time
 */
function pruneUncommonProperties() {
    for (var prop in propertyNames) {
        let key = Object.keys(propertyNames[prop])[0] // there should be only 1 key now
        if ( propertyNames[prop][key] < (itemCount * MINTHRESHOLD) ) {
            delete propertyNames[prop]
        }
    }    
}

 /**
 * If multiple types found, choose the most common one -- highest # wins
 */
function preferPrevalentProperty() {
    for (var prop in propertyNames) {
        let proptypes = []
        for (var type in propertyNames[prop]) {
            proptypes.push(type)
        }
        if ( proptypes.length > 1 ) {
            let maxtype = 0
            for ( var type in propertyNames[prop]) {
                if ( propertyNames[prop][type] > maxtype ) {
                    maxtype = propertyNames[prop][type]
                } else {
                    delete propertyNames[prop][type]
                }
            }
        }
    }    
}

/**
 * Clean up the classification of properties, if decimals and integers found, choose 1 
 * and aggregate the counts to the chosen one.
 */
function aggregateNumericProperties() {
    for (var prop in propertyNames) {
        let proptypes = []
        for (var type in propertyNames[prop]) {
            proptypes.push(type)
        }
        if ( proptypes.indexOf('%Integer')>-1 && proptypes.indexOf('%Numeric')>-1 ) {
            let intcount = propertyNames[prop]['%Integer']
            let deccount = propertyNames[prop]['%Numeric']
            if ( deccount > intcount ) {
                propertyNames[prop]['%Numeric'] += intcount
                delete propertyNames[prop]['%Integer']
            } else {
                propertyNames[prop]['%Integer'] += deccount
                delete propertyNames[prop]['%Numeric']
            }
        }
    }    
}

function extractProperties() {
    var itemslength = data[arrayName].length
    var propnames = {}
    for (let i=0; i<itemslength; i++) {
        itemCount++
        if ( itemCount > MAXITEMS ) return
        
        let item = data[arrayName][i]
    
        for (let prop in item) {
            let t = typeof item[prop]
            console.log("TYPE: "+t)
            if ( t == 'number' ) {
                if ( item[prop] == parseInt(item[prop]) ) {
                    t = '%Integer'
                } else {
                    t = '%Numeric'
                }
            }
            else if ( t == 'boolean' ) {
                t = '%Boolean'
            }
            else {
                t = '%VarString'
            }
    
            if ( !propnames.hasOwnProperty(prop) ) { // property hasn't been found yet
                propnames[prop] = {}
                propnames[prop][t] = 1
            } else {                                 // property already exists
                if ( propnames[prop][t] ) {          // property also already has this type
                    propnames[prop][t] = propnames[prop][t] + 1
                } else {
                    propnames[prop][t] = 1
                }
            }
        }
    }
    return propnames
}


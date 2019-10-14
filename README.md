# JSON IN

This suite of Node.js utilities automates the process of creating a JSON document database in InterSystems IRIS. It:

1. Takes data in a JSON file and inspects it to discover the data types (`types.js`)
2. Creates a new document database and schema in InterSystems IRIS (`dbconfig.js`)
3. Imports the data into the new database (`import.js`)

## Setup

### Node module installation

```sh
prompt> npm install
```

### Configuration file

These programs require a configuration file named `default.json` located in the `config` folder with a property called "dataFileName" whose value is the JSON data file name (relative to the location of `types.js`).

Here is a complete example `config/default.json`:

```JavaScript
{
    "dbConfig": {
        "host": "http://localhost",
        "port": "52773",
        "namespace": "USER",
        "dbname": "mydatabasename"
    },
    "dataFileName": "sample.json",
    "arrayName": "people",
    "schemaFileName": "schema.json",
    "maxItems": 10,
    "minThreshold": 0.2
}
```

- **host:** host name where InterSystems IRIS resides
- **port:** port of which InterSystems IRIS communicates
- **namespace:** InterSystems IRIS namespace
- **dbname:** InterSystems IRIS database name
- **dataFileName:** JSON file name
- **arrayName:** The JSON property that contains an array of data objects that will be imported
- **maxItems:** number of data objects to sample when figuring out the schema (if you know your data is clean and every object has the same schema, set this to 1)
- **minThreshold:** Proportion of properties that must have this data type in order to be kept. For example, if you want properties that have 91% strings and 9% integers to be considered strings, set this to 0.1 (10%)

## `types.js`

This program inspects the data in a JSON file and figures out what data types it contains. It outputs a configuration file whose name is defined by the schemaFileName property of `config/default.json`. This schema is used by `config.js` to set up the database. 

NOTES: 

- This utility process _all_ properties. If you have no need to search on all properties, remove the unneeded ones from the schema file before running `dbconfig.js`
- Currently, it only works with simple JSON files that do not contain arrays or nested properties.

### Requirements

1. A JSON data file
2. All configuration file properties except "dbConfig"

### Usage

```sh
prompt> node types.js
```

## `dbconfig.js`

Reads the schema file, creates the database and specifies those properties that should be indexed for search.

### Requirements

1. The schema file
2. The configuration file property "dbConfig"

### Usage

```sh
prompt> node dbconfig.js
```

## `import.js`

Imports the data into the database.

### Requirements

1. The schema file
2. The configuration file properties "dbConfig", "dataFileName" and "arrayName"

### Usage

```sh
prompt> node import.js
```
# Node Foreman

Node Foreman is a Node.js version of the popular Foreman tool,
with a few Node specific changes.

## Install

Install the command line tool

    $ npm install -g foreman

## Usage

Create a `Procfile` in the form of:
    
    web: node web_server.js
    api: node api_server.js
    log: node log_server.js

Optionally create a `.env` file to pre-load environmental variables:

    MYSQL_NAME=superman
    MYSQL_PASS=cryptonite

The equivalent `.env` file may alternatively be a valid JSON document:

    {
        "mysql":{
            "name": "superman",
            "pass": "cryptonite"
        }
    }

The above JSON document will be flattened into env variables by 
concatenating the nested values with an underscore.
Environmental variables are passed in fully capitalized.
There is no need to specify which type of file you wish to use.

Start your process with `nf` (node-foreman):

    $ nf start
    
    18:51:12: web.1     |  Web Server started listening on 0.0.0.0:5000
    18:51:13: api.1     |  Api Server started listening on 0.0.0.0:5100
    18:51:13: log.1     |  Log Server started listening on 0.0.0.0:5200

Your module directory should end up looking like the following:

    /
    ├─ .env
    ├─ package.js
    ├─ server.js
    ├─ Procfile

### Advanced Usage

Node Foreman lets you start multiple jobs of the same type:

    $ nf start web=5
    
    18:51:12: web.1     |  Web Server started listening on 0.0.0.0:5000
    18:51:12: web.2     |  Web Server started listening on 0.0.0.0:5001
    18:51:12: web.3     |  Web Server started listening on 0.0.0.0:5002
    18:51:12: web.4     |  Web Server started listening on 0.0.0.0:5003
    18:51:12: web.5     |  Web Server started listening on 0.0.0.0:5004

Each job will be started as its own process, receiving a different `PORT`
environmental variable. 
The port number for processes of the same type will be offset by 1.
The port number for processes of different types will be offset by 100.

    $ nf start web=2,api=2
    
    18:51:12: web.1     |  Web Server started listening on 0.0.0.0:5000
    18:51:12: web.2     |  Web Server started listening on 0.0.0.0:5001
    18:51:12: api.1     |  Api Server started listening on 0.0.0.0:5100
    18:51:12: api.2     |  Api Server started listening on 0.0.0.0:5101

## Export

Node Foreman is designed to be in a development environment,
however it can export an Upstart job for use in production.
The Upstart file has _no_ dependency on Node Foreman.

    $ nf export upstart -a JOBNAME /etc/init

Start and stop your jobs with

    $ sudo start JOBNAME
    $ sudo stop JOBNAME


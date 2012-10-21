# Node Foreman

Node Foreman is a Node.js version of the popular Foreman tool,
with a few Node specific changes.

## Install

Install the command line tool

    npm install -g foreman

## Usage

Create a `Procfile` in the form of:
    
    web: node server.js

Optionally create a `.env` file to pre-load environmental variables:

    MYSQL_NAME=superman
    MYSQL_PASS=cryptonite

Start your process with `nf` (node-foreman):

    nf start

### Advanced Usage

Node Foreman lets you start multiple jobs of the same type:

    nf start web=5

Each job will be started as its own process, receiving a different `PORT`
environmental variable.

## Export

Node Foreman is designed to be in a development environment,
however it can export an Upstart job for use in production.
The Upstart file has _no_ dependency on Node Foreman.

    nf export upstart -a JOBNAME /etc/init


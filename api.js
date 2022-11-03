// java -cp "tsunami-main-0.0.15-SNAPSHOT-cli.jar:plugins/*" -Dtsunami.config.location=tsunami.yaml com.google.tsunami.main.cli.TsunamiCli --ip-v4-target=127.0.0.1 --scan-results-local-output-format=JSON --scan-results-local-output-filename=tmp/tsunami-result.json &> tmp/stdout.txt


const express = require('express')
const app = express()
const cors = require('cors')

var fs = require('fs');

require.extensions['.log'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

const corsOpts = {
    origin: '*',
  
    methods: [
      'GET',
      'POST',
    ],
  
    allowedHeaders: [
      'Content-Type',
    ],
  };
  
  app.use(cors(corsOpts));


const { exec } = require("child_process");

app.get('/scan/:url', (req,res) => { 
    const hostname = req.params.url;
    const logging = fs.createWriteStream('tmp/stdout.log', { flags: 'a' });
    const launchTsunami = exec(`java -cp 'tsunami-main-0.0.15-SNAPSHOT-cli.jar:plugins/*' -Dtsunami.config.location=tsunami.yaml com.google.tsunami.main.cli.TsunamiCli  --hostname-target='${hostname}' --scan-results-local-output-format=JSON --scan-results-local-output-filename=tmp/tsunami-result.json`);
    launchTsunami.stdout.pipe(logging);
    launchTsunami.stderr.pipe(logging);

    launchTsunami.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
        res.write(`<span>stdout:</span> ${data}`);
    });
    
    launchTsunami.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
        res.write(`<div>stderr:</div> ${data}`);
    });
    
    launchTsunami.on('error', (error) => {
        console.log(`error: ${error.message}`);
        res.write(`<span>error: ${error.message}</span>`);
    });
    
    launchTsunami.on("close", code => {
        console.log(`execution done`);
        res.end();
    });
})

app.get('/get-scan-result', (req,res) => { 
    const scanResult = require("./tmp/tsunami-result.json")
    res.status(200).json(scanResult) 
})
app.get('/get-scan-output', (req,res) => { 
    const scanOutput = require('./tmp/stdout.log')
    res.status(200).json(scanOutput) 
})


const PORT = process.env.PORT || 3030;

app.listen(PORT, () => console.log('server started'))
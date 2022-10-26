// java -cp "tsunami-main-0.0.15-SNAPSHOT-cli.jar:plugins/*" -Dtsunami.config.location=tsunami.yaml com.google.tsunami.main.cli.TsunamiCli --ip-v4-target=127.0.0.1 --scan-results-local-output-format=JSON --scan-results-local-output-filename=tmp/tsunami-result.json &> tmp/stdout.txt

const express = require('express')
const app = express()

var fs = require('fs');

require.extensions['.txt'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

// function setHeaders(req, res, next) {
//     res.set({
//         'cache-control' : 'max-age=0, no-cache, no-store',
//         'expires': 0,
//         'pragma': 'no-cache'
//     })
//     next();
// }

// app.use(setHeaders);

const { exec } = require("child_process");

app.get('/scan/:url', (req,res) => { 
    const hostname = req.params.url;
    const launchTsunami = exec(`java -cp 'tsunami-main-0.0.15-SNAPSHOT-cli.jar:plugins/*' -Dtsunami.config.location=tsunami.yaml com.google.tsunami.main.cli.TsunamiCli  --hostname-target='${hostname}' --scan-results-local-output-format=JSON --scan-results-local-output-filename=tmp/tsunami-result.json &> tmp/stdout.txt`);
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
    const scanOutput = require('./tmp/stdout.txt')
    res.status(200).send(scanOutput) 
})


const PORT = process.env.PORT || 3030;

app.listen(PORT, () => console.log('server started'))
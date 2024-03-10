const {v4 : uuid} = require('uuid');

let runScript = (args) => {
    // Arguments for running the script - first is the script itself
    childArgs = [];
    childArgs.push('/root/run-script.py');
    childArgs.push(args);

    return new Promise(function(success, nosuccess) {
        // Spawn the script asynchronously
        const { spawn } = require('child_process');
        const script = spawn('python3', childArgs);

        script.stdout.on('data', function(data) {
            success(data);
        });

        script.stderr.on('data', (data) => {
            nosuccess(data);
        });

        script.on('error',(err) => {
            console.log('Failed executing the script' + err);
            nosuccess(err);
        });
})};

// Process the POST request
module.exports = async (req, res) => {
    const item = {
        id: uuid(),
        name: req.body.name,
        when: Date.now(),
        completed: false,
    };

    // Include the unique value for eaxh script call to keep them straight
    args = [];
    args.push(item.id);
    args.push(item.when);

    // Pull data fromt the request
    let pdata = req.body;
    args.push(pdata.bob);

    // Pass the request data back to the client for checking
    item['pdata'] = pdata;

    // Run the script
    runScript(args).then(function(fromScript) {
        console.log(fromScript.toString());
        res.end(fromScript);
    });

    // Return the results to the client
    item.completed = true;
    res.send(item);
};



const express = require('express');
const app = express();
const startScript = require('./routes/startScript');

app.use(express.json());

app.post('/start', startScript);

app.listen(3000, () => console.log('Listening on port 3000'));

const gracefulShutdown = () => {
   process.exit();
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon

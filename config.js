// config.js

// Require mongoose
var mongoose = require('mongoose');

// Declare an empty config object
var config = {};

// Collect app config environment variables
config.port = 8080;
config.host = 'yog';

// Collect related service environment variables
config.mongoUri = `yog-db:27017`;
config.mongoDatabase = process.env.MONGODB_DATABASE || 'yogdb';
// Collect passwords
// Set default mqtt user and pass
config.mongoUser = process.env.MONGO_USER || 'yog';
config.mongoPass = process.env.MONGO_PASS || 'yog';

// Get relevant secrets from the secrets volume if it exists
try {
  config.mongoUser = fs.readFileSync('/etc/secret-volume/mongo-username');
  config.mongoPass = fs.readFileSync('/etc/secret-volume/mongo-password');
} catch (ex) {
  console.log(`Something went wrong while attempting to access secrets-volume\n${ex}
    \nContinuing...`);
}

// Create URI with mongoddb username and password
config.mongoUri =
  `mongodb://${config.mongoUser}:${config.mongoPass}@${config.mongoUri}/${config.mongoDatabase}`;
// Set options for reconnect
config.mongoOptions = {
  server:
    {
        // sets how many times to try reconnecting
        reconnectTries: Number.MAX_VALUE,
        // sets the delay between every retry (milliseconds)
        reconnectInterval: 1000
    },
    config: { autoIndex: false }
};
// Instantiate the mongodb connection
config.db = mongoose.connect(config.mongoUri, config.mongoOptions).connection;
// Define a connection error event listener
config.db.on('error', (err) => {
  console.log(`An error occured while interfacing with mongodb: ${err}`);
});
// Define a connection open event listener
config.db.once('open', () => {
  console.log(`Mongoose connected to mongodb @ ${config.mongoUri}`);
});

// Set reductionDT
config.reductionDT = process.env.REDUCTION_DT || 2500;
// Set kubernetes API polling dt
config.kubePollingDT = process.env.KUBE_POLLING_DT || 2500;

// Export the config object as an unnamed object
module.exports = config;

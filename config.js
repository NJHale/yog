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
config.mongoUser = process.env.MONGO_USER || 'nodejs';
config.mongoPass = process.env.MONGO_PASS || 'nodejs';

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

// Set kubernetes API info
config.kubeAPIURL = process.env.KUBE_API_URL || 'https://master-paas-dev-njrar-01.ams1907.com';
config.kubeAuthToken = process.env.KUBE_AUTH_TOKEN ||

'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZXZvcHNkYXNoLWRldmVsb3AiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlY3JldC5uYW1lIjoiY2x1c3Rlci1yZWFkZXItdG9rZW4tNzl5cnUiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiY2x1c3Rlci1yZWFkZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiI5ZWNkY2QzMy0zNWFmLTExZTctOTAzOS0wMDUwNTZhOTg3NjAiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6ZGV2b3BzZGFzaC1kZXZlbG9wOmNsdXN0ZXItcmVhZGVyIn0.bxm3kPyBdCKxcSFR231SnyVBbz-5weEbLjjeQ4YotWP1O9OzvwaptH09Cxd-CXWCH-UTBGvMTITBCJlWHh4JeYllHzmrPuiTkZuN79cYJMa1-294T2LuXF0lxNh1FH9HiqZNhUP_PYGIVTsdGmqPqfOpHGmB1fTrvQTj5DLwoB3KppSHspa_Rh-5MIJQV5f44v7EC3qujfe6ZoVqdqy7105MLElgkK16SHNqkz6B45gpsga1eeqqigdBPxLez2Abv5_sG4tJOZ6ih20wz9nGmg_uRd5fJt5kxsj5DbSFfxW5K-EM7u6i8lVKri4FCPGECZLmfeuquAIkGhU5J4aFRw';
// Set kubernetes API polling dt
config.kubePollingDT = process.env.KUBE_POLLING_DT || 25000;

// Set reductionDT
config.reductionDT = process.env.REDUCTION_DT || 25000;

// Set the collector names
config.collectorNames = ['UtilizationCollector'];


// Export the config object as an unnamed object
module.exports = config;

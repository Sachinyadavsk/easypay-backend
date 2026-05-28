const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Easypay API',
    description: 'A simple clone backend for PhonePe features (Auth, Send Money, History)',
  },
  host: 'localhost:5000',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Enter token in format (Bearer <token>)'
    }
  },
  security: [ { bearerAuth: [] } ]
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js']; // Root file is all that is needed

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    console.log("Swagger JSON generated!");
});

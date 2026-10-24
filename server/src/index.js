const app = require('./app');
const { port, clientOrigin } = require('./config');

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port} (accepting ${clientOrigin})`);
});

const express = require('express');
const port = 4000;
const path = require('path')
const bodyParser = require('body-parser');
const Routes = require('./Routes/Cart')

const app = express();
const Route = require('./Routes/Cart')

app.use('/', Routes);
app.listen(port, () => {
    console.log("backend : Connected to " + port);
})
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 8765;

const logger = fs.createWriteStream('log.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
})

app.use(express.static(__dirname));
app.use(bodyParser.text());


app.post('/log', (req, res) => {
    logger.write(req.body + '\n');
    res.send('OK');
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
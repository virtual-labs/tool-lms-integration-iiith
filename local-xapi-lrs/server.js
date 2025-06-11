const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const port = 8000;

app.use(cors()); // <--- ADD THIS LINE
app.use(bodyParser.json({ type: 'application/json' }));

app.post('/xapi/statements', (req, res) => {
  const statement = req.body;
  const id = uuidv4();
  const dir = './statements';
  const filename = `${dir}/${id}.json`;

  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  fs.writeFile(filename, JSON.stringify(statement, null, 2), (err) => {
    if (err) return res.status(500).send('Error saving statement');
    res.status(200).json({ id });
  });
});

app.listen(port, () => {
  console.log(`🚀 LRS running at http://localhost:${port}/xapi/statements`);
});

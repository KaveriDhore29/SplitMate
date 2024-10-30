<<<<<<< HEAD
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/api/login', (req, res) => {
  const data = req.body;
  console.log(data);
  // Handle request and respond
  res.redirect('http://localhost:4200/dashboard/');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
=======
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/api/login', (req, res) => {
  const data = req.body;
  console.log(data);
  // Handle request and respond
  res.redirect('http://localhost:4200/dashboard/');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
>>>>>>> 262592e2fd87c26a745497f5b4a988aafd7d7002

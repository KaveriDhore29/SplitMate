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

const express = require('express');
const dotenv = require('dotenv');
const connectDatabase = require('./data/database');
const cors = require('cors');
const { loginControl } = require('./controllers/users');
const { isAuthenticated } = require('./middlewares/auth');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');


const app = express();

// to use node version 20.16.0
// source ~/.nvm/nvm.sh
// nvm use 20.16.0

app.use(express.json()); //to use express
dotenv.config(); //to use .env file
connectDatabase(); //connect to DB
app.use(cookieParser());
// Middleware to parse urlencoded data
app.use(bodyParser.urlencoded({ extended: true }));

//CORS compatibility
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
}));

app.get('/', (req, res) => {
  res.send('Hello World!');
})

// app.post('/api/login', (req, res) => {
//   const data = req.body;
//   console.log(data);
//   // Handle request and respond
//   // res.redirect('http://localhost:4200/dashboard/');
// });

app.post('/api/login', loginControl);


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

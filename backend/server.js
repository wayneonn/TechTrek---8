const express = require('express');
const dotenv = require('dotenv');
var cors = require("cors");
const { router: authRoute, authenticate } = require('./routes/auth');
const app = express();
app.use(express.json());

//Environment Variables
dotenv.config()
const port = process.env.PORT;

//CORS
const allowedOrigins = [
    "http://localhost:5173", "*"
  ];
app.options('*', cors());
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        } else {
        console.log("Origin is " + origin)
        callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
    credentials: true
}));

//Routes
app.use('/api/auth', authRoute)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.post('/protected', authenticate, (req, res) => {
    res.status(200).json({
        message: `Welcome, user!`,
    });
});

app.get('/', (req, res) => {
    res.send('Server is working');
});


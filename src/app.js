const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const session = require('express-session');
const QRCode = require('qrcode');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your_secret_key'; // Replace with an environment variable in production

// Middleware
app.use(bodyParser.json());
app.use(helmet()); // Security middleware
app.use(session({
    secret: 'your_session_secret', // Replace with an environment variable in production
    resave: false,
    saveUninitialized: true,
}));

// Dummy user for demonstration
const users = [{ username: 'admin', password: 'password' }]; // Replace with database logic

// Authentication endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        req.session.token = token;
        return res.json({ token });
    }
    
    return res.status(401).json({ message: 'Invalid credentials' });
});

// QR Code Generation
app.post('/generate-qrcode', (req, res) => {
    const { url } = req.body;
    QRCode.toDataURL(url, (err, src) => {
        if (err) return res.status(500).json({ message: 'Error generating QR code' });
        res.json({ qrCode: src });
    });
});

// Middleware to authenticate JWT token
const authenticateJWT = (req, res, next) => {
    const token = req.session.token;
    if (token) {
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Protected route example
app.get('/protected', authenticateJWT, (req, res) => {
    res.send(`Hello ${req.user.username}, this is protected data.`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs/promises');

const app = express();
const secretKey = 'aVerySecureAndRandomKey123!@#$'; // Replace with your own secret key
const usersFilePath = 'users.json';

app.use(bodyParser.json());

// Load users from file or initialize an empty array
let users = [];
try {
    users = require(`./${usersFilePath}`);
} catch (err) {
    console.error('Error loading users file. Initializing with an empty array.');
}

// Register a new user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Both username and password are required' });
    }

    // Check if the user already exists
    if (users.some(user => user.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = { username, password };
    users.push(newUser);

    // Save updated users to file
    await fs.writeFile(usersFilePath, JSON.stringify(users));

    res.json({ message: 'User registered successfully' });
});

// Login and generate JWT token
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Both username and password are required' });
    }

    // Check if the user exists
    const user = users.find(user => user.username === username);

    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create and send JWT token
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    res.json({ token });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
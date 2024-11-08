const express = require('express');
const path = require('path');

const app = express();

app.get('/thoughts/:id-*', (req, res) => {
    res.sendFile(path.join(__dirname, 'thoughts.html'));
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
}); 
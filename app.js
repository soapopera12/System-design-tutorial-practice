const http = require('http');
const url = require('url');
const fs = require('fs');
const mongoose = require('mongoose');

// Connect to your MongoDB Atlas cluster
// replace <password> with actual pass
const atlasConnectionStr = 'mongodb+srv://teslappop:<password>@cluster0.xxz7v27.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(atlasConnectionStr, { useNewUrlParser: true, useUnifiedTopology: true });

// Define a Mongoose schema for your 'texts' collection
const textSchema = new mongoose.Schema({
  text: String,
});

// Create a Mongoose model based on the schema
const Text = mongoose.model('Text', textSchema);

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  if (path === '/') {
    // Serve the HTML file
    fs.readFile(__dirname + '/index.html', 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else if (path === '/submitText' && req.method === 'POST') {
    // Handle the POST request for submitting text
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const parsedBody = JSON.parse(body);
        const textData = parsedBody.textData;

        // Create a new document using the Mongoose model
        const newText = new Text({ text: textData });

        // Save the document to MongoDB
        const savedText = await newText.save();

        // Send a response back to the client
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Text saved with ID: ${savedText._id}` }));
      } catch (error) {
        console.error('Error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });
  } else {
    // Handle other routes...
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

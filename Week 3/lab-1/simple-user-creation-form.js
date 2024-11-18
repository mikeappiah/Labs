const express = require('express');

const bodyParser = require('body-parser');

const app = express();

/* parses incoming requests that have a HTTP Content-Type Header of "application/x-www-form-urlencoded". 
The extended property limits what type of data can be parsed (false means only strings and arrays).*/
app.use(bodyParser.urlencoded({ extended: true }));

// Array to store list of users
const users = [];

// Route to access homepage
app.get('/', (req, res) => {
  res.status(200).send(`
     <h1>Welcome!</h1>
    <form action="/create-user" method="POST">
        <input type="text" name="username" placeholder="Enter username" />
        <button type="submit">Submit</button>
    </form>
    <a href='/users'>All users</a>
    `);
});

// Route to access '/users' page
app.get('/users', (req, res) => {
  // Create an li element for each user and join into a string body
  const usersList = users.map((user) => `<li>${user}</li>`).join('');

  res.status(200).send(`
        <h1>List of users</h1>
        <ul>
           ${usersList}
        </ul>
  `);
});

// Route to create a user
app.post('/create-user', (req, res) => {
  // Access username from form in request body
  const { username } = req.body;
  console.log(username);

  // Add to list of users
  users.push(username);

  // Redirect to homepage
  res.redirect('/');
});

// Handle routes not implemented
app.all('*', (req, res, next) => {
  res.status(404).send('<h1>404 - Page Not Found</h1>');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

const express = require('express');

const app = express();

app.use(express.urlencoded({ extended: false }));

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
  if (users.length === 0) {
    res.send('<h1>No users have been created yet.</h1>');
  } else {
    // Create an li element for each user and join into a string body
    const usersList = users.map((user) => `<li>${user}</li>`).join('');

    res.status(200).send(`
        <h1>List of users</h1>
        <ul>
           ${usersList}
        </ul>
  `);
  }
});

// Route to create a user
app.post('/create-user', (req, res) => {
  // Access username from form in request body
  const { username } = req.body;

  // Log username to the console
  console.log(`New user created: ${username}`);

  // Add to list of users
  users.push(username);

  // Redirect back to homepage
  res.redirect('/');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('<h1>Something went wrong!</h1>');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

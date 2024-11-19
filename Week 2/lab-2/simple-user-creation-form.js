const http = require('http');

// Array to store list of users
const users = ['Matthew', 'Mark', 'Luke', 'John'];

const server = http.createServer((req, res) => {
	const { method, url } = req;

	if (url === '/' && method === 'GET') {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(`
            <h1>Welcome!</h1>
            <form action="/create-user" method="POST">
                <input type="text" name="username" placeholder="Enter username" />
                <button type="submit">Submit</button>
            </form>
        `);
	} else if (url === '/users' && method === 'GET') {
		res.writeHead(200, { 'Content-Type': 'text/html' });

		res.end(`
            <h1>List of users</h1>
            <ul>
             ${users.map((user) => `<li>${user}</li>`).join('')}
            </ul>
        `);
	} else if (url === '/create-user' && method === 'POST') {
		let body = [];

		req.on('data', (chunk) => {
			body.push(chunk);
		}); // process chunk of data

		req.on('end', () => {
			// parse request body
			const parsedBody = Buffer.concat(body).toString();

			// extract username from parsed body
			const username = parsedBody.split('=')[1];

			console.log(`New user created: ${username}`);

			res.writeHead(302, { Location: '/' }); // Redirect to homepage
			res.end();
		});
	} else {
		// 404 Route
		res.writeHead(404, { 'Content-Type': 'text/html' });
		res.end('<h1>404 - Page Not Found</h1>');
	}
});

server.listen('3000', '127.0.0.1', () => {
	console.log('Server is running at http://localhost:3000');
});

const http = require('http');

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
                <li>User 1</li>
                <li>User 2</li>
                <li>User 3</li>
            </ul>
        `);
	} else if (url === '/create-user' && method === 'POST') {
		// Create user route

		let body = '';

		req.on('data', (chunk) => {
			body += chunk.toString();
		}); // process chunk of data

		req.on('end', () => {
			const params = new URLSearchParams(body); // Parse the form data
			const username = params.get('username'); // Extract the username
			console.log(`New user created: ${username}`);

			res.writeHead(302, { Location: '/' }); // Redirect to Home
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

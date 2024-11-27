import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { body } from 'express-validator';
import {
  getForm,
  shortenURL,
  redirectToOriginalURL,
} from './controllers/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Route to display main page and url submission form
app.get('/', getForm);

// Validation with express-validator middleware
const createURLChain = () =>
  body('longURL')
    .trim()
    .isURL({
      require_protocol: true,
      require_valid_protocol: true,
    })
    .withMessage('Invalid URL. Please include http:// or https://');

// Route to handle URL shortening
app.post('/shorten', createURLChain(), shortenURL);

// Route to handle redirection to original URL
app.get('/:shortCode', redirectToOriginalURL);

// For unhandled routes
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Page Not Found',
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

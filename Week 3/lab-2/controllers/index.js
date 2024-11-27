import { validationResult, matchedData } from 'express-validator';
import generateShortCode from '../utils/generateShortCode.js';

// Temporary container to store URL mappings
const urlMappings = [];

// Controller to handle rendering the form
export const getForm = (req, res) => {
  res.render('home', {
    urls: urlMappings.slice(-5).reverse(), // get last 5 elements starting from last element
  });
};

// Controller to shorten the URL
export const shortenURL = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    const shortCode = generateShortCode();
    const { longURL } = matchedData(req);

    // check if URL is already found in the storage
    const existingURL = urlMappings.find((url) => url.longURL === longURL);

    // Only push to storage if URL doesn't exist
    !existingURL && urlMappings.push({ longURL, shortCode });

    // Redirect back to homepage
    res.redirect('/');
  } else {
    // Access error message as provided by express-validator
    const message = result.array()[0].msg;

    res.render('error', {
      error: message,
    });
  }
};

// Controller to handle redirection from short code
export const redirectToOriginalURL = (req, res) => {
  const { shortCode } = req.params;

  const mapping = urlMappings.find((url) => url.shortCode === shortCode);

  if (!mapping) {
    return res.status(404).render('error', { message: 'Short code not found' });
  }

  res.redirect(mapping.longURL);
};

exports.createBookValidationSchema = {
  title: {
    notEmpty: {
      errorMessage: 'Book title cannot be empty',
    },
    isString: {
      errorMessage: 'Book title must be a string',
    },
  },
  author: {
    notEmpty: {
      errorMessage: 'Book author cannot be empty',
    },
    isString: {
      errorMessage: 'Book author must be a string',
    },
  },
  isbn: {
    notEmpty: {
      errorMessage: 'Book isbn cannot be empty',
    },
    isString: {
      errorMessage: 'Book isbn must be a string',
    },
  },
  copies: {
    notEmpty: {
      errorMessage: 'Book copies cannot be empty',
    },
    isInt: {
      errorMessage: 'Book copies must be an integer',
    },
  },
};

exports.createUserValidationSchema = {
  name: {
    notEmpty: {
      errorMessage: 'Name cannot be empty',
    },
    isString: {
      errorMessage: 'Name must be a string',
    },
  },
  email: {
    notEmpty: {
      errorMessage: 'Email cannot be empty',
    },
    isEmail: {
      errorMessage: 'Enter a valid email',
    },
  },
  password: {
    notEmpty: {
      errorMessage: 'Password cannot be empty',
    },
    isString: {
      errorMessage: 'Password must be a string',
    },
  },
  role: {
    isIn: {
      options: 'librarian, user',
      errorMessage: 'Role must either be a user or a librarian',
    },
  },
};

import regexPatterns from './regexPatterns.mjs';

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /* Filtering documents e.g gpa=3 */
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    /* coverts the query object to string */
    let queryStr = JSON.stringify(queryObj);

    /* replace the comparison operators with their mongo syntax equivalent*/
    queryStr = queryStr.replace(
      regexPatterns.comparisonOperators,
      (match) => `$${match}`,
    );

    /* perform the query */
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  /* Sorting documents e.g sort=gpa,-name */
  sort() {
    if (this.queryString.sort) {
      /* convert into mongo syntax equivalent */
      const sortBy = this.queryString.sort.split(',').join(' ');

      /* perform the query */
      this.query = this.query.sort(sortBy);
    } else {
      /* sort by date created (ascending order) */
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  /* Field limiting (including or excluding some parameters from response) */
  limitFields() {
    if (this.queryString.fields) {
      /* convert into mongo syntax equivalent*/
      const fields = this.queryString.fields.split(',').join(' ');

      /* perform the query */
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  /* Pagination */
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;

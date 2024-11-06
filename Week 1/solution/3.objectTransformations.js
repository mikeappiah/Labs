/* OBJECT TRANSFORMATIONS */

/**
 * Returns the full name of a person object (given properties firstName and lastName).
 * @param {object} person
 * @returns {string}
 */
function fullName(person) {
	return `${person.firstName} ${person.lastName}`;
}

/**
 * Checks if a person is 18 or older (given property age)
 * @param {object} person
 * @returns {boolean}
 */
function isAdult(person) {
	return person.age >= 18;
}

/**
 * Filters an array of person objects to keep only those at least minAge years old
 * @param {object} people
 * @param {number} minAge
 * @returns {array}
 */
function filterByAge(people, minAge) {
	return people.filter((person) => person.age >= minAge);
}

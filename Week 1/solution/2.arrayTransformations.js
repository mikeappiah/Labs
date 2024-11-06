/* ARRAY TRANSFORMATIONS */

/**
 * Doubles every number in an array
 * @param {array} arr
 * @returns {array}
 */
function double(arr) {
	return arr.map((num) => num * 2);
}

/**
 * Filters out even numbers from an array
 * @param {array} arr
 * @returns {array}
 */
function filterEven(arr) {
	return arr.filter((num) => num % 2 === 0);
}

/**
 * Calculates the sum of all numbers in an array
 * @param {array} arr
 * @returns {number}
 */
function sum(arr) {
	return arr.reduce(
		(accumulator, currentValue) => accumulator + currentValue,
		0
	);
}

/**
 * Calculates the average of all numbers in an array
 * @param {array} arr
 * @returns {number}
 */
function average(arr) {
	const sum = arr.reduce(
		(accumulator, currentValue) => accumulator + currentValue,
		0
	);
	return sum / arr.length;
}

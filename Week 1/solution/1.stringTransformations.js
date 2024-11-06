/* STRING TRANSFORMATIONS */

/**
 * Capitalizes the first letter of a strinf
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
	// 1. Capitalize the first letter of the input string
	const upperFirst = str[0].toUpperCase();

	// 2. Return remaining string added to 'upperFirst'
	return `${upperFirst}${str.slice(1)}`;
}

/**
 * Reverses a string
 * @param {string} str
 * @returns {string}
 */
function reverse(str) {
	// 1. Create a variable to store the reversed string
	let reversedStr = '';

	// 2. Loop through the string starting with the last element
	for (let i = str.length - 1; i >= 0; i--) {
		// 2.1 Add each character of string starting from the last to 'reversedStr'
		reversedStr += str[i];
	}

	// 3. Return the reversed string
	return reversedStr;
}

/**
 * Checks if a string is a palindrome (reads the same backward as forward)
 * @param {string} str
 * @returns {boolean}
 */
function isPalindrome(str) {
	// 1. Remove any non-alphanumeric characters from 'str' and convert to lowercase
	str = str.replace(/[^A-Za-z0-9]/g, '').toLowerCase();

	// 2. Return comparison of 'str' and its reversed form
	return str === str.split('').reverse().join('');
}

/**
 * Counts the number of words in a string
 * @param {string} str
 * @returns {number}
 */
function wordCount(str) {
	// 1. Remove and spaces from within the input string
	str = str.replace(/\s+/g, '');

	let sum = 0;

	for (let _ of str) {
		sum++;
	}
	return sum;
}

module.exports = {
	capitalize,
	reverse
};

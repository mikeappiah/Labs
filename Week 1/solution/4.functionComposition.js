const { capitalize, reverse } = require('./1.stringTransformations.js');

/**
 * Function to reverse and capitalize a string
 * @param  {...function} fns
 * @returns {string}
 */

function compose(...fns) {
	return function (str) {
		return fns.reduce((result, fn) => fn(result), str);
	};
}

const composed = compose(reverse, capitalize);
// console.log(composed('hello'));

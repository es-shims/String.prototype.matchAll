'use strict';

var hasSymbols = require('has-symbols')();
var regexpMatchAll = require('./regexp-matchall');

module.exports = function getRegExpMatchAllPolyfill() {
	if (!hasSymbols || typeof Symbol.matchAll !== 'symbol' || typeof RegExp.prototype[Symbol.matchAll] !== 'function') {
		return regexpMatchAll;
	}
	try {
		var r = /a/g;
		Object.defineProperty(r, 'flags', { value: undefined });
		r[Symbol.matchAll]('a');
		return RegExp.prototype[Symbol.matchAll];
	} catch (e) {
		return regexpMatchAll;
	}
};

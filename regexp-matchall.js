'use strict';

var hasSymbols = require('has-symbols')();
var ES = require('es-abstract');
var MatchAllIterator = require('./helpers/MatchAllIterator');

var regexMatchAll = function symbolMatchAll(string) {
	var R = this;
	if (!ES.IsRegExp(R)) {
		throw new TypeError('"this" value must be a RegExp');
	}
	return MatchAllIterator(R, string);
};

if (Object.defineProperty && Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(regexMatchAll, 'name').configurable) {
	Object.defineProperty(regexMatchAll, 'name', { value: '[Symbol.matchAll]' });
}

module.exports = regexMatchAll;

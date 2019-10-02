'use strict';

var ES = require('es-abstract/es2019');
var hasSymbols = require('has-symbols')();

var regexpMatchAllPolyfill = require('./polyfill-regexp-matchall');

var getMatcher = function getMatcher(regexp) { // eslint-disable-line consistent-return
	var matcherPolyfill = regexpMatchAllPolyfill();
	if (hasSymbols && typeof Symbol.matchAll === 'symbol') {
		var matcher = ES.GetMethod(regexp, Symbol.matchAll);
		if (matcher === RegExp.prototype[Symbol.matchAll] && matcher !== matcherPolyfill) {
			return matcherPolyfill;
		}
		return matcher;
	}
	// fallback for pre-Symbol.matchAll environments
	if (ES.IsRegExp(regexp)) {
		return matcherPolyfill;
	}
};

module.exports = function matchAll(regexp) {
	var O = ES.RequireObjectCoercible(this);

	if (typeof regexp !== 'undefined' && regexp !== null) {
		var matcher = getMatcher(regexp);
		if (typeof matcher !== 'undefined') {
			return ES.Call(matcher, regexp, [O]);
		}
	}

	var S = ES.ToString(O);
	// var rx = ES.RegExpCreate(regexp, 'g');
	var rx = new RegExp(regexp, 'g');
	return ES.Call(getMatcher(rx), rx, [S]);
};

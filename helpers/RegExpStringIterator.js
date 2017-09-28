'use strict';

var define = require('define-properties');
var ES = require('es-abstract');
var hasSymbols = require('has-symbols')();

var hidden = require('./hidden')();

var RegExpStringIterator = function RegExpStringIterator(R, S) {
	if (ES.Type(S) !== 'String') {
		throw new TypeError('S must be a string');
	}
	if (!ES.IsRegExp(R)) {
		throw new TypeError('R must be a RegExp');
	}
	hidden.set(this, '[[IteratingRegExp]]', R);
	hidden.set(this, '[[IteratedString]]', S);
	hidden.set(this, '[[PreviousIndex]]', -1);
	hidden.set(this, '[[Done]]', false);
};

define(RegExpStringIterator.prototype, {
	next: function next() {
		var O = this;
		if (ES.Type(O) !== 'Object') {
			throw new TypeError('receiver must be an object');
		}
		if (!(this instanceof RegExpStringIterator) || !hidden.has(O, '[[IteratingRegExp]]') || !hidden.has(O, '[[IteratedString]]')) {
			throw new TypeError('"this" value must be a RegExpStringIterator instance');
		}
		if (hidden.get(this, '[[Done]]')) {
			return ES.CreateIterResultObject(null, true);
		}
		var R = hidden.get(this, '[[IteratingRegExp]]');
		var S = hidden.get(this, '[[IteratedString]]');
		var match = ES.RegExpExec(R, S);
		if (match === null) {
			hidden.set(this, '[[Done]]', true);
			return ES.CreateIterResultObject(null, true);
		}
		var previousIndex = hidden.get(this, '[[PreviousIndex]]');
		if (ES.Type(previousIndex) !== 'Number') {
			throw new TypeError('Assertion failed: [[PreviousIndex]] was not a number');
		}
		var index = ES.ToLength(ES.Get(match, 'index'));
		if (index === previousIndex) {
			hidden.set(this, '[[Done]]', true);
			return ES.CreateIterResultObject(null, true);
		}
		hidden.set(this, '[[PreviousIndex]]', index);
		return ES.CreateIterResultObject(match, false);
	}
});
if (hasSymbols && Symbol.toStringTag) {
	RegExpStringIterator.prototype[Symbol.toStringTag] = 'RegExp String Iterator';
	RegExpStringIterator.prototype[Symbol.iterator] = function () { return this; };
}

module.exports = RegExpStringIterator;

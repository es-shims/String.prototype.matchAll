'use strict';

var ES = require('es-abstract');
var flagsGetter = require('regexp.prototype.flags');

var RegExpStringIterator = require('./RegExpStringIterator');
var OrigRegExp = RegExp;

module.exports = function MatchAllIterator(R, O) {
	if (!ES.IsRegExp(R)) {
		throw new TypeError('MatchAllIterator requires a regex');
	}
	var S = ES.ToString(O);
	var C = ES.SpeciesConstructor(R, OrigRegExp);
	var flags = ES.Get(R, 'flags');
	var matcher;
	if (typeof flags === 'string') {
		matcher = new C(R, flags); // ES.Construct(C, [R, flags]);
	} else if (C === OrigRegExp) {
		// workaround for older engines that lack RegExp.prototype.flags
		matcher = new C(R.source, flagsGetter(R)); // ES.Construct(C, [R.source, flagsGetter(R)]);
	} else {
		matcher = new C(R, flagsGetter(R)); // ES.Construct(C, [R, flagsGetter(R)]);
	}
	var lastIndex = ES.ToLength(ES.Get(R, 'lastIndex'));
	ES.Set(matcher, 'lastIndex', lastIndex, true);
	return new RegExpStringIterator(matcher, S);
};

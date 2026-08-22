'use strict';

var callBind = require('call-bind');
var test = require('tape');

var implementation = require('../implementation');
var regexMatchAll = require('../regexp-matchall');

var runTests = require('./tests');

test('as a function', function (t) {
	runTests(callBind(implementation), callBind(regexMatchAll), t);

	t.end();
});

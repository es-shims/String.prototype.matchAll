'use strict';

var callBind = require('call-bind');

var matchAllShim = require('../');
var regexMatchAll = require('../regexp-matchall');
var test = require('tape');

var runTests = require('./tests');

test('as a function', function (t) {
	runTests(matchAllShim, callBind(regexMatchAll), t);

	t.end();
});

'use strict';

var forEach = require('foreach');
var has = Object.prototype.hasOwnProperty;
var assign = require('object.assign');
var define = require('define-properties');
var entries = require('object.entries');

var hasSticky = typeof (/a/).sticky === 'boolean';

var testResults = function (t, iterator, expectedResults) {
	forEach(expectedResults, function (expected, index) {
		var result = iterator.next();
		t.equal(result.done, expected.done, 'result ' + (index + 1) + ' is ' + (expected.done ? '' : 'not ') + 'done');
		if (expected.done) {
			t.equal(result.value, null, 'result ' + (index + 1) + ' value is null');
		} else {
			t.equal(Array.isArray(result.value), true, 'result ' + (index + 1) + ' value is an array');
			t.deepEqual(entries(result.value || {}), entries(expected.value || {}), 'result ' + (index + 1) + ' has the same entries');
			t.deepEqual(result.value, expected.value, 'result ' + (index + 1) + ' value is expected value');
		}
	});
};

module.exports = function (matchAll, regexMatchAll, t) {
	t.test('non-regexes', function (st) {
		var notRegexes = [null, undefined, NaN, 42, new Date(), {}, []];
		var str = 'abc';
		forEach(notRegexes, function (notRegex) {
			testResults(st, matchAll(str, notRegex), matchAll(str, String(notRegex)));
		});
		st.end();
	});

	t.test('passing a string instead of a regex', function (st) {
		var str = 'aabcaba';
		var regex = /a/;
		testResults(st, matchAll(str, regex), matchAll(str, regex.source));
		st.end();
	});

	t.test('ToString-able objects', function (st) {
		var str = 'aabc';
		var strObj = { toString: function () { return str; } };
		var regex = /[ac]/g;
		var expectedResults = [
			{ value: assign(['a'], { index: 0, input: str }), done: false },
			{ value: assign(['a'], { index: 1, input: str }), done: false },
			{ value: assign(['c'], { index: 3, input: str }), done: false },
			{ value: null, done: true }
		];
		testResults(st, matchAll(strObj, regex), expectedResults);
		st.end();
	});

	t.test('#flags', function (st) {
		st.test('without a flags property', function (s2t) {
			var str = 'aabc';
			var regex = /[ac]/g;
			if (define.supportsDescriptors) {
				Object.defineProperty(regex, 'flags', { value: undefined });
			}
			s2t.equal(regex.flags, undefined, 'regex has an undefined "flags" property');
			var expectedResults = [
				{ value: assign(['a'], { index: 0, input: str }), done: false },
				{ value: assign(['a'], { index: 1, input: str }), done: false },
				{ value: assign(['c'], { index: 3, input: str }), done: false },
				{ value: null, done: true }
			];
			testResults(s2t, matchAll(str, regex), expectedResults);
			s2t.end();
		});

		st.test('with a static flags property', function (s2t) {
			var str = 'AaBC';
			var regex = /[ac]/;
			define(regex, { flags: 'ig' }, { flags: function () { return true; } });
			try {
				define(regex, { global: true }, { global: function () { return true; } });
				s2t.equal(regex.global, true);
			} catch (e) {
				// in node < 6, `global` is not configurable on regexes.
			}
			s2t.equal(regex.flags, 'ig');
			var expectedResults = [
				{ value: assign(['A'], { index: 0, input: str }), done: false },
				{ value: assign(['a'], { index: 1, input: str }), done: false },
				{ value: assign(['C'], { index: 3, input: str }), done: false },
				{ value: null, done: true }
			];
			testResults(s2t, matchAll(str, regex), expectedResults);
			s2t.end();
		});

		st.test('respects flags', function (s2t) {
			var str = 'A\na\nb\nC';
			var regex = /^[ac]/img;
			var expectedResults = [
				{ value: assign(['A'], { index: 0, input: str }), done: false },
				{ value: assign(['a'], { index: 2, input: str }), done: false },
				{ value: assign(['C'], { index: 6, input: str }), done: false },
				{ value: null, done: true }
			];
			testResults(s2t, matchAll(str, regex), expectedResults);
			s2t.end();
		});

		st.test('works with a non-global non-sticky regex', function (s2t) {
			var str = 'AaBbCc';
			var regex = /[bc]/i;
			var expectedResults = [
				{ value: assign(['B'], { index: 2, input: str }), done: false },
				{ value: null, done: true }
			];
			testResults(s2t, matchAll(str, regex), expectedResults);
			s2t.end();
		});
	});

	t.test('returns an iterator', function (st) {
		var str = 'aabc';
		var iterator = matchAll(str, /[ac]/g);
		st.ok(iterator, 'iterator is truthy');
		st.equal(has.call(iterator, 'next'), false, 'iterator does not have own property "next"');
		for (var key in iterator) {
			st.fail('iterator has enumerable properties: ' + key);
		}
		var expectedResults = [
			{ value: assign(['a'], { index: 0, input: str }), done: false },
			{ value: assign(['a'], { index: 1, input: str }), done: false },
			{ value: assign(['c'], { index: 3, input: str }), done: false },
			{ value: null, done: true }
		];
		testResults(st, iterator, expectedResults);
		st.end();
	});

	t.test('zero-width matches', function (st) {
		var str = 'abcde';

		st.test('global', function (s2t) {
			var expectedResults = [
				{ value: assign([''], { index: 1, input: str }), done: false },
				{ value: assign([''], { index: 2, input: str }), done: false },
				{ value: assign([''], { index: 3, input: str }), done: false },
				{ value: assign([''], { index: 4, input: str }), done: false },
				{ value: null, done: true }
			];
			testResults(s2t, matchAll(str, /\B/g), expectedResults);
			s2t.end();
		});

		st.test('sticky', { skip: !hasSticky }, function (s2t) {
			var expectedResults = [
				{ value: null, done: true }
			];
			/* eslint no-invalid-regexp: [2, { "allowConstructorFlags": ["y"] }] */
			testResults(s2t, matchAll(str, new RegExp('\\B', 'y')), expectedResults);
			s2t.end();
		});

		st.test('unflagged', function (s2t) {
			var expectedResults = [
				{ value: assign([''], { index: 1, input: str }), done: false },
				{ value: null, done: true }
			];
			testResults(s2t, matchAll(str, /\B/), expectedResults);
			s2t.end();
		});

		st.end();
	});
};

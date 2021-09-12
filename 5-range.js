'use strict';

const benchmark = require("./2-benchmark");

const rangePush = (min, max) => {
	const arr = [];
	for (let i = min; i < max; i++) {
		arr.push(i);
	}
	return arr;
};

const rangeNew = (from, to) => {
	if (to < from) return [];
	const len = to - from + 1;
	const range = new Array(len);
	for (let i = from; i < to; i++) {
		range[i - from] = i;
	};
	return range;
};

benchmark.do(1000000, [
	function testRangePush() {
		rangePush(1, 1000);
	},
	function testRangeNew() {
		rangeNew(1, 1000);
	}
]);

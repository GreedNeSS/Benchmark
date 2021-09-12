'use strict';

const benchmark = require('./2-benchmark.js');

const testLetBeforeLoop = () => {
	const a = Array(1000);
	let i;
	for (i = 0; i < 1000; i++) {
		a[i] = i;
	}
};

const testLetInLoop = () => {
	const a = Array(1000);
	for (let i = 0; i < 1000; i++) {
		a[i] = i;
	}
};

benchmark.do(1000000, [
	testLetInLoop,
	testLetBeforeLoop,
]);
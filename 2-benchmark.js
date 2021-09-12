'use strict';

const fs = require('fs');

const benchmark = {};
module.exports = benchmark;


const PRE_COUNT = 10000;

const OPT_STATUS = [
	'unknown',     // 0
	'opt',         // 1  
	'not opt',     // 2
	'always opt',  // 3
	'never opt',   // 4
	'unknown',     // 5
	'maybe deopt', // 6
	'turbofan opt' // 7
];

const OPT_BITS = [
	'function', // 1
	'never',    // 2
	'always',   // 4
	'maybe',    // 8
	'opt',      //16
	'turbofan', //32
	'interp'    //64
];

const status = fn => %GetOptimizationStatus(fn);

const opt = fn => {
	const optStatus = status(fn);
	const results = [];
	OPT_BITS.forEach((name, n) => {
		if (n === 0) return;
		if (Math.pow(2, n) & optStatus) results.push(name);
	});
	return results.length ? results.join(', ') : 'no preopt,';
};

const optimize = fn => %OptimizeFunctionOnNextCall(fn);

const rpad = (s, char, count) => (s + char.repeat(count - s.length));
const lpad = (s, char, count) => (char.repeat(count - s.length) + s);

const relativePercent = (best, time) => (time * 100n / best) - 100n;

const log = '\nname time (nanoseconds) status: begin opt heat loop\n';

fs.appendFile('log.txt', log, 'utf8', err => {
	if (err) console.log(err.message);
});

benchmark.do = (count, tests) => {
	const timesLog = [];

	const times = tests.map(fn => {
		if (global.gc) gc();   //? (--expose-gc) turns on the garbage collector
		const result = [];
		const optBefore = opt(fn);
		optimize(fn);
		fn();
		const optAfter = opt(fn);
		for (let i = 0; i < PRE_COUNT; i++) result.push(fn());
		const optAfterHeat = opt(fn);
		const begin = process.hrtime.bigint();
		for (let i = 0; i < count; i++) result.push(fn());
		const end = process.hrtime.bigint();
		const optAfterLoop = opt(fn);
		const diff = end - begin;
		const name = rpad(fn.name, '.', 22);
		const iterations = result.length - PRE_COUNT;

		const log = [
			name, diff, '--optBefore:', optBefore, '--optAfter:',
			optAfter, '--optAfterHeat:', optAfterHeat,
			'--optAfterLoop:', optAfterLoop
		];
		console.log([name, diff, optBefore,
			optAfter, optAfterHeat,
			optAfterLoop].join(' '));

		fs.appendFile('log.txt', log.join(' ') + '\n', 'utf8', err => {
			if (err) console.log(err.message);
		});

		const str = '\t' + JSON.stringify({ name, time: diff }, (key, value) =>
			typeof value === "bigint" ? value.toString() + "n" : value
		);
		timesLog.push(str);

		return { name, time: diff };
	});

	console.log();
	console.log(times);
	fs.appendFile('log.txt', '\ntimes: [\n' + timesLog.join(',\n') + '\n]\n\n', 'utf8',
		err => {
			if (err) console.log(err.message);
		}
	);

	const top = times.sort((t1, t2) => t1.time > t2.time ? 1 : -1);
	const best = top[0].time;
	times.forEach(test => {
		test.percent = relativePercent(best, test.time);
		const time = lpad(test.time.toString(), '.', 10);
		const percent = test.percent === 0 ? 'min' : test.percent + '%';
		const line = lpad(percent, '.', 10);
		console.log(test.name + time + line);
		fs.appendFile('log.txt', test.name + time + line + '\n', 'utf8', err => {
			if (err) console.log(err.message);
		});
	});
};
'use strict';

const LOOP_COUNT = 10000;

const fn = () => {
	const a = [];
	for (let i = 0; i < LOOP_COUNT; i++) {
		a.push(Array(i).join('A').length);
	}
	return a;
};

console.log();

console.time('experiment');
const res1 = fn();
console.log('res1.length', res1.length);
console.timeEnd('experiment');

console.log();

const begin2 = new Date().getTime();
const res2 = fn();
const end2 = new Date().getTime();
const diff2 = end2 - begin2;
console.dir({ length: res2.length, diff: diff2 });

console.log();

const begin3 = Date.now();
const res3 = fn();
const end3 = Date.now();
const diff3 = end3 - begin3;
console.dir({ length: res3.length, diff: diff3 });

console.log();

const begin4 = process.hrtime();
const res4 = fn();
const end4 = process.hrtime(begin4);
const diff4 = end4[0] * 1e9 + end4[1];
const sec4 = diff4 / 1e9;
console.dir({ length: res4.length, msec: diff4, sec: sec4 });
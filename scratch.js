import main from './index.js';

/** @type {Config} */
const config = {
	foo: "forty two",
	bar: 42,
	baz: false
};

main(config).then((d) => {
	return d;
}).catch((e) => {
	e;
	debugger;
});
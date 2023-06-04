//@ts-nocheck

const app = {
	//storage
	data: {},
	DOM: {},

	//bootstrap
	init,

	//interactive
	cacheDOM,
	bindEventsAndViews,

	//display
	hide,
	show,
	activate,
	deactivate,

	//validation
	getFields,
	checkFields,
	validate,

	//get + set
	getConfig,
	getForm,
	fillForm,
};

function init() {
	this.DOM = this.cacheDOM();
	this.bindEventsAndViews();
}

/*
----
DOM
----
*/

function cacheDOM() {
	return {
		//dom stuff goes here
	};
}

function bindEventsAndViews() {
	// "real-time" field validation + data updates
	const allInteractive = qsa("input, select");
	for (const node of allInteractive) {
		if (node.tagName === "SELECT") {
			node.addEventListener("change", () => {
				this.checkFields();
			});
		}

		if (node.tagName === "INPUT") {
			node.addEventListener("input", () => {
				this.checkFields();
			});
		}
	}

	//other listeners
}

/*
----
FIELDS
----
*/

function checkFields() {
	const userData = this.getFields();
	this.data = userData;
	this.activate(this.DOM.saveButton);
	this.activate(this.DOM.clearButton);
	const isValid = this.validate(userData);
	if (isValid) {
		this.activate(this.DOM.testButton);
	} else {
		this.deactivate(this.DOM.testButton);
	}
}

function getFields(visible = true) {
	let fields;
	if (visible) {
		// enumerate all visible forms
		fields = filterObj(this.DOM, (el) => {
			// https://stackoverflow.com/a/21696585
			return el.offsetParent && el.tagName === "FORM";
		});
	} else {
		fields = {};
		const forms = qsa("form");
		for (const form of forms) {
			fields[form.id] = getForm(form);
		}
		return fields;
	}

	const data = mapObj(fields, (node) => {
		return getForm(node);
	});

	//additional fields here

	return data;
}

function getConfig() {
	const userData = this.getFields();
	this.data = userData;
	return userData;
}

// eslint-disable-next-line no-unused-vars
function validate(config) {
	//todo
}

function getForm(elForm) {
	// eslint-disable-next-line no-unsafe-negation
	if (!elForm instanceof Element) return;
	var fields = elForm.querySelectorAll("input, select, textarea"),
		o = {};
	for (var i = 0, imax = fields.length; i < imax; ++i) {
		var field = fields[i],
			sKey = field.name || field.id;
		if (
			field.type === "button" ||
			field.type === "image" ||
			field.type === "submit" ||
			!sKey
		)
			continue;
		switch (field.type) {
			case "checkbox":
				o[sKey] = field.checked;
				break;
			case "radio":
				if (o[sKey] === undefined) o[sKey] = "";
				if (field.checked) o[sKey] = field.value;
				break;
			case "select-multiple":
				var a = [];
				for (var j = 0, jmax = field.options.length; j < jmax; ++j) {
					if (field.options[j].selected) a.push(field.options[j].value);
				}
				o[sKey] = a;
				break;
			default:
				o[sKey] = field.value;
		}
	}
	return o;
}

function fillForm(data = "", form = document) {
	if (!isObject(data)) return;
	for (var param in data) {
		var el =
			form.querySelector(`#${param}`) ||
			form.querySelector("[name=" + param + "]");
		if (el.type === "radio") el = form.querySelectorAll("[name=" + param + "]");

		switch (typeof data[param]) {
			case "number":
				el.checked = data[param];
				break;
			case "boolean":
				el.checked = Number(data[param]);
				break;
			case "object":
				if (el.options && data[param] instanceof Array) {
					for (var j = 0, jmax = el.options.length; j < jmax; ++j) {
						if (data[param].indexOf(el.options[j].value) > -1)
							el.options[j].selected = true;
					}
				}
				break;
			default:
				if (el instanceof NodeList) {
					// eslint-disable-next-line no-redeclare
					for (var j = 0, jmax = el.length; j < jmax; ++j) {
						if (el[j].value === data[param]) el[j].checked = true;
					}
				} else {
					el.value = data[param];
				}
		}
	}
}

/*
----
DISPLAY
----
*/

function show(elements = []) {
	if (!Array.isArray(elements)) elements = [elements];
	elements.forEach((el) => el.classList.remove("is-hidden"));
}

function hide(elements = []) {
	if (!Array.isArray(elements)) elements = [elements];
	elements.forEach((el) => el.classList.add("is-hidden"));
}

function activate(elements = []) {
	if (!Array.isArray(elements)) elements = [elements];
	elements.forEach((el) => (el.disabled = false));
}

function deactivate(elements = []) {
	if (!Array.isArray(elements)) elements = [elements];
	elements.forEach((el) => (el.disabled = true));
}

/*
----
UTILITIES
----
*/

// eslint-disable-next-line no-unused-vars
const qs = function qs(queryString) {
	return document.querySelector(queryString);
};

const qsa = function qsa(queryString) {
	return Array.from(document.querySelectorAll(queryString));
};

// eslint-disable-next-line no-unused-vars
function comma(num) {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * filter objects by values or objects by keys; like `map()` for objects
 * @example
 * const d = {foo: "bar", baz: "qux"}
 * objFilter(d, x => x.startsWith('b')) // => {foo: "bar"}
 * objFilter(d, x => x.startsWith('f'), 'key') // => {foo: "bar"}
 * @param  {generalObject} hash - object or array to filter
 * @param  {filterCallback} test_function - a function which is called on keys/values
 * @param  {"key" | "value"} [keysOrValues="value"] - test keys or values; default `value`
 * @returns {Object} filtered object
 */
function filterObj(hash, test_function, keysOrValues = "value") {
	let key, i;
	const iterator = Object.keys(hash);
	const filtered = {};

	for (i = 0; i < iterator.length; i++) {
		key = iterator[i];
		if (keysOrValues === "value") {
			if (test_function(hash[key])) {
				filtered[key] = hash[key];
			}
		}
		if (keysOrValues === "key") {
			if (test_function(key.toString())) {
				filtered[key] = hash[key];
			}
		}
	}
	return filtered;
}

/**
 * map over an object's values and return a new object
 * @example
 * objMap({foo: 2, bar: 4}, val => val * 2) => {foo: 4, bar: 8}
 * @param  {Object} object object iterate
 * @param  {function} mapFn function with signature `(val) => {}`
 * @returns {Object} filtered object
 */
function mapObj(object, mapFn) {
	return Object.keys(object).reduce(function (result, key) {
		result[key] = mapFn(object[key]);
		return result;
	}, {});
}

// eslint-disable-next-line no-unused-vars
function mergeObj(arr) {
	return arr.reduce(function (acc, current) {
		for (var key in current) {
			// eslint-disable-next-line no-prototype-builtins
			if (current.hasOwnProperty(key)) {
				acc[key] = current[key];
			}
		}
		return acc;
	}, {});
}

function isObject(arg) {
	return Object.prototype.toString.call(arg) === "[object Object]";
}

app.init(); //😎 BOOM!

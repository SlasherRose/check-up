"use strict";

class CheckUpError extends Error {
	constructor(message) {
		super(sanitizeColors(message));
		this.name = "CheckUpError";
	}
}

class TestError extends CheckUpError {
	constructor(message) {
		super(message);
		this.name = "TestError";
	}
}

class TestTypeError extends TestError {
	constructor(message) {
		super(message);
	}
}

class CannotAddTestError extends TestError {
	constructor(testName, message) {
		super(`Cannot add test '${testName}' (${message})`);
	}
}

class CannotModifyTestError extends TestError {
	constructor(testSuiteName, message) {
		super(`Cannot modify test suite '${testSuiteName}' (${message})`);
	}
}

class CannotCalculateResultsError extends TestError {
	constructor(message) {
		super(`Cannot calculate results (${message})`);
	}
}

class CannotRetrieveReportError extends TestError {
	constructor(message) {
		super(`Cannot retrieve report (${message})`);
	}
}

class AssertionFailure extends CheckUpError {
	constructor(message) {
		super(message);
		this.name = "AssertionFailure";
	}
}

class AssertionError extends CheckUpError {
	constructor(message) {
		super(message);
		this.name = "AssertionError";
	}
}

class AssertionTypeError extends AssertionError {
	constructor(message) {
		super(message);
	}
}

const TestTypeErrorSuiteNameMustBeString = (type) =>
	new TestTypeError(`test suite name must be a string (got ${type})`);

const CannotCalculateResultsNoTestsRun = () =>
	new CannotCalculateResultsError("no tests exist");
const CannotCalculateResultsResultsAlreadyCalculated = () =>
	new CannotCalculateResultsError("results have already been generated");
const CannotRetrieveReportResultsNotReady = () =>
	new CannotRetrieveReportError("results have not been generated");
const CannotModifyTestsAfterTestsHaveStarted = (testSuiteName) =>
	new CannotModifyTestError(testSuiteName, "testing has already begun");
const CannotAddTestAfterTestsHaveStarted = (testName) =>
	new CannotAddTestError(testName, `testing has already begun`);

const AssertionFailedEquals = (expected, actual) =>
	new AssertionFailure(`expected '${expected}', got '${actual}'`);
const AssertionFailedNotEquals = (expected, actual) =>
	new AssertionFailure(`expected '${expected}' to not equal '${actual}'`);

const AssertionFailedContains = (collection, included) =>
	new AssertionFailure(`expected '${collection}' to contain '${included}'`);
const AssertionFailedNotContains = (collection, included) =>
	new AssertionFailure(
		`expected '${collection}' to not contain '${included}'`
	);
const AssertionFailedContainsIsNull = (nonExistentType, included) =>
	new AssertionFailure(
		`cannot check if '${nonExistentType}' contains '${included}'`
	);

const AssertionFailedIsType = (expected, actual) =>
	new AssertionFailure(`expected '${actual}' to be type '${expected}'`);
const AssertionFailedIsNotType = (expected, actual) =>
	new AssertionFailure(`expected '${actual}' to not be type '${expected}'`);
const AssertionFailedTrue = (actual) =>
	new AssertionFailure(`expected '${actual}' to be true`);
const AssertionFailedFalse = (actual) =>
	new AssertionFailure(`expected '${actual}' to be false`);
const AssertionFailedNull = (actual) =>
	new AssertionFailure(`expected '${actual}' to be null`);
const AssertionFailedNotNull = (actual) =>
	new AssertionFailure(`expected '${actual}' to not be null`);
const AssertionFailedUndefined = (actual) =>
	new AssertionFailure(`expected '${actual}' to be undefined`);
const AssertionFailedNotUndefined = (actual) =>
	new AssertionFailure(`expected '${actual}' to not be undefined`);
const AssertionFailedTruthy = (actual) =>
	new AssertionFailure(`expected '${actual}' to be truthy`);
const AssertionFailedFalsy = (actual) =>
	new AssertionFailure(`expected '${actual}' to be falsy`);
const AssertionFailedError = () =>
	new AssertionFailure(`expected to throw an error`);
const AssertionFailedNoError = (err) =>
	new AssertionFailure(`error '${err}' was thrown`);
const AssertionFailedSpecificError = (err, expected) =>
	new AssertionFailure(`error '${err}' was thrown, expected '${expected}'`);

const AssertionErrorInvalidErrorType = (type) =>
	new AssertionTypeError(`bad error type '${type}' (must be string or Error)`);
const AssertionErrorCallbackMustBeFunction = (errorName = null) =>
	new AssertionTypeError(
		`cannot test for error ${
			errorName ? `'${errorName}' ` : ""
		} in provided callback (it is not a function)`
	);

// Removes colors from any inputs coming from outside the library (for clarity)
function sanitizeColors(str) {
	return str.replace(/\x1b\[[0-9;]*m/g, "");
}

/* LICENSE INFORMATION */
/* CheckUp.js - A simple testing framework for JavaScript
 * This file is licensed under the MIT License.
 *
 * https://github.com/SlasherRose/check-up
 */

class Tests {
	constructor(testSuiteName = "N/A", options = {}) {
		if (typeof testSuiteName !== "string") {
			throw TestTypeErrorSuiteNameMustBeString(typeof testSuiteName);
		}
		const {
			quiet = false,

			printErrorsOnTest = false,

			printReportIndividualTestResults = true,
			printReportSummary = true,
			printReportSummaryTable = true,
			printReportBanner = true,
			printReportFailedTests = true,
		} = options;
		this.testSuiteName = testSuiteName;

		this.tests = [];
		this.onStartCallbacks = [];
		this.onTestStartCallbacks = [];
		this.onShowResultsCallbacks = [];
		this.onTestFinishCallbacks = [];

		this.testsHaveBegun = false;
		this.testsHaveFinished = false;

		this.testResults = [];

		this.quiet = quiet;
		this.printErrorsOnTest = printErrorsOnTest;

		this.printReportIndividualTestResults = printReportIndividualTestResults;
		this.printReportSummary = printReportSummary;
		this.printReportTable = printReportSummaryTable;
		this.printReportBanner = printReportBanner;
		this.printReportFailedTests = printReportFailedTests;
	}

	onStart(...callbacks) {
		this.#checkCanModify();
		this.onStartCallbacks.push(...callbacks);
	}

	onTestStart(...callbacks) {
		this.#checkCanModify();
		this.onTestStartCallbacks.push(...callbacks);
	}

	onShowResults(...callbacks) {
		this.#checkCanModify();
		this.onShowResultsCallbacks.push(...callbacks);
	}

	onTestFinish(...callbacks) {
		this.#checkCanModify();
		this.onTestFinishCallbacks.push(...callbacks);
	}

	test(testName, test) {
		this.#checkCanTest(testName);
		this.#beginTests();
		this.onTestStartCallbacks.forEach((callback) => callback());
		try {
			test();
			this.testResults.push({ testName, succeeded: true });
		} catch (e) {
			if (this.printErrorsOnTest && !this.quiet) {
				if (e.name !== "AssertionFailure") {
					console.error(e);
				}
			}
			this.testResults.push({
				testName,
				succeeded: false,
				error: e,
			});
		} finally {
			this.onTestFinishCallbacks.forEach((callback) => callback());
		}
	}

	endTests() {
		this.#checkCanGenerateResults();

		this.onShowResultsCallbacks.forEach((callback) => callback());

		this.testsHaveFinished = true;

		this.report({
			printReport: !this.quiet,
		});

		return this.testResults;
	}

	report(props = {}) {
		const { printReport = true } = props;
		this.#checkReportIsReady();

		const resultsSummary = new ResultsSummary(this.testResults);
		resultsSummary.setTitle(this.testSuiteName);
		if (printReport) {
			resultsSummary.print({
				withSummaryTable: this.printReportTable,
				withSummary: this.printReportSummary,
				withDetailedReport: this.printReportIndividualTestResults,
				withBanner: this.printReportBanner,
				withFailures: this.printReportFailedTests,
			});
		}

		return resultsSummary;
	}

	#checkReportIsReady() {
		if (!this.testsHaveFinished) {
			throw CannotRetrieveReportResultsNotReady();
		}
	}

	#checkCanGenerateResults() {
		if (!this.testsHaveBegun) {
			throw CannotCalculateResultsNoTestsRun();
		}
		if (this.testsHaveFinished) {
			throw CannotCalculateResultsResultsAlreadyCalculated();
		}
	}

	#checkCanModify() {
		if (this.testsHaveBegun) {
			throw CannotModifyTestsAfterTestsHaveStarted(this.testSuiteName);
		}
	}

	#checkCanTest(testName) {
		if (this.testsHaveFinished) {
			throw CannotAddTestAfterTestsHaveStarted(testName);
		}
	}

	#beginTests() {
		if (!this.testsHaveBegun) {
			this.testsHaveBegun = true;
			this.onStartCallbacks.forEach((callback) => callback());
		}
	}
}

class ResultsSummary {
	constructor(...testResults) {
		// if passed as an array of arrays, flatten
		if (Array.isArray(testResults) && testResults.length === 1) {
			if (Array.isArray(testResults[0]) && testResults[0].length === 1) {
				testResults = testResults[0];
			}
		}

		this.succeeded = [];
		this.failed = [];
		this.testResults = [];

		testResults.forEach((testSuite) => {
			if (!Array.isArray(testSuite)) {
				testSuite = [testSuite];
			}
			testSuite.forEach((testResult) => {
				const success = testResult.succeeded;
				if (success) {
					this.succeeded.push(testResult);
				} else {
					this.failed.push(testResult);
				}
				this.testResults.push(testResult);
			});
		});

		this.title = "Test Results";
		this.totalSucceeded = this.succeeded.length;
		this.totalFailed = this.failed.length;
		this.totalTests = this.testResults.length;
		this.successRate =
			Math.round((this.totalSucceeded / this.totalTests) * 10000) / 100;
		this.failureRate =
			Math.round((this.totalFailed / this.totalTests) * 10000) / 100;
	}

	/* Sets the title of the test results (to be printed as banner) */
	setTitle(title) {
		this.title = title;
	}

	/*
	 * Prints a summary of the test results to the console
	 * options:
	 * 	withBanner - prints a banner with the title (useful for separating multiple test suites)
	 * 	withDetailedReport - prints a list of each test and whether it succeeded or failed (and how it failed)
	 * 	withSummaryTable - prints a summary table of the results
	 * 	withSummary - prints the number of successes vs failures without names of tests or errors
	 * 	withFailures - prints a list of the failed tests
	 */
	print(options = {}) {
		const {
			withBanner = true,
			withDetailedReport = true,
			withSummaryTable = true,
			withSummary = true,
			withFailures = true,
		} = options;

		if (withBanner) this.#printBanner();

		if (withDetailedReport) this.#printDetailedReport();

		if (withSummaryTable) this.#printTable();

		if (withFailures) this.#printFailures();

		if (withSummary) this.#printSummary();
	}

	#printSummary() {
		if (this.failed.length === 0) {
			const count = this.totalTests;
			const message = `All ${count} tests have passed!`;
			console.log(`${Colors.GREEN}${message}${Colors.RESET}`);
		} else {
			const failedCount = this.totalFailed;
			const totalCount = this.totalTests;
			if (failedCount === totalCount) {
				console.log(
					`${Colors.RED}All ${totalCount} tests have failed.${Colors.RESET}`
				);
				return;
			}
			const testPlural = failedCount === 1 ? "test" : "tests";
			const havePlural = failedCount === 1 ? "has" : "have";
			console.log(
				`${Colors.RED}${failedCount} ${testPlural} out of ${totalCount} ${havePlural} failed.${Colors.RESET}`
			);
		}
	}

	#printDetailedReport() {
		console.log(
			"Tests:\n\n",
			this.testResults
				.map((test) => this.#formatTestResult(test))
				.join("\n "),
			"\n"
		);
	}

	#printBanner() {
		const padding = " - - ";
		const sides = "== ";
		const row = "=".repeat(
			this.title.length + padding.length * 2 + sides.length * 2 - 1
		);
		console.log(
			`\n${row}\n${sides}${padding}${this.title}${padding}${sides}\n${row}\n`
		);
	}

	#printTable() {
		const table = {
			"Total Tests": this.totalTests,
			Succeeded: this.totalSucceeded,
			Failed: this.totalFailed,
			"Success Rate": `${this.successRate} %`,
			"Failure Rate": `${this.failureRate} %`,
		};
		console.table(table);
	}

	#printFailures() {
		if (this.failed.length === 0) return;
		console.log("Failed Tests:");
		const failedTests = this.failed.map((test) => test.testName).join(", ");
		console.log(`${Colors.RED}${failedTests}${Colors.RESET}\n`);
	}

	#formatTestResult(testResult) {
		if (testResult.succeeded) {
			return `${Colors.GREEN}[✔]${Colors.RESET} ${testResult.testName}`;
		} else {
			const metaData = formatErrorResultsWithFileDataOrAssertionFailure(
				testResult.error
			);
			let errorMessage = testResult.error.message;
			return `${Colors.RED}[X]${Colors.RESET} ${testResult.testName}:\n\t${metaData} ${Colors.YELLOW}${errorMessage}${Colors.RESET}`;
		}

		function formatErrorResultsWithFileDataOrAssertionFailure(error) {
			if (error.name === "AssertionFailure") {
				return `${Colors.CYAN}[Assertion Failed]${Colors.RESET}`;
			}
			detectAndSetErrorMetaDataIfNotExists(error);
			if (!error.fileName || !error.lineNumber) {
				return "";
			}

			return `${Colors.BLUE}[${testResult.error.fileName}:${testResult.error.lineNumber}]${Colors.RESET}`;
		}

		/* If the error doesn't have a file name or line number, try to detect it */
		function detectAndSetErrorMetaDataIfNotExists(error) {
			const matchCommonFileLinePattern =
				/(?<=[\/\\(])([^:\/\\]+):[1-9]+:[1-9]+/;
			const match = error.stack.match(matchCommonFileLinePattern);
			if (!error.fileName) {
				if (match) {
					error.fileName = match[0].split(":")[0];
				}
			}
			if (!error.lineNumber) {
				if (match) {
					error.lineNumber = match[0].split(":")[1];
				}
			}
		}
	}
}

const Colors = {
	BLACK: "\u001b[30m",
	RED: "\u001b[31m",
	GREEN: "\u001b[32m",
	YELLOW: "\u001b[33m",
	BLUE: "\u001b[34m",
	MAGENTA: "\u001b[35m",
	CYAN: "\u001b[36m",
	WHITE: "\u001b[37m",
	RESET: "\u001b[0m",
};
Object.freeze(Colors);

/* ASSERTION FUNCTIONS */
/* See here for all the actual assertion functions: */

function assert(actual) {
	return {
		equals: (expected) => {
			assertEqual(expected, actual);
		},
		notEquals: (expected) => {
			assertNotEqual(expected, actual);
		},
		isTrue: () => {
			assertTrue(actual);
		},
		isFalse: () => {
			assertFalse(actual);
		},
		isTruthy: () => {
			assertTruthy(actual);
		},
		isFalsy: () => {
			assertFalsy(actual);
		},
		isNull: () => {
			assertNull(actual);
		},
		isNotNull: () => {
			assertNotNull(actual);
		},
		isUndefined: () => {
			assertUndefined(actual);
		},
		isNotUndefined: () => {
			assertNotUndefined(actual);
		},
		contains: (included) => {
			assertContains(actual, included);
		},
		notContains: (included) => {
			assertNotContains(actual, included);
		},
		isType: (expectedType) => {
			assertType(actual, expectedType);
		},
		isNotType: (expectedType) => {
			assertNotType(actual, expectedType);
		},
		fails: (onFinally = null) => {
			assertFails(actual, onFinally);
		},
		failsWithError: (expectedError, onFinally = null) => {
			assertFailsWithError(expectedError, actual, onFinally);
		},
		succeeds: (onFinally = null) => {
			assertSucceeds(actual, onFinally);
		},
	};
}

function assertEqual(expected, actual) {
	if (expected !== actual) {
		throw AssertionFailedEquals(expected, actual);
	}
}

function assertNotEqual(expected, actual) {
	if (expected === actual) {
		throw AssertionFailedNotEquals(expected, actual);
	}
}

function assertContains(collection, included) {
	if (!collection) {
		throw AssertionFailedContainsIsNull(collection, included);
	}
	if (!collection.includes(included)) {
		throw AssertionFailedContains(collection, included);
	}
}

function assertNotContains(collection, included) {
	if (!collection) {
		throw AssertionFailedContainsIsNull(collection, included);
	}
	if (collection.includes(included)) {
		throw AssertionFailedNotContains(collection, included);
	}
}

function assertNull(actual) {
	if (actual !== null) {
		throw AssertionFailedNull(actual);
	}
}

function assertNotNull(actual) {
	if (actual === null) {
		throw AssertionFailedNotNull(actual);
	}
}

function assertUndefined(actual) {
	if (actual !== undefined) {
		throw AssertionFailedUndefined(actual);
	}
}

function assertNotUndefined(actual) {
	if (actual === undefined) {
		throw AssertionFailedNotUndefined(actual);
	}
}

function assertTrue(actual) {
	if (actual !== true) {
		throw AssertionFailedTrue(actual);
	}
}

function assertFalse(actual) {
	if (actual !== false) {
		throw AssertionFailedFalse(actual);
	}
}

function assertTruthy(actual) {
	if (!actual) {
		throw AssertionFailedTruthy(actual);
	}
}

function assertFalsy(actual) {
	if (actual) {
		throw AssertionFailedFalsy(actual);
	}
}

function assertType(object, expectedType) {
	if (typeof object !== expectedType) {
		throw AssertionFailedIsType(expectedType, object);
	}
}

function assertNotType(object, expectedType) {
	if (typeof object === expectedType) {
		throw AssertionFailedIsNotType(expectedType, object);
	}
}

function assertFails(callback, final = null) {
	if (typeof callback !== "function") {
		throw AssertionErrorCallbackMustBeFunction();
	}
	try {
		callback();
	} catch (e) {
		return;
	} finally {
		if (final) {
			final();
		}
	}
	throw AssertionFailedError();
}

function assertFailsWithError(expectedError, callback, final = null) {
	if (typeof expectedError !== "string" && typeof expectedError !== "object") {
		throw AssertionErrorInvalidErrorType(typeof expectedError);
	}
	if (
		typeof expectedError !== "string" &&
		!expectedError.message &&
		!expectedError.stack &&
		!expectedError.name
	) {
		throw AssertionErrorInvalidErrorType("non-error object");
	}

	if (typeof callback !== "function") {
		throw AssertionErrorCallbackMustBeFunction(expectedError.name);
	}
	try {
		callback();
	} catch (e) {
		if (typeof expectedError === "string" && e.message !== expectedError) {
			throw AssertionFailedSpecificError(e.message, expectedError);
		}

		if (
			typeof expectedError === "object" &&
			e.message !== expectedError.message
		) {
			throw AssertionFailedSpecificError(e.message, expectedError.message);
		}
		return;
	} finally {
		if (final) {
			final();
		}
	}

	throw AssertionFailedError();
}

function assertSucceeds(callback, final = null) {
	if (typeof callback !== "function") {
		throw AssertionErrorCallbackMustBeFunction();
	}
	try {
		callback();
	} catch (e) {
		throw AssertionFailedNoError(e);
	} finally {
		if (final) {
			final();
		}
	}
}

exports.Tests = Tests;
exports.assert = assert;

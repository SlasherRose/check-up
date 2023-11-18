/* LICENSE INFORMATION */
/* CheckUp.js - A simple testing framework for JavaScript
 * This file is licensed under the MIT License.
 *
 * https://github.com/SlasherRose/check-up
 */

import * as Errors from "./errors.js";

class Tests {
	constructor(testSuiteName = "N/A", options = {}) {
		if (typeof testSuiteName !== "string") {
			throw Errors.TestTypeErrorSuiteNameMustBeString(typeof testSuiteName);
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
			throw Errors.CannotRetrieveReportResultsNotReady();
		}
	}

	#checkCanGenerateResults() {
		if (!this.testsHaveBegun) {
			throw Errors.CannotCalculateResultsNoTestsRun();
		}
		if (this.testsHaveFinished) {
			throw Errors.CannotCalculateResultsResultsAlreadyCalculated();
		}
	}

	#checkCanModify() {
		if (this.testsHaveBegun) {
			throw Errors.CannotModifyTestsAfterTestsHaveStarted(
				this.testSuiteName
			);
		}
	}

	#checkCanTest(testName) {
		if (this.testsHaveFinished) {
			throw Errors.CannotAddTestAfterTestsHaveStarted(testName);
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
		throw Errors.AssertionFailedEquals(expected, actual);
	}
}

function assertNotEqual(expected, actual) {
	if (expected === actual) {
		throw Errors.AssertionFailedNotEquals(expected, actual);
	}
}

function assertContains(collection, included) {
	if (!collection) {
		throw Errors.AssertionFailedContainsIsNull(collection, included);
	}
	if (!collection.includes(included)) {
		throw Errors.AssertionFailedContains(collection, included);
	}
}

function assertNotContains(collection, included) {
	if (!collection) {
		throw Errors.AssertionFailedContainsIsNull(collection, included);
	}
	if (collection.includes(included)) {
		throw Errors.AssertionFailedNotContains(collection, included);
	}
}

function assertNull(actual) {
	if (actual !== null) {
		throw Errors.AssertionFailedNull(actual);
	}
}

function assertNotNull(actual) {
	if (actual === null) {
		throw Errors.AssertionFailedNotNull(actual);
	}
}

function assertUndefined(actual) {
	if (actual !== undefined) {
		throw Errors.AssertionFailedUndefined(actual);
	}
}

function assertNotUndefined(actual) {
	if (actual === undefined) {
		throw Errors.AssertionFailedNotUndefined(actual);
	}
}

function assertTrue(actual) {
	if (actual !== true) {
		throw Errors.AssertionFailedTrue(actual);
	}
}

function assertFalse(actual) {
	if (actual !== false) {
		throw Errors.AssertionFailedFalse(actual);
	}
}

function assertTruthy(actual) {
	if (!actual) {
		throw Errors.AssertionFailedTruthy(actual);
	}
}

function assertFalsy(actual) {
	if (actual) {
		throw Errors.AssertionFailedFalsy(actual);
	}
}

function assertType(object, expectedType) {
	if (typeof object !== expectedType) {
		throw Errors.AssertionFailedIsType(expectedType, object);
	}
}

function assertNotType(object, expectedType) {
	if (typeof object === expectedType) {
		throw Errors.AssertionFailedIsNotType(expectedType, object);
	}
}

function assertFails(callback, final = null) {
	if (typeof callback !== "function") {
		throw Errors.AssertionErrorCallbackMustBeFunction();
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
	throw Errors.AssertionFailedError();
}

function assertFailsWithError(expectedError, callback, final = null) {
	if (typeof expectedError !== "string" && typeof expectedError !== "object") {
		throw Errors.AssertionErrorInvalidErrorType(typeof expectedError);
	}
	if (
		typeof expectedError !== "string" &&
		!expectedError.message &&
		!expectedError.stack &&
		!expectedError.name
	) {
		throw Errors.AssertionErrorInvalidErrorType("non-error object");
	}

	if (typeof callback !== "function") {
		throw Errors.AssertionErrorCallbackMustBeFunction(expectedError.name);
	}
	try {
		callback();
	} catch (e) {
		if (typeof expectedError === "string" && e.message !== expectedError) {
			throw Errors.AssertionFailedSpecificError(e.message, expectedError);
		}

		if (
			typeof expectedError === "object" &&
			e.message !== expectedError.message
		) {
			throw Errors.AssertionFailedSpecificError(
				e.message,
				expectedError.message
			);
		}
		return;
	} finally {
		if (final) {
			final();
		}
	}

	throw Errors.AssertionFailedError();
}

function assertSucceeds(callback, final = null) {
	if (typeof callback !== "function") {
		throw Errors.AssertionErrorCallbackMustBeFunction();
	}
	try {
		callback();
	} catch (e) {
		throw Errors.AssertionFailedNoError(e);
	} finally {
		if (final) {
			final();
		}
	}
}

export { Tests, assert };

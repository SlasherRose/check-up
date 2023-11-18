/* LICENSE INFORMATION */
/* This file is a unit test for the library CheckUp.js
 * CheckUp.js is licensed under the MIT License.
 *
 * https://github.com/SlasherRose/check-up
 */

import { Tests, assert } from "check-up";

/* TEST DESCRIPTION */
/* This test file is used to verify that the settings are working as expected
 * To do this, it runs 4 types of tests:
 *  o A test with 2 failures (one from an assertion, one from an error) and 1 pass
 *  o A test with 2 passes
 *  o A test with 1 failure and 0 passes
 *  o A test with 1 pass and 0 failures
 *
 * Each test is run with a different set of settings enabled, and the output is verified
 * to ensure that the settings are working as expected
 *
 * To add a new setting, add it to the blankSettings object, and add the expected output
 * to the expected object
 */

/* TEST SETUP */

/* Blank Settings */
/* Used to reset settings to all false to test settings individually */
const blankSettings = {
	quiet: false,

	printReportIndividualTestResults: false,
	printReportSummaryTable: false,
	printReportSummary: false,
	printReportBanner: false,
	printReportFailedTests: false,

	printErrorsOnTest: false,
};

/* Expected Output */
/* Used to verify that the settings are working as expected
 * Each setting has a set of expected outputs for each type of test
 */
const expected = {
	printReportSummary: {
		singularFails: "All 1 tests have failed",
		singularPasses: "All 1 tests have passed",
		multipleFailures: "2 tests out of 3 have failed",
		multiplePasses: "All 3 tests have passed",
	},
	printReportSummaryTable: {
		singularFails: [
			"  Total Tests  │     1     │",
			"│  Succeeded   │     0     │",
			"│    Failed    │     1     │",
			"│ Success Rate │ '0 %' │",
			"│ Failure Rate │ '100 %' │",
		],
		singularPasses: [
			"  Total Tests  │     1     │",
			"│  Succeeded   │     1     │",
			"│    Failed    │     0     │",
			"│ Success Rate │   '100 %' │",
			"│ Failure Rate │     '0 %' │",
		],
		multipleFailures: [
			"  Total Tests  │     3     │",
			"│  Succeeded   │     1     │",
			"│    Failed    │     2     │",
			"│ Success Rate │ '33.33 %' │",
			"│ Failure Rate │ '66.67 %' │",
		],
		multiplePasses: [
			"  Total Tests  │     3     │",
			"│  Succeeded   │     3     │",
			"│    Failed    │     0     │",
			"│ Success Rate │ '100 %' │",
			"│ Failure Rate │ '0 %' │",
		],
	},
	printReportBanner: {
		singularFails: "==  - - test - - ==",
		singularPasses: "==  - - test - - ==",
		multipleFailures: "==  - - test - - ==",
		multiplePasses: "==  - - test - - ==",
	},
	printReportFailedTests: {
		singularFails: ["Failed Tests:"],
		singularPasses: [],
		multipleFailures: [
			"Failed Tests:",
			"assertTrueAndFails, assertButFailureOccurs",
		],
		multiplePasses: [],
	},
	printErrorsOnTest: {
		singularFails: [],
		singularPasses: [],
		multipleFailures: ["Error: Error Thrown!"],
		multiplePasses: [],
	},
	printReportIndividualTestResults: {
		singularFails: ["[X] assertTrue", "[Assertion Failed]"],
		singularPasses: ["[✔] assertTrue"],
		multipleFailures: [
			"[✔] assertTrue",
			"[X] assertTrueAndFails:",
			"[Assertion Failed]",
			"[X] assertButFailureOccurs:",
			"[settings.test.js",
		],
		multiplePasses: [
			"[✔] assertTrue",
			"[✔] assertTrueAndFails",
			"[✔] assert1is1",
		],
	},
};
const allConfigs = Object.keys(expected);

/* Announce Testing */
console.debug(
	"CheckUp.js: Testing That All Settings Are Performing As Expected..."
);

/* Capture Console Output */
console.debug("CheckUp.js: Capturing console.log...");
const unexpectedResults = [];
const logsRunDuringTest = [];
const log = console.log;
const error = console.error;
captureConsole();

/* TEST EXECUTION */

try {
	runTestQuiet();

	runAllSettingsTests();
} catch (e) {
	releaseConsole();
	console.error(
		"CheckUp.js: Error Occurred During Settings Testing (",
		e.message,
		")"
	);
	process.exit(1);
}

/* TEST CLEANUP */
console.debug("CheckUp.js: Releasing console.log...");
releaseConsole();

/* DISPLAY TEST RESULTS */
finishTests();

/* HELPER FUNCTIONS */

/* Test Runners */
/* Runs a set of pre-determined tests to verify that the settings are working as expected */
function doTestsWithFailures(options) {
	const tests = new Tests("test", options);
	resetCapturedLogs();
	tests.test("assertTrue", () => {
		assert(true).isTrue();
	});

	tests.test("assertTrueAndFails", () => {
		assert(false).isTrue();
	});

	tests.test("assertButFailureOccurs", () => {
		throw new Error("Error Thrown!");
	});

	tests.endTests();
}
function doTestsWithoutFailures(options) {
	const tests = new Tests("test", options);
	resetCapturedLogs();
	tests.test("assertTrue", () => {
		assert(true).isTrue();
	});

	tests.test("assertTrueAndFails", () => {
		assert(false).isFalse();
	});

	tests.test("assert1is1", () => {
		assert(1).equals(1);
	});

	tests.endTests();
}
function doSingularTestsWithFailures(options) {
	const tests = new Tests("test", options);
	resetCapturedLogs();
	tests.test("assertTrue", () => {
		assert(false).isTrue();
	});

	tests.endTests();
}
function doSingularTestsWithoutFailures(options) {
	const tests = new Tests("test", options);
	resetCapturedLogs();
	tests.test("assertTrue", () => {
		assert(true).isTrue();
	});

	tests.endTests();
}

/* Verification Functions */
/* Verify what was last output to the console */
function verifyEmpty(testName) {
	if (logsRunDuringTest.length > 0) {
		unexpectedResults.push(
			`${testName}: Expected no logs, but found ${logsRunDuringTest.length} logs`
		);
	}
}
function verifyContains(testName, contents) {
	const found = logsRunDuringTest.find((logList) => {
		return logList.find((line) => {
			return findSanitized(line, contents);
		});
	});

	if (!found) {
		unexpectedResults.push(
			`${testName}: Expected to find '${contents}' in logs`
		);
	}
}
function verifyDoesNotContain(testName, contents) {
	const found = logsRunDuringTest.find((log) => {
		return log.find((line) => {
			return findSanitized(line, contents);
		});
	});

	if (found) {
		if (Array.isArray(contents)) {
			contents = contents.join("', '");
		}
		unexpectedResults.push(
			`${testName}: Expected to not find '${contents}' in logs`
		);
	}
}

/* String Sanitization */
/* Remove colors and simplify whitespace to make it easier to compare strings */
function findSanitized(logString, searches) {
	if (typeof logString === "object") {
		logString = logString.toString();
	}
	logString = removeColors(logString);
	logString = simplifyWhitespace(logString);
	if (typeof searches === "string") {
		searches = [searches];
	}
	let found = false;
	searches.forEach((search) => {
		search = simplifyWhitespace(search);
		if (logString.includes(search)) {
			found = true;
		}
	});
	return found;
}
function removeColors(logString) {
	return logString.replace(/\u001b\[\d{1,2}m/g, "");
}
function simplifyWhitespace(logString) {
	return logString.replace(/\s\s+/g, " ");
}

/* Run Tests */
function runAllSettingsTests() {
	const allSettings = Object.keys(expected);
	for (let i = 0; i < allSettings.length; i++) {
		const settings = { ...blankSettings };
		for (let j = 0; j < allSettings.length; j++) {
			if (i === j) {
				settings[allSettings[j]] = true;
			} else {
				settings[allSettings[j]] = false;
			}
		}
		runAndVerifyTests(
			`allSettings_${allSettings[i]}`,
			settings,
			allSettings[i]
		);
	}
}
function runTestQuiet() {
	const settings = { ...blankSettings };
	settings.quiet = true;
	doTestsWithFailures(settings);
	doTestsWithoutFailures(settings);
	doSingularTestsWithFailures(settings);
	doSingularTestsWithoutFailures(settings);

	verifyEmpty("quiet");
}

/* Run Tests */
/* Runs and verifies the full test series */
function runAndVerifyTests(testName, options, ...configNames) {
	doTestsWithFailures(options);
	verifyExpected("multipleFailures", testName, ...configNames);
	doTestsWithoutFailures(options);
	verifyExpected("multiplePasses", testName, ...configNames);
	doSingularTestsWithFailures(options);
	verifyExpected("singularFails", testName, ...configNames);
	doSingularTestsWithoutFailures(options);
	verifyExpected("singularPasses", testName, ...configNames);
}
function verifyExpected(type, testName, ...configNames) {
	configNames.forEach((key) => {
		const expectedStrings = expected[key][type];
		if (!expectedStrings)
			throw new Error(
				`Expected string for '${key}' of type '${type}' not found`
			);
		else if (typeof expectedStrings === "string")
			verifyContains(`${testName}_${type}`, expectedStrings);
		else if (Array.isArray(expectedStrings))
			expectedStrings.forEach((expectedString) => {
				verifyContains(`${testName}_${type}`, expectedString);
			});
		else
			throw new Error(
				`Expected string for '${key}' of type '${type}' is not a string or array`
			);
	});
	const unexpectedConfigs = allConfigs.filter((config) => {
		return !configNames.includes(config);
	});
	unexpectedConfigs.forEach((config) => {
		const unexpectedString = expected[config][type];
		verifyDoesNotContain(`${testName}_${type}`, unexpectedString);
	});
}

function captureConsole(printLog = false) {
	console.log = (...args) => {
		logsRunDuringTest.push(args);
		if (printLog) {
			log(...args);
		}
	};
	console.error = (...args) => {
		logsRunDuringTest.push(args);
		if (printLog) {
			error(...args);
		}
	};
}

function resetCapturedLogs() {
	logsRunDuringTest.length = 0;
}

function releaseConsole() {
	console.log = log;
	console.error = error;
}

function finishTests() {
	if (unexpectedResults.length === 0) {
		console.debug("CheckUp.js: All Settings Tests Passed!");
		process.exit(0);
	} else {
		console.error("CheckUp.js: Some Settings Tests Failed:");
		unexpectedResults.forEach((result) => {
			console.error(`\t${result}`);
		});
	}
	process.exit(1);
}

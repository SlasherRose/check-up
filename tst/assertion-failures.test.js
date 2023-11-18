/* LICENSE INFORMATION */
/* This file is a unit test for the library CheckUp.js
 * CheckUp.js is licensed under the MIT License.
 *
 * https://github.com/SlasherRose/check-up
 */

import { Tests, assert } from "check-up";
import * as Errors from "../src/module/errors.js";

/* TEST INFORMATION */
/* This test ensures that all assertions fail when appropriate.
 * with the correct error message.
 *
 * To add a new assertion failure test, add a new test to the
 * failures.test() call below, then set the expected error
 * message in the expectedFailures map.
 *
 * (Note: all errors should be defined in src/check-up/errors.js)
 */

console.debug(
	"CheckUp.js: Testing That All Assertions Fail When Appropriate..."
);

const config = {
	quiet: true,
};
const failures = new Tests("AssertionSuccesses", config);
const expectedFailures = new Map();

failures.test("assertTrue", () => {
	assert(false).isTrue();
});
expectedFailures.set("assertTrue", Errors.AssertionFailedTrue(false));

failures.test("assertFalse", () => {
	assert(true).isFalse();
});
expectedFailures.set("assertFalse", Errors.AssertionFailedFalse(true));

failures.test("assertEqual", () => {
	assert(1).equals(2);
});
expectedFailures.set("assertEqual", Errors.AssertionFailedEquals(2, 1));

failures.test("assertNotEqual", () => {
	assert(1).notEquals(1);
});
expectedFailures.set("assertNotEqual", Errors.AssertionFailedNotEquals(1, 1));

failures.test("assertContains", () => {
	assert("defgh").contains("abc");
});
expectedFailures.set(
	"assertContains",
	Errors.AssertionFailedContains("defgh", "abc")
);

failures.test("assertContainsIsNull", () => {
	assert(null).contains("abc");
});
expectedFailures.set(
	"assertContainsIsNull",
	Errors.AssertionFailedContainsIsNull(null, "abc")
);

failures.test("assertNotContains", () => {
	assert("abcdef").notContains("abc");
});
expectedFailures.set(
	"assertNotContains",
	Errors.AssertionFailedNotContains("abcdef", "abc")
);

failures.test("assertNotNull", () => {
	assert(null).isNotNull();
});
expectedFailures.set("assertNotNull", Errors.AssertionFailedNotNull(null));

failures.test("assertNull", () => {
	assert("abc").isNull();
});
expectedFailures.set("assertNull", Errors.AssertionFailedNull("abc"));

failures.test("assertUndefined", () => {
	let a = "abc";
	assert(a).isUndefined();
});
expectedFailures.set("assertUndefined", Errors.AssertionFailedUndefined("abc"));

failures.test("assertNotUndefined", () => {
	assert(undefined).isNotUndefined();
});
expectedFailures.set(
	"assertNotUndefined",
	Errors.AssertionFailedNotUndefined(undefined)
);

failures.test("assertTruthyBlankString", () => {
	assert("").isTruthy();
});
expectedFailures.set(
	"assertTruthyBlankString",
	Errors.AssertionFailedTruthy("")
);

failures.test("assertTruthyZero", () => {
	assert(0).isTruthy();
});
expectedFailures.set("assertTruthyZero", Errors.AssertionFailedTruthy(0));

failures.test("assertTruthyFalse", () => {
	assert(false).isTruthy();
});
expectedFailures.set("assertTruthyFalse", Errors.AssertionFailedTruthy(false));

failures.test("assertFalsyString", () => {
	assert("abc").isFalsy();
});
expectedFailures.set("assertFalsyString", Errors.AssertionFailedFalsy("abc"));

failures.test("assertFalsyOne", () => {
	assert(1).isFalsy();
});
expectedFailures.set("assertFalsyOne", Errors.AssertionFailedFalsy(1));

failures.test("assertFalsyTrue", () => {
	assert(true).isFalsy();
});
expectedFailures.set("assertFalsyTrue", Errors.AssertionFailedFalsy(true));

failures.test("assertType", () => {
	assert(1).isType("string");
});
expectedFailures.set("assertType", Errors.AssertionFailedIsType("string", 1));

failures.test("assertNotType", () => {
	assert("abc").isNotType("string");
});
expectedFailures.set(
	"assertNotType",
	Errors.AssertionFailedIsNotType("string", "abc")
);

failures.test("assertFails", () => {
	assert(() => {}).fails();
});
expectedFailures.set("assertFails", Errors.AssertionFailedError());

failures.test("assertFailsWithError", () => {
	assert(() => {
		throw new Error("test");
	}).failsWithError(new Error("test1"));
});
expectedFailures.set(
	"assertFailsWithError",
	Errors.AssertionFailedSpecificError("test", "test1")
);

failures.test("assertSucceeds", () => {
	assert(() => {
		throw new Error("test");
	}).succeeds();
});
expectedFailures.set(
	"assertSucceeds",
	Errors.AssertionFailedNoError(new Error("test"))
);

failures.test("assertFailsBadErrorTypePrimitive", () => {
	assert(() => {}).failsWithError(1);
});
expectedFailures.set(
	"assertFailsBadErrorTypePrimitive",
	Errors.AssertionErrorInvalidErrorType(typeof 1)
);

failures.test("assertFailsBadErrorTypeObj", () => {
	assert(() => {}).failsWithError({});
});
expectedFailures.set(
	"assertFailsBadErrorTypeObj",
	Errors.AssertionErrorInvalidErrorType("non-error object")
);

failures.test("assertFailsBadErrorTypeArray", () => {
	assert(() => {}).failsWithError([]);
});
expectedFailures.set(
	"assertFailsBadErrorTypeArray",
	Errors.AssertionErrorInvalidErrorType("non-error object")
);

failures.test("assertPassesBadCallbackType", () => {
	assert(1).succeeds();
});
expectedFailures.set(
	"assertPassesBadCallbackType",
	Errors.AssertionErrorCallbackMustBeFunction()
);

failures.test("assertFailsBadCallbackType", () => {
	assert(1).failsWithError(new Error("test"));
});
expectedFailures.set(
	"assertFailsBadCallbackType",
	Errors.AssertionErrorCallbackMustBeFunction("Error")
);

failures.endTests();
const report = failures.report({ printReport: false });

verifyAccurateErrorReporting();

console.debug("CheckUp.js: Assertion Failure Verified!");
process.exit(0);

function verifyAccurateErrorReporting() {
	let invalid = false;

	invalid = !checkCorrectErrorsThrown();
	invalid = !checkAllReportsFail();

	if (invalid) {
		console.error(
			"CheckUp.js: Some Assertions Are Not Behaving As Expected (See above)"
		);
		process.exit(1);
	}
}

function checkCorrectErrorsThrown() {
	let passes = true;
	report.failed.forEach((test) => {
		const name = test.testName;
		const expectedErr = expectedFailures.get(name);
		const actualErr = test.error;
		if (!correctErrorWasThrown(expectedErr, actualErr)) {
			passes = false;
			printIncorrectErrorThrownMessage(name, expectedErr, actualErr);
		}
	});
	return passes;
}

function checkAllReportsFail() {
	if (report.totalSucceeded > 0) {
		printSomeAssertionsPassedMessage(report.succeeded);
		return false;
	}
	return true;
}

function correctErrorWasThrown(expectedErr, actualErr) {
	return expectedErr.message === actualErr.message;
}

function printIncorrectErrorThrownMessage(name, expectedErr, actualErr) {
	console.error(
		`CheckUp.js: Assertion Failure Did Not Match Expected Error:\n\to test name:\n\t   ${name}\n\to expected:\n\t   ${expectedErr.message}\n\to actual:\n\t   ${actualErr.message}`
	);
}

function printSomeAssertionsPassedMessage(successes) {
	console.error(
		`CheckUp.js: Some Assertions Succeeded Where They Should Have Failed:`
	);
	console.error(`\t${successes.map((test) => test.testName).join(", ")}`);
}

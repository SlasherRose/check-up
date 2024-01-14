/* LICENSE INFORMATION */
/* This file is a unit test for the library CheckUp.js
 * CheckUp.js is licensed under the MIT License.
 *
 * https://github.com/SlasherRose/check-up
 */

import { Tests, assert } from "@slasherrose/check-up";

/* TEST INFORMATION */
/* This test ensures that all assertions succeed when appropriate.
 *
 * To add a new assertion success test, add a new test to the
 * successes.test() call below.
 */

console.debug(
	"CheckUp.js: Testing That All Assertions Succeed When Appropriate..."
);

const config = {
	quiet: true,
};
const successes = new Tests("AssertionSuccesses", config);

successes.test("assertTrue", () => {
	assert(true).isTrue();
});

successes.test("assertFalse", () => {
	assert(false).isFalse();
});

successes.test("assertEqual", () => {
	assert(1).equals(1);
});

successes.test("assertNotEqual", () => {
	assert(1).notEquals(2);
});

successes.test("assertContains", () => {
	assert("abcdef").contains("abc");
});

successes.test("assertNotContains", () => {
	assert("defgh").notContains("abc");
});

successes.test("assertNotNull", () => {
	assert("abc").isNotNull();
});

successes.test("assertNull", () => {
	assert(null).isNull();
});

successes.test("assertUndefined", () => {
	let a;
	assert(a).isUndefined();
});

successes.test("assertNotUndefined", () => {
	let a;
	a = 1;
	assert(a).isNotUndefined();
});

successes.test("assertTruthy", () => {
	assert("abc").isTruthy();
	assert(1).isTruthy();
	assert(true).isTruthy();
	assert({}).isTruthy();
	assert([]).isTruthy();
	assert(new Date()).isTruthy();
	assert(() => {}).isTruthy();
});

successes.test("assertFalsy", () => {
	assert("").isFalsy();
	assert(0).isFalsy();
	assert(false).isFalsy();
	assert(null).isFalsy();
});

successes.test("assertType", () => {
	assert("abc").isType("string");
});

successes.test("assertNotType", () => {
	assert(1).isNotType("string");
});

successes.test("assertFails", () => {
	assert(() => {
		throw new Error("test");
	}).fails();
});

successes.test("assertFailsWithError", () => {
	assert(() => {
		throw new Error("test");
	}).failsWithError(new Error("test"));
});

successes.test("assertSucceeds", () => {
	assert(() => {}).succeeds();
});
successes.endTests();
const report = successes.report({ printReport: false });

verifyAllSucceed();

console.debug("CheckUp.js: Assertion Successes Verified!");
process.exit(0);

function verifyAllSucceed() {
	if (report.totalFailed > 0) {
		console.error(
			`CheckUp.js: Some Assertions That Should Have Succeeded Have Failed!`
		);
		report.print({
			withBanner: false,
			withSummaryTable: false,
			withDetailedReport: false,
			withSummary: false,
		});
		process.exit(1);
	}
}

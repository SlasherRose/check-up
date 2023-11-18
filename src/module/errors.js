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

const AssertionFailedSpyWasNotCalled = (name) =>
	new AssertionFailure(`method '${name}' was not called`);
const AssertionFailedSpyWasCalled = (name) =>
	new AssertionFailure(`method '${name}' was called`);
const AssertionFailedSpyWasNotCalledWhileCheckingArgs = (name) =>
	new AssertionFailure(
		`method '${name}' was not called, cannot check for args`
	);
const AssertionFailedSpyWasCalledWithArgs = (name, args) =>
	new AssertionFailure(`method '${name}' was called with ${args}`);
const AssertionFailedSpyWasNotCalledWithArgs = (name, args) =>
	new AssertionFailure(`method '${name}' was not called with ${args}`);

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

export {
	AssertionErrorCallbackMustBeFunction,
	AssertionErrorInvalidErrorType,
	AssertionFailedContains,
	AssertionFailedContainsIsNull,
	AssertionFailedEquals,
	AssertionFailedError,
	AssertionFailedFalse,
	AssertionFailedFalsy,
	AssertionFailedIsNotType,
	AssertionFailedIsType,
	AssertionFailedNoError,
	AssertionFailedNotContains,
	AssertionFailedNotEquals,
	AssertionFailedNotNull,
	AssertionFailedNotUndefined,
	AssertionFailedNull,
	AssertionFailedSpecificError,
	AssertionFailedSpyWasCalled,
	AssertionFailedSpyWasCalledWithArgs,
	AssertionFailedSpyWasNotCalled,
	AssertionFailedSpyWasNotCalledWhileCheckingArgs,
	AssertionFailedSpyWasNotCalledWithArgs,
	AssertionFailedTrue,
	AssertionFailedTruthy,
	AssertionFailedUndefined,
	CannotAddTestAfterTestsHaveStarted,
	CannotCalculateResultsNoTestsRun,
	CannotCalculateResultsResultsAlreadyCalculated,
	CannotModifyTestsAfterTestsHaveStarted,
	CannotRetrieveReportResultsNotReady,
	TestTypeErrorSuiteNameMustBeString,
};

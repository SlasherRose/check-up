# CheckUp.js

CheckUp.js is a vanilla, lightweight library designed to spot-check projects written in JavaScript (or typescript) in an environment-agnostic way. It has no dependencies and can be quickly and easily copy-pasted into projects and modified to suit your needs, while also providing out-of-the-box features for common use cases.

#### PLEASE NOTE: CHECKUP.JS IS NOT MEANT FOR RIGOROUS TESTING. IT IS MEANT FOR LOW-STAKES, SMALL PROJECT UNIT TESTING AND DEBUGGING. PLEASE USE TESTING FRAMEWORKS SUCH AS JEST OR MOCHA FOR MORE ROBUST AND RELIABLE TESTING

Out-of-the-box features include:

-  Testing Suite
-  Basic Assertion Testing
-  Report Generation
-  TS declaration file

## Table of Contents

-  [Installation](#installation)
-  [Usage and Examples](#usage)
-  [Documentation](#documentation)

## Installation

CheckUp.js is designed to be easily implemented into any project. As such, there are multiple ways to add it to your project.

### Method 1: Copy-Paste Files

For certain projects, it can be use to have total control over the files included. To accommodate this use case, files from this library can easily be transferred into your project for use.

#### • Add to a Common JS Project

The default for node applications is common-js, which means if you are using node and not explicitly using modules, this will most likely be the best option for you

##### Step 1: Go to ./src and copy the folder 'common-js' into the directory where your tests are run

##### Step 2: Rename the 'common-js' folder to 'CheckUp' (for clarity)

##### Step 3: In your tests file, you can now import using the following line

`const { Tests, assert } = require("./CheckUp");`

#### • Add to an ES module Project

ES modules are the default choice for modern JavaScript projects, especially when working in a browser environment or leveraging the latest ECMAScript features.

##### Step 1: Go to ./src and copy the folder 'modules' into the directory where your tests are run

##### Step 2: Rename the 'modules' folder to 'CheckUp' (for clarity)

##### Step 3: In your tests file, you can now import using the following line

`import { Tests, assert } from "./CheckUp/index.js";`

#### Add to A TypeScript Project

CheckUp.js comes with a type declaration for both common-js and module. To include in your TypeScript project, follow the above instructions for your preferred system. (Note, it is very likely that 'common-js' will be the correct choice for you in this step if you are using Node.js)

## Usage

### Basics

This library allows you to create a suite of tests that returns a result after running. This result can be printed to the console or returned as a measure of success.

#### Test Creation / Life Cycle:

```
const { Tests } = require("./index.js");

const demoTests = new Tests("DemoTests");

// Because no error is thrown, this test is successful
demoTests.test("testIsSuccessful", () => {
	const foo = "bar";
});

// Any error thrown during the test will cause it to fail
demoTests.test("testIsFailure", () => {
	const foo = "bar";
	throw new Error("This test is a failure");

});

// This marks the end of the tests
// It will return an array TestResults, including test name, if it
// succeeded, and what error (if any) was thrown
// By default, this will print the below statement to the console
// To prevent it from printing, use the following settings
// const demoTests = new Tests("DemoTests", { quiet = true });
const demoResults = demoTests.endTests();
```

#### Output:

```
========================
==  - - DemoTests - - ==
========================

Tests:

 [✔] testIsSuccessful
 [X] testIsFailure:
        [examples.js:11] Error: This test is a failure

┌──────────────┬────────┐
│   (index)    │ Values │
├──────────────┼────────┤
│ Total Tests  │   2    │
│  Succeeded   │   1    │
│    Failed    │   1    │
│ Success Rate │ '50 %' │
│ Failure Rate │ '50 %' │
└──────────────┴────────┘
Failed Tests:
testIsFailure,
```

#### Assertion Testing

CheckUp.js includes a basic assertion testing kit, that works by throwing custom errors when an assertion fails. This can be caught by the test suite, then included in the report

```
const CheckUp = require("./index.js");
const Tests = CheckUp.Tests;

const demoAssertions = new Tests("DemoAssertions");

// onTestStart() will be called before each test is run.
// it's counterpart, onTestFinish() exists to run at the end of each test

let a, b;
demoAssertions.onTestStart(() => {
	a = 1;
	b = 2;
});

// This assertion will pass
demoAssertions.test("testAssertTrue", () => {
	b = 1;
	CheckUp.assert(a === b).isTrue();
});

// This assertion will pass (a and b are set by onTestStart)
demoAssertions.test("testAssertFalse", () => {
	CheckUp.assert(a === b).isFalse();
});

// This assertion will fail
demoAssertions.test("testAssertType", () => {
	CheckUp.assert(a).isType("string");
});

const results = demoAssertions.endTests();
```

#### Output:

```
=============================
==  - - DemoAssertions - - ==
=============================

Tests:

 [✔] testAssertTrue
 [✔] testAssertFalse
 [X] testAssertType:
        [Assertion Failed] Expected '1' to be of type 'string'

┌──────────────┬───────────┐
│   (index)    │  Values   │
├──────────────┼───────────┤
│ Total Tests  │     3     │
│  Succeeded   │     2     │
│    Failed    │     1     │
│ Success Rate │ '66.67 %' │
│ Failure Rate │ '33.33 %' │
└──────────────┴───────────┘
Failed Tests:
testAssertType,
```

# Documentation

## Tests Class

The `Tests` class is a testing framework that allows you to define and run tests.

### new Tests(testSuiteName, testOptions)

Creates a new instance of the `Tests` class with an optional test suite name and [configuration options](#TestOptions).

### tests.onStart(...callbacks)

Registers callbacks to be executed when the test suite starts.

### tests.onTestStart(...callbacks)

Registers callbacks to be executed when each test starts.

### tests.onShowResults(...callbacks)

Registers callbacks to be executed when test results are about to be shown.

### tests.onTestFinish(...callbacks)

Registers callbacks to be executed when each test finishes.

### tests.test(testName, ( ) =>{ ... })

Defines a new test with a name (to help identify tests that past and fail) and test function.

### tests.endTests( )

Ends the test suite and returns an array of [TestResults](#testresults) representing the results of each test. Will print a report unless otherwise specified by the [configuration options](#testoptions).

### tests.report(print?: boolean)

Generates and returns a [ResultsSummary](#resultssummary) object, optionally printing the results based on the `print` parameter.

## Assert Function

The `assert` function provides various assertion methods for writing tests.

### List of assertion functions

-  `assert(a).equals(b)`
-  `assert(a).notEquals(b)`
-  `assert(a).isTrue()`
-  `assert(a).isFalse()`
-  `assert(a).isTruthy()`
-  `assert(a).isFalsy()`
-  `assert(a).isNull()`
-  `assert(a).isNotNull()`
-  `assert(a).isUndefined()`
-  `assert(a).isNotUndefined()`
-  `assert(a).contains(included)`
-  `assert(a).notContains(included)`
-  `assert(a).isType(expectedType)`
-  `assert(a).isNotType(expectedType)`
-  `assert(a).fails(onFinally)`
-  `assert(a).failsWithError(expectedError, onFinally)`
-  `assert(a).succeeds(onFinally)`

## TestOptions

Test options are formatted with the following variables

```
TestOptions = {
	quite: boolean;
	printErrorsOnTest?: boolean;
	printReportIndividualTestResults?: boolean;
	printReportSummaryTable?: boolean;
	printReportSummary?: boolean;
	printReportBanner?: boolean;
	printReportFailedTests?: boolean;
}
```

-  `quite`: If`true` nothing will be printed to the console during or after the tests run
-  `printErrorsOnTest` : If `true`, errors encountered during a test will be printed on endTests. (these will always be above the report, as tests run as they are declared)
-  `printReportIndividualTestResults`: If `true`, individual test results will be printed on endTests with a ✔ or **X** to indicate if they succeeded or failed.
-  `printReportSummaryTable` : If `true`, a summary table of test results will be printed on endTests. (Includes # failed, passed, and percentage of failures/successes).
-  `printReportSummary`: If `true`, a single-line summary will be printed on endTests indicating the number of failures (if any) or the number of tests successfully ran
-  `printReportBanner` : If `true`, a banner for the test report will be printed on endTests (can be useful for separating multiple test reports)
-  `printReportFailedTests` : If `true`, a list of all tests failed will be printed on endTests

## ResultsSummary

### Methods

-  `print(options?: ResultsSummaryPrintOptions)`: Prints the test results summary based on the specified options.

### Data

-  `succeeded`: An array containing [test results](#testresults) for successful tests.
-  `failed`: An array containing [test results](#testresults) for failed tests.
-  `testResults`: An array containing all tests run.
-  `totalSucceeded`: The total number of successful tests.
-  `totalFailed`: The total number of failed tests.
-  `totalTests`: The total number of tests.
-  `successRate`: The percentage of successful tests.
-  `failureRate`: The percentage of failed tests.
-  `title`: The title of the test results summary.

## TestResults

The `TestResults` interface represents the results of an individual test.

-  `testName`: The name of the test.
-  `succeeded`: Indicates whether the test succeeded
-  `error` (optional Error): If the test failed, this property contains information about the error.

declare interface TestResults {
	testName: string;
	succeeded: boolean;
	error?: Error;
}
declare interface TestOptions {
	quite: boolean;
	printErrorsOnTest?: boolean;

	printReportIndividualTestResults?: boolean;
	printReportSummaryTable?: boolean;
	printReportSummary?: boolean;
	printReportBanner?: boolean;
	printReportFailedTests?: boolean;
}
declare class Tests {
	constructor(testSuiteName?: string, options?: TestOptions);
	onStart(...callbacks: (() => void)[]): void;
	onTestStart(...callbacks: (() => void)[]): void;
	onShowResults(...callbacks: (() => void)[]): void;
	onTestFinish(...callbacks: (() => void)[]): void;
	test(testName: string, test: () => void): void;
	endTests(): TestResults[];
	report(print?: boolean): ResultsSummary;
	testSuiteName: string;
}
declare interface ResultsSummaryPrintOptions {
	withBanner?: boolean;
	withDetailedReport?: boolean;
	withSummaryTable?: boolean;
	withSummary?: boolean;
	withFailures?: boolean;
}
declare class ResultsSummary {
	constructor(results: TestResults[]);
	setTitle(title: string): void;
	print(options?: ResultsSummaryPrintOptions): void;
	succeeded: Array<TestResults>;
	failed: Array<TestResults>;
	testResults: Array<TestResults>;
	totalSucceeded: number;
	totalFailed: number;
	totalTests: number;
	successRate: number;
	failureRate: number;
	title: string;
}
declare function assert(actual: any): {
	equals: (expected: any) => void;
	notEquals: (expected: any) => void;
	isTrue: () => void;
	isFalse: () => void;
	isTruthy: () => void;
	isFalsy: () => void;
	isNull: () => void;
	isNotNull: () => void;
	isUndefined: () => void;
	isNotUndefined: () => void;
	contains: (included: any) => void;
	notContains: (included: any) => void;
	isType: (expectedType: string) => void;
	isNotType: (expectedType: string) => void;
	fails: (onFinally?: any) => void;
	failsWithError: (expectedError: Error, onFinally?: any) => void;
	succeeds: (onFinally?: any) => void;
};

export { Tests, assert };

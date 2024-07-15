
const dayjs = require("dayjs");
const dayjsutc = require("dayjs/plugin/utc");
dayjs.extend(dayjsutc);

const helpers = require("../calculate-leave-days");

describe("calculateTotalDays(): calculate total number of days between two dates", () => {
  const testCases = [
    { startDate: "2024-05-27", endDate: "2024-05-27", expected: 1 },
    { startDate: "2024-05-27", endDate: "2024-05-28", expected: 2 },
    { startDate: "2024-05-27", endDate: "2024-05-29", expected: 3 },
    { startDate: "2024-05-27", endDate: "2024-05-30", expected: 4 },
    { startDate: "2024-05-27", endDate: "2024-05-31", expected: 5 },
    { startDate: "2024-05-27", endDate: "2024-06-01", expected: 6 },
    { startDate: "2024-05-27", endDate: "2024-06-02", expected: 7 },
    { startDate: "2024-05-27", endDate: "2024-06-03", expected: 8 },
    { startDate: "2024-05-27", endDate: "2024-06-04", expected: 9 },
    { startDate: "2024-05-27", endDate: "2024-06-05", expected: 10 }
  ];
  let testCase,
    startDate,
    endDate,
    totalDays;

  for (let index = 0; index < testCases.length; index++) {
    testCase = testCases[index];
    startDate = testCase.startDate;
    endDate = testCase.endDate;
    totalDays = helpers.calculateTotalDays(new Date(startDate), new Date(endDate));

    it(`from [${startDate}] to [${endDate}] should equal [${testCase.expected}]`, () => {
      expect(totalDays)
        .toBe(testCase.expected);
    });
  }
});

describe("calculateWeekendDays(): calculate only the weekend days between two dates", () => {
  const testCases = [
    { startDate: "2024-05-27", endDate: "2024-05-27", expected: 0 },
    { startDate: "2024-05-27", endDate: "2024-05-28", expected: 0 },
    { startDate: "2024-05-27", endDate: "2024-05-29", expected: 0 },
    { startDate: "2024-05-27", endDate: "2024-05-30", expected: 0 },
    { startDate: "2024-05-27", endDate: "2024-05-31", expected: 0 },
    { startDate: "2024-05-27", endDate: "2024-06-01", expected: 1 },
    { startDate: "2024-05-27", endDate: "2024-06-02", expected: 2 },
    { startDate: "2024-05-27", endDate: "2024-06-03", expected: 2 },
    { startDate: "2024-05-27", endDate: "2024-06-04", expected: 2 },
    { startDate: "2024-05-27", endDate: "2024-06-05", expected: 2 },
    { startDate: "2024-05-27", endDate: "2024-06-06", expected: 2 },
    { startDate: "2024-05-27", endDate: "2024-06-07", expected: 2 },
    { startDate: "2024-05-27", endDate: "2024-06-08", expected: 3 },
    { startDate: "2024-05-27", endDate: "2024-06-09", expected: 4 },
    { startDate: "2024-05-27", endDate: "2024-06-10", expected: 4 }
  ];
  let testCase,
    startDate,
    endDate,
    weekendDays;

  for (let index = 0; index < testCases.length; index++) {
    testCase = testCases[index];
    startDate = testCase.startDate;
    endDate = testCase.endDate;
    weekendDays = helpers.calculateWeekendDays(new Date(startDate), new Date(endDate));

    it(`from [${startDate}] to [${endDate}] should equal [${testCase.expected}]`, () => {
      expect(weekendDays)
        .toBe(testCase.expected);
    });
  }
});

if (INCLUDE_INTEGRATION_TESTS) {
  console.warn("PROCEEDING WITH INTEGRATION TESTS!")

  // IMPORTANT:
  // The following test suites all include integration
  // We may need to skip these during CI/CD workflows
  describe("calculatePublicHolidaysAsync(): determine total number of leave-applicable public holidays between two dates", () => {
    const testCases = [ // Using Google Calendar API
      { startDate: "2024-05-27", endDate: "2024-05-31", expected: 1 },
      { startDate: "2024-05-27", endDate: "2024-05-28", expected: 0 },
      { startDate: "2024-05-30", endDate: "2024-06-02", expected: 1 },
      { startDate: "2024-05-27", endDate: "2024-06-20", expected: 2 },
      { startDate: "2024-05-27", endDate: "2024-08-10", expected: 3 }
    ];
    let testCase,
        startDate,
        endDate;

    for (let index = 0; index < testCases.length; index++) {
      testCase = testCases[index];
      startDate = testCase.startDate;
      endDate = testCase.endDate;
      
      it(`from [${startDate}] to [${endDate}] should equal [${testCase.expected}]`, async () => {
        let publicHolidays = await helpers.calculatePublicHolidaysAsync(new Date(startDate), new Date(endDate));

        expect(publicHolidays)
          .toBe(testCase.expected);
      });
    }
  });

  describe("calculateTotalLeaveDaysAsync(): calculate the total number of days of leave that will be deducted between two dates", () => {
    const testCases = [ // Using Google Calendar API
      { startDate: "2024-05-27", endDate: "2024-05-31", expected: 4 },
      { startDate: "2024-05-27", endDate: "2024-05-28", expected: 2 },
      { startDate: "2024-05-27", endDate: "2024-06-02", expected: 4 },
      { startDate: "2024-05-27", endDate: "2024-06-03", expected: 5 },
      { startDate: "2024-05-27", endDate: "2024-06-14", expected: 14 },
      { startDate: "2024-05-27", endDate: "2024-06-18", expected: 15 }
    ];
    let testCase,
        startDate,
        endDate;

    for (let index = 0; index < testCases.length; index++) {
      testCase = testCases[index];
      startDate = testCase.startDate;
      endDate = testCase.endDate;
      
      it(`from [${startDate}] to [${endDate}] should equal [${testCase.expected}]`, async () => {
        let totalLeaveDays = await helpers.calculateTotalLeaveDaysAsync(new Date(startDate), new Date(endDate));

        expect(totalLeaveDays)
          .toBe(testCase.expected);
      });
    }
  });

  describe("getPublicHolidayDatesAsync(): fetches the public holiday dates - specifying start and end dates are optional", () => {
    const testCases = [
      { utcOffset: 120, expected: { dates: [ 
        "2024-08-09", "2024-09-24", "2024-12-25", 
        "2024-05-29", "2024-06-17", "2024-12-16", 
        "2024-06-16", "2024-05-01", "2024-12-26" ] } },
      { startDate: "2024-01-01", endDate: "2025-01-01", utcOffset: 120, expected: { dates: [ 
        "2024-12-26", "2024-05-01", "2024-04-27", "2024-06-16", "2024-04-01", 
        "2024-12-16", "2024-06-17", "2024-05-29", "2024-03-21", "2024-12-25", 
        "2024-09-24", "2024-08-09", "2024-03-29", "2024-01-01" ] } },
      { startDate: "2024-05-01", endDate: "2024-06-01", utcOffset: 120, expected: { dates: [ 
        "2024-05-01", "2024-05-29" ] } },
        { startDate: "2024-04-01", endDate: "2024-05-01", utcOffset: 120, expected: { dates: [ 
          "2024-04-01", "2024-04-27" ] } }
    ];
    let testCase,
        startDate,
        endDate,
        expected,
        expectedDates;

    for (let index = 0; index < testCases.length; index++) {
      testCase = testCases[index];
      startDate = testCase.startDate;
      endDate = testCase.endDate;
      expected = testCase.expected;
      expectedDates = expected.dates.map(date => {
        return dayjs(date)
              .utcOffset(testCase.utcOffset)
              .toDate();
      });
      
      it(`there should be [${expected.dates.length}] public holidays ${ !startDate || !endDate ? "in the default range" : `between [${startDate}] and [${endDate}]` }`, async () => {
        let actual;

        if (!startDate || !endDate) {
          actual = await helpers.getPublicHolidayDatesAsync();
        }
        else {
          actual = await helpers.getPublicHolidayDatesAsync(startDate, endDate);
        }

        expect(actual).toHaveLength(expectedDates.length);
        expect(actual.map(ad => { return ad.getTime(); })).toEqual(expect.arrayContaining(expectedDates.map(ed => { return ed.getTime(); })));
      });
    }
  });
}

# lms-common-custom-lambda-dependencies
A repo where common custom dependencies for the LMS backend are kept. The intent is to allow the LMS backend lambdas to use this library as a dependency by referencing its GitHub repo URL.

Following is a list and description of available modules.

# Calculate leave days (calculate-leave-days.js)
This module exposes a few functions that assist in determining the number of days, weekend days and public holidays given a date range.

This module uses `dayjs` to make it easier to work with dates and times.

## Configuration

This module, in cases of public holidays, relies on an external provider. The first iteration integrates with Google Calendar API and, thus, requires a Google Calendar API key. This key should be configured as an environment variable called `GOOGLE_CALENDAR_API_KEY`.

An attempt was made to have the module fail "gracefully." When the above-mentioned key is not configured, an error will be logged in the console, and, rather than raising an exception, a default value will be returned -- in the case of number of days, 0; in the case of a list of dates, an empty list.

## Testing

This module uses Jest for testing. Tests should be placed in `/jest-tests/`

## Public members

### calculateTotalDays(start, end)

This function takes a start and end date and calculates the total number of days between (no deduction of weekends or public holidays). If the start and end dates are the same, the total is 1. E.g.,
- 2024-06-27 - 2024-07-27 = 1 day
- 2024-06-27 - 2024-07-27 = 31 days
- 2024-07-27 - 2024-08-27 = 32 days

This function doesn't integrate with any external providers.

### calculateWeekendDays(start, end)

This function takes start and end dates and calculates the total number of weekend days between.

This function doesn't integrate with any external providers.

## calculatePublicHolidaysAsync(start, end)

This function attempts to calculate the total number of public holidays that fall on work days between a given start and end date.

This function integrates with an external provider, so please ensure proper configuration before use.

### calculateTotalLeaveDaysAsync(start, end)

This function takes start and end dates and attmpts to calculate the total number of actual leave days; i.e., calculates the total number of days, minus weekend days, minus public holidays.

This function integrates with an external provider, so please ensure proper configuration before use.

### getPublicHolidayDates(start, end)

This function returns a list of public holiday dates as UTC.

This function integrates with an external provider, so please ensure proper configuration before use.


// const moment = require("moment");
const dayjs = require("dayjs");
const dayjsutc = require("dayjs/plugin/utc");
dayjs.extend(dayjsutc);

const isWeekend = (date) => {
  const dateDate = new Date(date);
  const dayOfWeek = dateDate.getDay();

  return dayOfWeek === 0 /*Sunday*/
    || dayOfWeek === 6; /*Saturday*/
};

const calculateTotalDays = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
};

const calculateWeekendDays = (start, end) => {
  let weekendDays = 0;
  const startDate = new Date(start);
  const endDate = new Date(end);

  while (startDate <= endDate) {
    if (isWeekend(startDate)) {
      weekendDays++;
    }

    startDate.setDate(startDate.getDate() + 1);
  }

  return weekendDays;
};

// NOTE:
// This function integrates with a 3rd party API: Google Calendar
// It returns the data from the API as-is; no date conversion or formatting
const getPublicHolidayDatesUsingGoogleCalendarAPIAsync = async (start, end) => {
  const googleApiKeyVarName = "GOOGLE_CALENDAR_API_KEY";
  const apiKey = process.env[googleApiKeyVarName];

  if (!apiKey) {
    return Promise.reject(`Required environment variable [${googleApiKeyVarName}] not configured.`);
  }

  const https = require("https");
  const startDate = new Date(start);
  const endDate = new Date(end);
  const baseUrl = "https://www.googleapis.com/calendar/v3/calendars";
  const region = "en.sa";
  const calendarId = "holiday@group.v.calendar.google.com";
  const startDateString = startDate.toISOString();
  const endDateString = endDate.toISOString();
  const filter = "public holiday";
  const url = `${baseUrl}/${region}%23${calendarId}/events?key=${apiKey}&timeMin=${startDateString}&timeMax=${endDateString}&q=${filter}`;

  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let rawData = "";

        if (response.statusCode === 200) {
          response.on("data", (chunk) => { rawData += chunk; });
          response.on("end", () => {
            try {
              const parsedData = JSON.parse(rawData);
              const publicHolidayDates = parsedData.items.map(holiday => {
                // When a public holiday falls on a weekend day it should
                // not count. Google Calendar API also returns the observed
                // public holiday when the original public holiday falls
                // on a Sunday.
                // return new Date(holiday.start.date);
                // return moment(holiday.start.date).startOf("day").toDate();
                return holiday.start.date;
              });

              resolve(publicHolidayDates);

            } catch (responseParseError) {
              let responseParseErrorMessage = `There was an error parsing the API response: [${responseParseError.message}]`;
              let newResponseParseError = new Error(responseParseErrorMessage);

              reject(newResponseParseError);
            }
          });
        }
        else {
          response.on("data", (chunk) => { rawData += chunk; });
          response.on("end", () => {
            let notOkayResponseCodeMessage = `Received an unexpected response code: [${response.statusCode}] [${response.statusMessage}]`;

            try {
              notOkayResponseCodeMessage += " - " + rawData;
            }
            catch (responseParseError) {
              notOkayResponseCodeMessage += `. But the exact details couldn't be figured out: [${responseParseError}}]`;
            }

            let notOkayResponseCodeError = new Error(notOkayResponseCodeMessage);

            reject(notOkayResponseCodeError);
          });
        }
      })
      .on("error", (httpError) => {
        let httpErrorMessage = `There was an error making the call to the API: [${httpError}]`;
        let newHttpError = new Error(httpErrorMessage);

        reject(newHttpError);
      });
  });
};

// NOTE:
// This function indirectly integrates with a 3rd party API: Google Calendar
const calculatePublicHolidaysUsingGoogleCalendarAPIAsync = async (start, end) => {
  try {
    const publicHolidayDates = await getPublicHolidayDatesUsingGoogleCalendarAPIAsync(start, end);
    const calendarEvents = publicHolidayDates.filter(holidayDate => {
      return !isWeekend(holidayDate);
    });

    return calendarEvents.length;

  } catch (responseParseError) {
    let responseParseErrorMessage = `There was an error parsing the API response: [${responseParseError.message}]`;
    let newResponseParseError = new Error(responseParseErrorMessage);

    throw newResponseParseError;
  }
};

// NOTE:
// This function indirectly integrates with a 3rd party API: Google Calendar
const calculateTotalLeaveDaysAsync = async (start, end) => {
  let publicHolidays = 0;

  try {
    publicHolidays = await calculatePublicHolidaysUsingGoogleCalendarAPIAsync(start, end);
  }
  catch (googleApiError) {
    console.error(`An error occurred while fetching public holidays via Google Calendar API: ${googleApiError}`);

    publicHolidays = 0;
  }

  let totalDays = calculateTotalDays(start, end);
  let weekendDays = calculateWeekendDays(start, end);
  let totalLeaveDays = totalDays - weekendDays - publicHolidays;

  return totalLeaveDays;
};

// NOTE!
// This function indirectly integrates with a 3rd party API: Google Calendar
// This function uses day.js: https://day.js.org/docs/en/installation/node-js
const getPublicHolidayDatesAsync = async (start = null, end = null) => {
  let now = dayjs.utc().startOf("day");

  // Default values
  if (!start) {
    // Default to one month ago
    start = now.clone().subtract(1, "months").startOf("month");
  }
  else {
    start = dayjs.utc(start);
  }

  if (!end) {
    // Default to 6 months from now
    end = now.clone().add(7, "months").startOf("month");
  }
  else {
    end = dayjs.utc(end);
  }

  try {
    const rawPublicHolidayDates = await getPublicHolidayDatesUsingGoogleCalendarAPIAsync(start.toDate(), end.toDate());
    const utcPublicHolidayDates = rawPublicHolidayDates.map(date => dayjs(date).utc().toDate());

    return utcPublicHolidayDates;
  }
  catch (getPublicHolidaysError) {
    console.error(`An error occurred while fetching public holidays via Google Calendar API: ${getPublicHolidaysError}`);

    return [];
  }
};

module.exports = {
  calculateTotalDays: calculateTotalDays,
  calculateWeekendDays: calculateWeekendDays,
  calculatePublicHolidaysAsync: calculatePublicHolidaysUsingGoogleCalendarAPIAsync,
  calculateTotalLeaveDaysAsync: calculateTotalLeaveDaysAsync,
  getPublicHolidayDatesAsync: getPublicHolidayDatesAsync
};

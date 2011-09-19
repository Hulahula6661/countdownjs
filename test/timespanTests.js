try{

// spoofs as a Timespan
function fakeTimespan(map) {
	var ts = countdown.empty();
	for (var key in map) {
		if (map.hasOwnProperty(key)) {
			ts[key] = map[key];
		}
	}
	return ts;
}

module("countdown.timespan(...)");

test("Zero", function() {

	var start = 0;
	var end = 0;

	var expected = fakeTimespan({
		start: new Date(0),
		end: new Date(0),
		units: countdown.ALL,
		value: 0,
		millennia: 0,
		centuries: 0,
		years: 0,
		months: 0,
		weeks: 0,
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
		milliseconds: 0
	});

	var actual = countdown.timespan(start, end);

	same(actual, expected, "");
});

test("1 ms", function() {

	var start = 0;
	var end = 1;

	var expected = fakeTimespan({
		start: new Date(0),
		end: new Date(1),
		units: countdown.ALL,
		value: 1,
		millennia: 0,
		centuries: 0,
		years: 0,
		months: 0,
		weeks: 0,
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
		milliseconds: 1
	});

	var actual = countdown.timespan(start, end);

	same(actual, expected, "");
});

test("1 sec", function() {

	var start = 10000;
	var end = 11000;

	var expected = fakeTimespan({
		start: new Date(10000),
		end: new Date(11000),
		units: countdown.ALL,
		value: 1000,
		millennia: 0,
		centuries: 0,
		years: 0,
		months: 0,
		weeks: 0,
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 1,
		milliseconds: 0
	});

	var actual = countdown.timespan(start, end);

	same(actual, expected, "");
});

test("5 min, reversed", function() {

	var start = (5 * 60 * 1000);
	var end = 0;

	var expected = fakeTimespan({
		start: new Date(5 * 60 * 1000),
		end: new Date(0),
		units: countdown.ALL,
		value: -(5 * 60 * 1000),
		millennia: 0,
		centuries: 0,
		years: 0,
		months: 0,
		weeks: 0,
		days: 0,
		hours: 0,
		minutes: 5,
		seconds: 0,
		milliseconds: 0
	});

	var actual = countdown.timespan(start, end);

	same(actual, expected, "");
});

test("constant 1 month span, daily over 5 years", function() {

	var daySpan = 24 * 60 * 60 * 1000;
	var start = new Date(1999, 10, 1, 12, 0, 0);

	var expected = fakeTimespan({
		start: start,
		end: start,
		value: 0,
		units: countdown.ALL,
		millennia: 0,
		centuries: 0,
		years: 0,
		months: 1,
		weeks: 0,
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
		milliseconds: 0
	});

	for (var t=0, range=5*365.2425; t<range; t++) {
		// end should always be one month away
		var end = new Date(start.getTime());
		end.setUTCMonth( end.getUTCMonth()+1 );

		// skip situations like "Jan 31st + month"
		if (end.getUTCMonth() === start.getUTCMonth()+1) {
			expected.start = start;
			expected.end = end;
			expected.value = end.getTime() - start.getTime();
	
			var actual = countdown.timespan(start, end);
	
			same(actual, expected, "");
		}

		// add a day
		start = new Date( start.getTime()+daySpan );
	}
});

test("contiguous daily countdown over 31 weeks", function() {

	var daySpan = 24 * 60 * 60 * 1000;
	var units = countdown.WEEKS | countdown.DAYS;
	var start = new Date(2007, 10, 10, 5, 30, 0);
	var end = new Date(2008, 5, 14, 16, 0, 0);

	var expected = { weeks: 31, days: 0 };

	while (start.getTime() < end.getTime()) {

		var actual = countdown.timespan(start, end, units);
		actual = {
			weeks: actual.weeks,
			days: actual.days
		};

		same(actual, expected, "");

		// add a day
		start = new Date( start.getTime()+daySpan );

		// store
		if (actual.days) {
			expected = {
				weeks: actual.weeks,
				days: actual.days-1
			};
		} else {
			expected = {
				weeks: actual.weeks-1,
				days: 6
			};
		}
	}
});

test("contiguous daily countdown over 7 months", function() {

	var daySpan = 24 * 60 * 60 * 1000;
	var units = countdown.MONTHS | countdown.DAYS;
	var start = new Date(2007, 10, 10, 5, 30, 0);
	var end = new Date(2008, 5, 14, 16, 0, 0);

	var expected = { months: 7, days: 4 };

	while (start.getTime() < end.getTime()) {

		var actual = countdown.timespan(start, end, units);
		actual = {
			months: actual.months,
			days: actual.days
		};

		same(actual, expected, "");

		// add a day
		start = new Date( start.getTime()+daySpan );

		// set up next iteration
		if (actual.days) {
			expected = {
				months: actual.months,
				days: actual.days-1
			};
		} else {
			expected = {
				months: actual.months-1,
				// the number of days in start month minus one
				days: Math.round((new Date(start.getFullYear(), start.getMonth()+1, 15).getTime() - new Date(start.getFullYear(), start.getMonth(), 15).getTime()) / (24 * 60 * 60 * 1000))-1
			};
		}
	}
});

test("contiguous weekly countdown over 7 months", function() {

	var daySpan = 24 * 60 * 60 * 1000;
	var units = countdown.MONTHS | countdown.WEEKS;
	var start = new Date(2007, 10, 10, 5, 30, 0);
	var end = new Date(2008, 5, 14, 16, 0, 0);

	// calc by days since easier
	var prev = { months: 7, days: 4 };

	while (start.getTime() < end.getTime()) {

		var actual = countdown.timespan(start, end, units);
		actual = {
			months: actual.months,
			weeks: actual.weeks
		};

		// convert to weeks just before compare
		var expected = { months: prev.months, weeks: Math.floor(prev.days/7) };

		same(actual, expected, "");

		// add a day
		start = new Date( start.getTime()+daySpan );

		// set up next iteration
		if (prev.days) {
			prev = {
				months: prev.months,
				days: prev.days-1
			};
		} else {
			prev = {
				months: prev.months-1,
				// the number of days in start month minus one
				days: Math.round((new Date(start.getFullYear(), start.getMonth()+1, 15).getTime() - new Date(start.getFullYear(), start.getMonth(), 15).getTime()) / (24 * 60 * 60 * 1000))-1
			};
		}
	}
});

test("contiguous daily count up over 7 months", function() {

	var daySpan = 24 * 60 * 60 * 1000;
	var units = countdown.MONTHS | countdown.DAYS;
	var goalTime = new Date(2008, 5, 14, 16, 0, 0).getTime();
	var start = new Date(2007, 10, 10, 5, 30, 0);
	var end = new Date(start.getTime());

	var expected = { months: 0, days: 0 };

	while (end.getTime() < goalTime) {

		var actual = countdown.timespan(start, end, units);
		actual = {
			months: actual.months,
			days: actual.days
		};

		same(actual, expected, JSON.stringify(start)+" to "+JSON.stringify(end));

		// add a day
		end = new Date( end.getTime()+daySpan );

		// set up next iteration
		// compare to the number of days in start month
		if (actual.days !== Math.round((new Date(start.getFullYear(), start.getMonth()+1, 15).getTime() - new Date(start.getFullYear(), start.getMonth(), 15).getTime()) / (24 * 60 * 60 * 1000))-1) {
			expected = {
				months: actual.months,
				days: actual.days+1
			};
		} else {
			expected = {
				months: actual.months+1,
				days: 0
			};
		}
	}
});

}catch(ex){alert(ex);}
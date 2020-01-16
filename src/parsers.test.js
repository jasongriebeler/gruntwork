const parsers = require('./parsers');

test("single date", () => {
    expect(parsers.parseSingleDateTitle("W/O - 10.10.19")).toBe("WO-10-10-19");
});

test("multiple dates", () => {
    console.log(parsers.parseSingleDateTitle("10.14 – 10.20 Workouts"));
});
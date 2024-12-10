let table;

let dropdown;

// Manuelt angivne datoer
let days = [
  { start: new Date('2024-10-29T20:00:00'), end: new Date('2024-10-30T11:00:00') },
  { start: new Date('2024-10-30T20:00:00'), end: new Date('2024-10-31T11:00:00') },
  { start: new Date('2024-10-31T20:00:00'), end: new Date('2024-11-01T11:00:00') },
  { start: new Date('2024-11-01T20:00:00'), end: new Date('2024-11-02T11:00:00') },
  { start: new Date('2024-11-02T20:00:00'), end: new Date('2024-11-03T11:00:00') },
  { start: new Date('2024-11-03T20:00:00'), end: new Date('2024-11-04T11:00:00') },
  { start: new Date('2024-11-04T20:00:00'), end: new Date('2024-11-05T11:00:00') },
  { start: new Date('2024-12-02T20:00:00'), end: new Date('2024-12-03T11:00:00') },
  { start: new Date('2024-12-04T20:00:00'), end: new Date('2024-12-05T11:00:00')},
];

let boxHeight = 80;
let boxWidth = 490;
let boxMarginLeft = 10;
let hoursWidth = 12;

function setup() {
  createCanvas(500, 1000);

  // Opret dropdown med datoer
  dropdown = createSelect();
  dropdown.position(70, 10);
  dropdown.option('Vælg Dag');

  // Populér dropdown med formaterede datoer
  days.forEach((day, index) => {
    const formattedDate = day.start.toISOString().split('T')[0]; // YYYY-MM-DD
    dropdown.option(formattedDate, index);
  });

  dropdown.changed(() => {
    let selectedDayIndex = parseInt(dropdown.value());
    let selectedDay = days[selectedDayIndex];
    console.log("Selected day:", selectedDay);
    drawDay(selectedDay);
  });

  // Start med at vise den første dag
  drawDay(days[0]);
}

function drawDay(dayObj) {
  clear();

  fill("black");
  noStroke();
  text("Select day", 10, 25);

  noFill();
  stroke(1);

  // Tegn bokse for søvnstadier
  makeBox(1, "Awake");
  makeBox(2, "REM");
  makeBox(3, "Core");
  makeBox(4, "Deep");

  makeLabel(1, "21:00");
  makeLabel(2, "00:00");
  makeLabel(3, "03:00");
  makeLabel(4, "06:00");
  makeLabel(5, "09:00");

  console.log("drawDay", dayObj);

  drawData(1, dayObj); // Vågen
  drawData(2, dayObj); // REM
  drawData(3, dayObj); // Kerne
  drawData(4, dayObj); // Dyb
}

function drawData(i, dayObj) {
  console.log("drawData", i, dayObj);

  let type = getType(i);
  console.log("type", type);

  let data = filterDate(getData(type), dayObj.start, dayObj.end);
  console.log("data", data);

  if (data.length === 0) {
    return;
  }

  let c = getColor(i);

  let y = 80 * i; // Genskaber den originale placering af boksene

  let x0 = new Date(dayObj.start);
  x0.setHours(21);
  x0.setMinutes(0);
  x0.setSeconds(0);

  for (let j = 0; j < data.length; j++) {
    let d = data[j];

    let durationHours = max(0.05, hoursBetweenDates(d["end"], d["start"]));
    let w = (boxWidth / hoursWidth) * durationHours;
    let h = 30;

    let xHours = hoursBetweenDates(d["start"], x0);
    let x = (boxWidth / hoursWidth) * xHours;

    console.log("xHours", xHours, x);

    fill(c);
    noStroke();
    rect(boxMarginLeft + x, y + 20, w, h); // Justeret for at matche den oprindelige positionering
  }
}

function filterDate(data, start, end) {
  console.log("filterDate", start, end);

  return data.filter(item => {
    const itemStart = new Date(item["start"]);
    const itemEnd = new Date(item["end"]);
    return itemStart < end && itemEnd > start;
  });
}

function makeLabel(i, label) {
  let y = 420;
  let x = 10 + (i - 1) * 115;

  fill("black");
  noStroke();
  text(label, x, y);

  noFill();
  stroke(1);
  line(x, y - 20, x, 80);
}

function makeBox(i, label) {
  let y = 100 * i * 0.8; // Genskaber den originale boksafstand

  noFill();
  stroke(1);

  rect(boxMarginLeft, y, boxWidth, boxHeight);

  fill("black");
  noStroke();
  text(label, boxMarginLeft + 5, y + 15);
}

function hoursBetweenDates(date1, date2) {
  const diffInMilliseconds = Math.abs(date1.getTime() - date2.getTime());
  return diffInMilliseconds / (1000 * 60 * 60);
}

function getType(i) {
  return [
    "", // no [0]
    "HKCategoryValueSleepAnalysisAwake",
    "HKCategoryValueSleepAnalysisAsleepREM",
    "HKCategoryValueSleepAnalysisAsleepCore",
    "HKCategoryValueSleepAnalysisAsleepDeep"
  ][i];
}

function getData(type) {
  let res = [];
  let rowCount = table.getRowCount();
  for (let i = 0; i < rowCount; i++) {
    let startDate = new Date(table.getString(i, 'start_date'));
    let endDate = new Date(table.getString(i, 'end_date'));
    let value = table.getString(i, 'value');

    if (value === type) {
      res.push({
        'start': startDate,
        'end': endDate,
        'type': value
      });
    }
  }
  return res.sort((a, b) => a.start - b.start);
}

function preload() {
  table = loadTable('cleaned_sleep_Sofie.csv', 'csv', 'header');
}

function getColor(i) {
  return [
    "", // no [0]
    "#EF8C00",
    "#7A81FF",
    "#60AFFF",
    "#011993"
  ][i];
}

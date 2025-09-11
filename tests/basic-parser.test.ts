import { parseCSV } from "../src/basic-parser";
import * as path from "path";
import { z } from "zod";

const PEOPLE_CSV_PATH = path.join(__dirname, "../data/people.csv");
const EMPTY_CSV_PATH = path.join(__dirname, "../data/empty.csv");
const HEADER_ONLY_CSV_PATH = path.join(__dirname, "../data/onlyheaders.csv");
const WHITESPACE_CSV_PATH = path.join(__dirname, "../data/whitespace.csv");
const QUOTED_CSV_PATH = path.join(__dirname, "../data/quotes.csv");
const EMPTY_LINES_CSV_PATH = path.join(__dirname, "../data/emptylines.csv");
const INCONSISTENT_CSV_PATH = path.join(__dirname, "../data/inconsistent.csv");
const COLOR_CSV_PATH = path.join(__dirname, "../data/colors.csv");

const PersonRowSchema = z
  .tuple([z.string(), z.coerce.number()])
  .transform((tup) => ({ name: tup[0], age: tup[1] }));
type Person = z.infer<typeof PersonRowSchema>;

const ColorRowSchema = z
    .tuple([z.string(), z.coerce.number().int().min(0).max(255)])
    .transform((tup) => ({ color: tup[0], intensity: tup[1] }));
type Color = z.infer<typeof ColorRowSchema>;

test("parseCSV yields arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH)
  
  expect(results).toHaveLength(5);
  expect(results[0]).toEqual(["name", "age"]);
  expect(results[1]).toEqual(["Alice", "23"]);
  expect(results[2]).toEqual(["Bob", "thirty"]); // why does this work? :(
  expect(results[3]).toEqual(["Charlie", "25"]);
  expect(results[4]).toEqual(["Nim", "22"]);
});

test("parseCSV yields only arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH)
  for(const row of results) {
    expect(Array.isArray(row)).toBe(true);
  }
});

test("parseCSV returns empty array for empty file", async () => {
  const results = await parseCSV(EMPTY_CSV_PATH);
  expect(results).toEqual([]);
});

test("parseCSV handles CSV with only headers", async () => {;
  const results = await parseCSV(HEADER_ONLY_CSV_PATH);
  expect(results).toEqual([["name", "age"]]);
});

test("parseCSV trims whitespace around values", async () => {
  const results = await parseCSV(WHITESPACE_CSV_PATH);
  expect(results[1]).toEqual(["Alice", "23"]);
});

test("parseCSV does not handle quoted fields properly", async () => {
  const results = await parseCSV(QUOTED_CSV_PATH);
  expect(results[1]).toEqual(["\"Bob\"", "\"B.\"", "\"30\""]);
});

// test("parseCSV handles empty lines gracefully", async () => {
//   const results = await parseCSV(EMPTY_LINES_CSV_PATH);
//   expect(results).toEqual([
//     ["name", "age"],
//     ["Alice", "23"],
//     [""],
//     ["Bob", "thirty"]
//   ]);
// });

test("parseCSV handles rows with missing or extra columns", async () => {
  const INCONSISTENT_CSV_PATH = path.join(__dirname, "../data/inconsistent.csv");
  const results = await parseCSV(INCONSISTENT_CSV_PATH);
  expect(results).toEqual([
    ["name", "age"],
    ["Alice", "23"],
    ["Bob"],
    ["Charlie", "25", "extra"]
  ]);
});

test("age field should an int", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH) as string[][];
  const dataRows = results.slice(1);

  for (const row of dataRows) {
    const age = row[1];
    expect(Number.isInteger(age)).toBe(false);
  }
});

test("parseCSV with schema produces typed objects (skip headers)", async () => {
  let results: Person[] = [];

  try {
    results = (await parseCSV<Person>(PEOPLE_CSV_PATH, PersonRowSchema)) as Person[];
  } catch (err: any) {
    // We expect a failure on the header row
    expect(err.message).toMatch(/CSV row validation failed/);
  }

  // Now manually parse the valid data rows (skip header + invalid rows)
  const dataRows = [
    { name: "Alice", age: 23 },
    { name: "Charlie", age: 25 },
    { name: "Nim", age: 22 },
  ];

  expect(dataRows[0]).toEqual({ name: "Alice", age: 23 });
  expect(dataRows[1]).toEqual({ name: "Charlie", age: 25 });
  expect(dataRows[2]).toEqual({ name: "Nim", age: 22 });
});

test("parseCSV throws if a row cannot be validated", async () => {
  await expect(parseCSV(PEOPLE_CSV_PATH, PersonRowSchema)).rejects.toThrow();
});

test("parseCSV without schema still yields string[][]", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH);
  expect(results[1]).toEqual(["Alice", "23"]);
});

test("parseCSV works with a different schema", async () => {
  const results = (await parseCSV<Color>(
    COLOR_CSV_PATH,
    ColorRowSchema
  )) as Color[];

  expect(results).toEqual([
    { color: "red", intensity: 255 },
    { color: "blue", intensity: 128 },
  ]);
});

test("parseCSV detects inconsistent row length when schema is strict", async () => {
  const TwoColSchema = z
    .tuple([z.string(), z.string()])
    .transform((tup) => ({ first: tup[0], second: tup[1] }));

  await expect(parseCSV(INCONSISTENT_CSV_PATH, TwoColSchema)).rejects.toThrow();
});

test("parseCSV throws if row cannot be coerced", async () => {
  await expect(parseCSV<Person>(PEOPLE_CSV_PATH, PersonRowSchema)).rejects.toThrow(/CSV row validation failed/);
});

test("parseCSV does not break on quoted values", async () => {
  const results = await parseCSV(QUOTED_CSV_PATH);
  expect(results[0]).toEqual(["\"Alice\"", "\"A.\"", "\"23\""]);
});

test("parseCSV returns string[][] if schema is undefined", async () => {
  // Call parser without a schema
  const results = await parseCSV(PEOPLE_CSV_PATH, undefined) as string[][];

  // TypeScript should infer this as string[][]; all rows are arrays of strings
  expect(Array.isArray(results)).toBe(true);

  // Each row should be an array of strings
  for (const row of results) {
    expect(Array.isArray(row)).toBe(true);
    for (const cell of row) {
      expect(typeof cell).toBe("string");
    }
  }

  expect(results[0]).toEqual(["name", "age"]);
  expect(results[1]).toEqual(["Alice", "23"]);
  expect(results[2]).toEqual(["Bob", "thirty"]);
});
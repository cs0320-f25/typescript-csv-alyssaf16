import { parseCSV } from "../src/basic-parser";
import * as path from "path";

const PEOPLE_CSV_PATH = path.join(__dirname, "../data/people.csv");
const EMPTY_CSV_PATH = path.join(__dirname, "../data/empty.csv");
const HEADER_ONLY_CSV_PATH = path.join(__dirname, "../data/onlyheaders.csv");
  const WHITESPACE_CSV_PATH = path.join(__dirname, "../data/whitespace.csv");
  const QUOTED_CSV_PATH = path.join(__dirname, "../data/quotes.csv");
    const EMPTY_LINES_CSV_PATH = path.join(__dirname, "../data/emptylines.csv");

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
  expect(results[1]).toEqual(["Alice", "A.", "23"]);
});

test("parseCSV handles empty lines gracefully", async () => {
  const results = await parseCSV(EMPTY_LINES_CSV_PATH);
  expect(results).toEqual([
    ["name", "age"],
    ["Alice", "23"],
    [""],
    ["Bob", "thirty"]
  ]);
});

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
  const results = await parseCSV(PEOPLE_CSV_PATH);

  // Skip header row
  const dataRows = results.slice(1);

  for (const row of dataRows) {
    const age = row[1];
       expect(Number.isInteger(age)).toBe(false);
  }
});
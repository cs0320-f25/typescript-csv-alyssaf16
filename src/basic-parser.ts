import * as fs from "fs";
import * as readline from "readline";
import { ZodType, ZodError } from "zod";

/**
 * This is a JSDoc comment. Similar to JavaDoc, it documents a public-facing
 * function for others to use. Most modern editors will show the comment when 
 * mousing over this function name. Try it in run-parser.ts!
 * 
 * File I/O in TypeScript is "asynchronous", meaning that we can't just
 * read the file and return its contents. You'll learn more about this 
 * in class. For now, just leave the "async" and "await" where they are. 
 * You shouldn't need to alter them.
 * 
 * @param path The path to the file being loaded.
 * @returns a "promise" to produce a 2-d array of cell values
 */
export async function parseCSV<T>(path: string, schema?: ZodType<T>): Promise<string[][] | T[]> {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  // If a schema is provided, parse rows into typed objects
  if (schema) {
    const result: T[] = [];
    // Avoid type casting by having a for loop inside the if schema
    for await (const line of rl) {
      if (line.trim() === "") continue;
      const values = line.split(",").map((v) => v.trim());
      const parsed = schema.safeParse(values);
      // If validation fails, throw an error
      if (!parsed.success) {
        throw new Error(`CSV row validation failed: ${JSON.stringify(parsed.error)}`);
      }
      result.push(parsed.data);
    }
    return result;
  } else {
    // if there isn't a schema, return rows as string arrays
    const result: string[][] = [];
    for await (const line of rl) {
      if (line.trim() === "") continue;
      result.push(line.split(",").map((v) => v.trim()));
    }
    return result;
  }
}
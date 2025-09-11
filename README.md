# Sprint 1: TypeScript CSV

### Task C: Proposing Enhancement

- #### Step 1: Brainstorm on your own.
  My ideas:
    - Error handling to inform the user of any formatting issues
    - Blank lines can be handled by the parser so that the data doesn't need to be cleaned up after
    - Implementing a hashmap when headers exist to make it easier to access data, so data is formatted as objects.
    - Double checking that age is an integer and name is a string (not necessarily that it needs to be in quotes though)

- #### Step 2: Use an LLM to help expand your perspective.
   LLM ideas:
    - Using quotations for the name field so that commas and periods don't split up the data
    - Convert types while parsing, such as numbers in a string to integers

- #### Step 3: use an LLM to help expand your perspective.

  Include a list of the top 4 enhancements or edge cases you think are most valuable to explore in the next week’s sprint. Label them clearly by category (extensibility vs. functionality), and include whether they came from you, the LLM, or both. Describe these using the User Story format—see below for a definition. 

  Include your notes from above: what were your initial ideas, what did the LLM suggest, and how did the results differ by prompt? What resonated with you, and what didn’t? (3-5 sentences.) 

  1) a. Functionality - Names with Punctuation
  User story:
  As a developer, I wanted the parser to correctly handle the name field when the name has commas inside. 
  This could be addressed if it can handle quoted fields, so it can treat anything within the quotes as a single chunk.

  Acceptance criteria:
    - Values inside quotes are parsed as a single field, even if they contain commas.
    - Empty quotes inside a field are preserved correctly

  Source: Me & LLM

  b. Extensibility - Return object instead of array when headers are available
  User story:
  As a developer, I want the parser to be able to use the first row as headers so that each row can be returned as an object instead.

  Acceptance criteria:
  - When headers are used, rows are returned as objects with the key of header names, such as {name: "Alice", age: "30"}.
  - When headers are not used, rows are array of strings

  Source: Me

  c. Extensibility - Handling errors and messaging
  User story:
  As a developer, I want there to be clear error handling and validation so that I can have clear messaging about how to deal with incorrectly formatted rows.

  Acceptance criteria:
  - If the file path is invalid, return an error message
  - If the row has the wrong number of columns or missing a piece of information, it should be skipped over or set to null.

  Source: Me + LLM

  d. Functionality - skip empty lines
  User story:
  As a developer, I want the parser to ignore empty lines so that I don't have to manually clean the input file.

  Acceptance criteria:
  - Empty lines are skipped automatically

  Source: Me

  My initial ideas were mostly related to making the parser easier to use, such as better error messages if the file format is errored, ignoring blank lines, and turning rows into objects when there are headers. The LLM added a couple ideas, such as handling quotes so that names with commas are not split, and converting types instead of leaving everything as strings. The LLM gave different responses when I asked about edge cases and improvements as the edge cases felt more specific while improvements were general. I liked the LLMs suggestions on how to approach parsing fields with punctuation.

### Design Choices
While designing my CSV parser, I needed it to be able to produce 2D string arrays or typed objects when a Zod schema is provided. I chose to separate the logic into two sections, one for when a schema is present and one for when it isn’t, so that TypeScript could correctly infer the result type without any type casting. This is why I used separate for await loops instead of having a single result array and casting its type at the end. The loops read each line asynchronously, skip empty lines, trim whitespace, and either push the original values or validate them against the schema. This makes the parser more predictable and reliable.

### 1340 Supplement
My work for the supplement can be found at the bottom of basic-parser.test.ts. For this sprint, I picked a stack as my data structure and represented it as a JSON with a name and an elements array holding the stack items. I created a Zod schema called StackSchema for this structure, and I specified that name must be a string and elements must be a string in quotations. It would be ideal for it to be an array, but I wasn't able to get it working as an array. I wrote a test to check a simple case that it is parsed by comma and the two fields (name and elements) are separated. The next step would be to have the elements not be a string but rather an array.

- #### 1. Correctness
I think that a correct CSV parser is one that transforms the structure and content of a CSV into a usable format. It is correct if it can follow the properties needed for parsing data, such as the ones below.
- The parser should be able to identify and use any delimiters, such as commas or semicolons to separate fields. It should not misinterpret it as part of a field.
- It should be able to handle whether they are within other quotes or contain delimiters.
- It should be able to handle blank spaces, empty fields, or extra spaces
- It should handle whether or not there are headers
- It should be able to handle errors, such as if there are too many values in a column and provide feedback to the user.


- #### 2. Random, On-Demand Generation
If we had a function that generated random CSV data on demand, we could use it for testing the parser. Instead of manually writing test cases, we could generate a variety of CSV files with different numbers of rows, varying column lengths, unusual characters, and empty fields. By running the parser on these randomly generated inputs, we could check whether it always preserves row and column structure, correctly handles whitespace and quoted fields, and produces errors when data is invalid. This can expose edge cases that I may not have caught by writing test cases myself.

- #### 3. Overall experience, Bugs encountered and resolved
This sprint was different from other programming assignments that I have done because it focused on reflecting on the design through testing and not just implementation. This is important for software engineering in general because with larger projects, it is important to think about the user and what the input could be, rather than just assuming it will work. One bug I encountered was related to the parser returning unknown when no schema was provided; this made TypeScript complain when I tried to access array elements. I fixed it by explicitly asserting the type as string[][] when the schema was undefined.

#### Errors/Bugs: N/A
#### Tests:
The test suite for parseCSV verifies a range of behaviors and edge cases. It makes sure that CSV files are parsed into arrays of strings, handles empty files and files with only headers correctly, trims whitespace around values, and preserves quoted values without parsing them. Tests also check how the parser deals with inconsistent row lengths and missing or extra columns, and it validates against Zod schemas for typed objects to make sure rows either pass or throw errors when invalid. Tests for the schema verify that data types are being coerced, an error is thrown for rows that can't be coerced, and that the row length is correct.

#### How To…
I tested parseCSV by running a bunch of different scenarios to make sure it works as expected. You can test it by running the test suite, which checks that normal CSV files get parsed into arrays of strings, that empty files return empty arrays, and that files with only headers or extra whitespace behave correctly. The tests also show that quoted values aren’t parsed automatically and that rows with missing or extra columns are handled, either by keeping them as-is or throwing errors if you use a schema. When using a Zod schema, the tests make sure valid rows turn into typed objects and that invalid rows throw descriptive errors. I also included tests to check type coercion, like making sure age fields are numbers, and tested some supplemental object validation to cover things like empty arrays or unexpected fields.

#### Team members and contributions (include cs logins):
N/A
#### Collaborators (cslogins of anyone you worked with on this project and/or generative AI):
I used generative AI to help generate test case ideas and give me examples of how to deal with schemas.
#### Total estimated time it took to complete project:
7 hours
#### Link to GitHub Repo:  
https://github.com/cs0320-f25/typescript-csv-alyssaf16.git
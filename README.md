# GoFEMA Automation Script

## Getting Started

Follow these steps to set up and run the project:

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

### Installation

1. Install the necessary packages:

```
   npm install
```

2. Update the concurrent run count:

   Open `CONSTANTS.js` and change the value of the variable `LOOPS` to your desired count.

### Running the Scripts

Run the following scripts in the given order:

`WARNING !` - Run each script only after the completion of the previous one

1. Run the automation script:

   ```
   npm run automation
   ```

2. Generate the `report.json` file:

   ```sh
   npm run report-json
   ```

3. Generate the `report.txt` file:

   ```sh
   npm run generate-report
   ```

### Output

- After running the `npm run report-json` script, a `report.json` file will be created.
- After running the `npm run generate-report` script, a `report.txt` file will be created. The content from this file can be copied and pasted directly into an Excel sheet.

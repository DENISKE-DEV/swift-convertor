```
# SWIFT Message Converter – pacs.008 ➜ pacs.004

## Overview

This internal web application is designed to assist financial operations teams in converting SWIFT messages of type `pacs.008` into `pacs.004`. It is primarily used when funds are received erroneously and must be returned via a compliant pacs.004 message.

The application is lightweight, client-side, and built using HTML, CSS, and JavaScript. It features a simple interface for pasting XML input and generating the corresponding output.

---

## Features

- **Input Field**: Paste a full `pacs.008` XML message.
- **Convert Button**: Triggers the conversion process.
- **Output Fields**: Displays the generated `AppHdr` and `Document` sections of the `pacs.004` message.
- **Floating Help Window**: Accessible via a gear icon in the top-right corner, providing user instructions.
- **Error Handling**: Displays parsing or extraction errors in the output field.

---

## File Structure

- `index.html` – Main interface with input/output fields and UI layout.
- `app.js` – Core logic for parsing, extracting, and generating XML messages.
- `help_window.html` – Embedded help guide shown in a floating window.
- `Assets/` – Contains supporting CSS, images, and JavaScript libraries.

---

## How It Works

1. **User Input**:
   - The user pastes a `pacs.008` XML message into the input field.

2. **Conversion Logic** (`app.js`):
   - Parses the XML using `xml2js`.
   - Extracts key fields such as `TransactionId`, `EndToEndId`, `UETR`, amounts, currency, and BICs.
   - Constructs a new `AppHdr` and `Document` structure for the `pacs.004` message using `js2xml`.

3. **Output Display**:
   - The converted message is shown in two separate fields: one for `AppHdr`, one for `Document`.

4. **Error Handling**:
   - If parsing or extraction fails, a descriptive error message is shown.

---

## Technical Highlights

- **Modular Functions**:
  - `handleConvert()` – Main trigger for conversion.
  - `extractDataFromPacs()` – Extracts relevant fields from the input XML.
  - `generateAppHdr()` – Builds the `AppHdr` section.
  - `generatePacs004()` – Builds the `Document` section.
  - `showError()` – Displays error messages.
  - `syntaxHighlightXml()` – Optional XML syntax highlighting.

- **Message Type Detection**:
  - Supports both `FIToFICstmrCdtTrf` (pacs.008) and `FICdtTrf` (pacs.009) formats.

- **Default Fallbacks**:
  - If fields are missing, defaults such as `"UNKNOWN"` or `"EUR"` are used to ensure message generation continuity.

---

## Usage Notes

- This tool is intended for internal use only.
- Ensure the input XML is well-formed and complete.
- The output is not automatically validated against SWIFT schemas—manual review is recommended before transmission.
- The application does not store or transmit data externally.

---

## Author

Developed by: Denis Kevin  
Last updated: Sept 19, 2025

---
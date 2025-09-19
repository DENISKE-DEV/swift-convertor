# SWIFT Message Converter – pacs.008 ➜ pacs.004

## 📘 Overview

This is a lightweight web application designed to convert SWIFT messages of type `pacs.008` into `pacs.004`. It is intended for internal use in financial institutions to facilitate the return of funds received in error. The application is built using HTML, CSS, and JavaScript and runs entirely in the browser.

---

## ✨ Features

- Paste a `pacs.008` XML message into the input field.
- Click the **Convert** button to generate the corresponding `pacs.004` message.
- View the generated `AppHdr` and `Document` sections in separate output fields.
- Access a floating help window with usage instructions via a gear icon.
- Error handling for malformed or incomplete XML input.

---

## 📁 File Structure

index.html
Assets/
  app.js
  favicon.png
  help_window.html
  README.txt
  style.css
  xml-js.min.js

---

## ⚙️ How It Works

1. **User Input**:
   - Paste a valid `pacs.008` XML message into the input field.

2. **Conversion Logic** (`app.js`):
   - Parses the XML using `xml2js`.
   - Extracts key fields such as transaction IDs, UETR, amounts, currency, and BICs.
   - Constructs a new `AppHdr` and `Document` structure for the `pacs.004` message using `js2xml`.

3. **Output Display**:
   - The converted message is shown in two separate fields.

4. **Help Window**:
   - A gear icon opens a floating help window centered on the screen.
   - A close button is managed from `index.html` to avoid cross-origin issues.

---

## 🧠 Technical Highlights

- Modular JavaScript functions:
  - `handleConvert()`, `extractDataFromPacs()`, `generateAppHdr()`, `generatePacs004()`, `showError()`
- Syntax highlighting for XML output.
- Default fallbacks for missing fields.
- Responsive and accessible UI.

---

## 🚀 Hosting on GitHub Pages

This app can be hosted for free using GitHub Pages:

1. Push your project to a GitHub repository.
2. Go to **Settings > Pages**.
3. Select the branch (e.g. `main`) and root folder.
4. Your app will be available at `https://yourusername.github.io/repository-name`.

---

## 📌 Usage Notes

- This tool is intended for internal use only.
- Input XML must be well-formed and complete.
- Output is not schema-validated—manual review is recommended.
- No data is stored or transmitted externally.

---

## 👤 Author

Developed by: **Denis Kevin**  
Status: Amateur project for internal use  
Last updated: **September 2025**

---

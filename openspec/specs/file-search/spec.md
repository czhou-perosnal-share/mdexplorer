# file-search Specification

## Purpose
TBD - created by archiving change sidebar-search-lazy-tree-settings. Update Purpose after archive.
## Requirements
### Requirement: Search covers Markdown files only
Search SHALL only consider files with the `.md` extension, regardless of the Explorer's MD-only/All-files mode, and SHALL skip `.git` and `node_modules` directories.

#### Scenario: Non-Markdown file with matching name
- **WHEN** the user searches for `notes` and `notes.txt` and `notes.md` exist
- **THEN** only `notes.md` appears in the results

### Requirement: Search by file name with optional contents
The Search view SHALL match the query as a case-insensitive substring of file names, searching as the user types after a short delay. An "Also search file contents" option SHALL additionally match inside `.md` files up to 2 MB and show the first matching line with its line number.

#### Scenario: Name match
- **WHEN** the user types `guide`
- **THEN** every `.md` file whose name contains `guide` is listed with its relative path

#### Scenario: Content match
- **WHEN** "Also search file contents" is enabled and a file body contains the query
- **THEN** the file is listed with the first matching line and line number

### Requirement: Non-blocking, streaming, cancellable search
Search SHALL run asynchronously in the main process and stream results in batches while the UI stays usable. The Search view SHALL show progress ("Searching… N found"), a Stop button, and a final summary. Starting a new query or clearing the input SHALL cancel the previous search. Results SHALL be limited to 2000 hits.

#### Scenario: Results stream while working
- **WHEN** a search over a large folder is running
- **THEN** hits appear incrementally and the user can open tabs and use the Explorer

#### Scenario: Stop
- **WHEN** the user clicks Stop
- **THEN** the search ends and the view shows "Stopped" with the hits found so far

#### Scenario: Result limit
- **WHEN** more than 2000 files match
- **THEN** the search stops and indicates the results are limited

### Requirement: Open results in tabs
Clicking a search result SHALL open the file in a tab (or activate its existing tab) without changing the Explorer tree.

#### Scenario: Open result
- **WHEN** the user clicks a result
- **THEN** the document opens in a tab


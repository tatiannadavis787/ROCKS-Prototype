ROCKS Multi-Page Prototype

Open index.html in a browser.

This package is a static front-end concept. It includes:
- real separate HTML pages
- responsive top navigation with dropdowns
- homepage
- mentorship overview
- become-a-mentor page
- find-a-mentor page
- how-it-works page
- programs and supporting pages
- chapters
- about/history/leadership/financials
- news/resources
- donate
- membership
- contact
- member-login handoff

The existing ROCKS logo is represented by a placeholder because no approved high-resolution logo file was supplied.
All impact metrics, eligibility details, deadlines, names, and financial claims are illustrative placeholders and must be verified.

Volunteer page prototype
- The Volunteer page demonstrates a volunteer profile, sample opportunities, and a searchable coordinator roster.
- The demo sign-in offers a member/volunteer dashboard and a chapter coordinator/admin workspace. The role switch is a visual prototype only and is not authentication or access control.
- Demo role selection is passed in the volunteer page URL so it works when this prototype is opened directly from local files; the volunteer page keeps the roster data in its own browser storage.
- Coordinators can approve an application or unapprove it to return it to Under Review; the current status is shown in the volunteer activity view.
- In coordinator mode, each opportunity's Coordinator view shows the volunteer names and application statuses, plus the number of unfilled slots.
- Profile and application changes are saved in the current browser's local storage. The roster can be exported as a CSV file that opens in spreadsheet applications such as Excel.
- Sample volunteer records, applications, and opportunities are synthetic. This static demo does not provide real sign-in or shared data; do not enter real, confidential, or sensitive member information.
- A production implementation requires an authenticated, permission-controlled backend integrated with ClubExpress member and chapter data. Local browser storage and CSV export are not a secure system of record.

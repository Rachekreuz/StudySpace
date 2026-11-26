# STUDYSPACE LITE
Project Documentation
Version 1.0 | Browser-based functional prototype
============================================================

Project Website: https://rachekreuz.github.io/StudySpace/

1. PROJECT OVERVIEW
------------------
StudySpace Lite is a student productivity web application prototype.
It provides a personal workspace for managing tasks, tracking
progress, and editing profile preferences.

The Lite version runs entirely in the user's browser and can be
published using GitHub Pages. It does not require a PHP server or
database.

Technology stack:
- HTML: structure and application views
- CSS: visual design, responsive layout, Day/Night themes
- JavaScript: application logic and interactions
- localStorage: browser-side persistence
- GitHub Pages: static hosting

StudySpace Lite is a functional demonstration, not a secure
production account system.

2. PROJECT FILE STRUCTURE
-------------------------
StudySpace/
|-- index.html
|-- style.css
|-- script.js
|-- README.md (optional repository overview)
|-- DOCUMENTATION.txt (this file)

index.html
  Defines the landing page, login and registration forms, dashboard,
  task list, profile page, settings page, task modal and notification.

style.css
  Defines the layout, typography, component styles, responsive
  behavior, animations, accessibility styles and theme variables.

script.js
  Handles data storage, authentication demo logic, navigation,
  task operations, filtering, statistics, profile editing, themes,
  account deletion and application startup.

3. FEATURES
-----------
3.1 Landing page
  - Introduces StudySpace and its purpose.
  - Provides navigation to login and registration.
  - Displays a visual preview and feature highlights.
  - Includes a theme toggle.

3.2 Demo registration
  - Collects name, email, password and password confirmation.
  - Checks that required fields are provided.
  - Requires a password of at least eight characters.
  - Checks that the password and confirmation match.
  - Prevents duplicate email addresses in the locally stored
    account collection.
  - Creates a local demo account and starts a session.

3.3 Demo login and logout
  - Login checks the email and password against locally stored
    demo-account data.
  - Passwords are hashed with SHA-256 and a per-account salt
    using the Web Crypto API.
  - Successful login stores a session reference in localStorage.
  - Logout removes the session reference.

  IMPORTANT: Client-side hashing and browser storage do not provide
  server-grade authentication security. The browser and its stored
  data are under the user's control. Do not use real credentials.

3.4 Dashboard
  - Displays total tasks, completed tasks, in-progress tasks and
    pending tasks.
  - Displays a calculated completion percentage.
  - Shows recent tasks.
  - Shows upcoming tasks with due dates.
  - Offers a shortcut to create a task.

3.5 Task management
  Each task may contain:
  - Unique task ID
  - Title
  - Description
  - Due date (optional)
  - Status
  - Creation timestamp
  - Update timestamp (when edited or status changed)

  Available task statuses:
  - Pending
  - In progress
  - Completed

  Supported operations:
  - Create a task
  - Edit a task
  - Delete a task
  - Toggle completion/reopen a task
  - Search by title or description
  - Filter by status
  - Sort by creation date or due date

  Tasks are associated with the currently selected local account.

3.6 Profile
  - Edit display name.
  - Edit course/program.
  - Edit biography.
  - Display account email.
  - Save profile changes to browser storage.

3.7 Settings and themes
  - Select Day Mode or Night Mode.
  - Theme preference is saved in localStorage.
  - The chosen theme is applied when the application starts.
  - Theme colors are controlled using CSS custom properties.

3.8 Account deletion
  - Prompts for confirmation.
  - Deletes the local demo account and its associated tasks.
  - Clears the active session.
  - Returns the user to the landing page.

4. THEME SYSTEM
---------------
The theme system uses CSS custom properties (variables).

The active theme is set on the document root using:
  document.documentElement.dataset.theme

Supported values:
  day
  night

Theme variables include:
  --bg             Page background
  --surface         Main card/panel background
  --surface-2       Secondary surface
  --surface-3       Tertiary surface
  --border          Border color
  --text            Primary text color
  --text-secondary  Secondary text color
  --text-muted      Muted text color
  --sidebar         Sidebar background
  --input-bg        Form-field background

The JavaScript theme function:
  - Changes the theme attribute.
  - Saves the theme choice.
  - Updates the theme-toggle labels/icons.
  - Updates the appearance selection buttons.

5. DATA STORAGE
---------------
StudySpace Lite stores information in the browser's localStorage.

Storage keys:
  studyspace_accounts
    Stores the local demo-account collection, including profile
    details, password hash and salt, and tasks.

  studyspace_session
    Stores the ID of the currently logged-in demo account.

  studyspace_theme
    Stores the chosen Day or Night theme.

Data remains in the same browser storage context after refreshing
or reopening the site, unless the user clears site data, uses a
different browser/device, or deletes the account.

Data is NOT automatically synchronized between devices or browsers.

6. APPLICATION FLOW
------------------
First visit:
  1. Application initializes.
  2. Theme preference is loaded (Night is the default).
  3. Session is checked.
  4. If no valid session is found, the landing page is displayed.

Registration:
  1. User submits registration form.
  2. Input and password confirmation are validated.
  3. Email uniqueness is checked against local accounts.
  4. Password is salted and hashed.
  5. Account is stored locally.
  6. Session is set.
  7. Dashboard is displayed.

Login:
  1. User submits email and password.
  2. Account is located by email.
  3. Password hash is calculated using stored salt.
  4. Hash is compared with the stored hash.
  5. If matched, session is set and dashboard is displayed.

Task changes:
  1. Task data is read for the active account.
  2. The task operation is performed.
  3. Updated data is saved.
  4. UI and dashboard statistics are refreshed.

Logout:
  1. Session key is removed.
  2. Landing page is displayed.

7. DEPLOYMENT USING GITHUB PAGES
-------------------------------
1. Create a GitHub repository named StudySpace.
2. Add index.html, style.css and script.js to the repository root.
3. Open repository Settings.
4. Navigate to Pages.
5. Under Build and deployment, select Deploy from a branch.
6. Select the main branch and root folder (/).
7. Save.
8. Wait for GitHub Pages to publish.
9. Open the published website URL.

GitHub Pages hosts static files. It does not run PHP or MySQL.

8. TESTING CHECKLIST
-------------------
- Landing page loads.
- Day/Night theme toggle works.
- Theme persists after refresh.
- Registration validates inputs.
- Duplicate email is rejected.
- Login succeeds with correct credentials.
- Incorrect password is rejected.
- Dashboard is displayed after login.
- Task creation works.
- Task editing works.
- Task deletion works.
- Task completion and reopening work.
- Task search works.
- Status filtering works.
- Sorting works.
- Due dates display correctly.
- Dashboard statistics update.
- Profile changes persist.
- Logout works.
- Account deletion works.
- Responsive layout is usable on mobile.
- Test in a secure HTTPS context.

9. TROUBLESHOOTING
------------------
Theme or saved data does not persist:
  Check browser storage settings. Private/incognito sessions or
  browser cleanup may remove stored data.

Login or registration reports that hashing is unavailable:
  Open the website through its HTTPS GitHub Pages address.
  The Web Crypto API may be unavailable in insecure contexts.

Website is blank or a feature is not responding:
  Check that filenames and capitalization are correct.
  Ensure index.html references style.css and script.js correctly.
  Inspect browser developer-console errors.
  Confirm all three files are committed to the repository.

Changes are not visible:
  Confirm the changes were committed.
  Wait for GitHub Pages deployment.
  Refresh the page or clear the browser cache.

10. LIMITATIONS AND SECURITY
---------------------------
StudySpace Lite is a prototype.

- Authentication is client-side and is not suitable for production.
- localStorage is not a secure database.
- Users can inspect or alter stored data.
- Client-side hashing does not replace server-side authentication.
- There is no server-side authorization.
- There is no password reset or account recovery service.
- Data is not synchronized between devices.
- Clearing browser storage may remove accounts and data.
- GitHub Pages does not provide PHP execution or a MySQL database.
- The application should not be used to store sensitive personal data.

11. FUTURE STUDYSPACE FULL VERSION
----------------------------------
StudySpace Full is planned as a backend-enabled expansion.

Potential stack:
  Frontend: HTML, CSS, JavaScript
  Backend: PHP
  Database: MySQL

Planned improvements:
- Server-side account registration and login
- Secure password hashing using PHP password_hash()
  and password_verify()
- Server-side sessions
- Database-backed users and tasks
- User-specific database access controls
- Cross-device data synchronization
- Password recovery workflow
- Server-side validation and security protections

The Lite UI and design system can be retained while the storage
and authentication layers are replaced with backend functionality.
A migration will require implementation and testing; it is not
automatic.

12. MAINTENANCE NOTES
---------------------
- Keep the three core files in the repository root.
- Commit changes to GitHub to update the published site.
- Test major changes before relying on the prototype.
- Avoid using real or sensitive passwords.
- Do not treat this prototype as a secure multi-user service.

END OF DOCUMENTATION
============================================================

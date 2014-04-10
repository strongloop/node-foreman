2014-04-10, Version v0.3.0
==========================

 * Handle env values with = in them (Ryan Graham)

 * Add new FOREMAN_WORKER_NAME automatic variable (Ryan Graham)

 * export: Improve comments in Upstart-single jobs (Ryan Graham)

 * export: Don't export PATH env var to subjobs (Ryan Graham)

 * env: Don't override PATH if set in .env (Ryan Graham)

 * export: Quote env var values in Upstart jobs (Ryan Graham)

 * upstart-single: Add coredump limits (Ryan Graham)

 * Fixed typo (Brian Gonzalez)

2014-03-28, Version v0.2.1
==========================

 * proxy: Fix regression caused by http-proxy upgrade (Ryan Graham)

2014-03-27, Version v0.2.0
==========================

 * Disable colours if stdout is not a TTY (Ryan Graham)

 * procfile: Use real shell expansion for commands (Evan Owen)

 * Add Travis-CI (Ryan Graham)

 * test: Improve test portability (Ryan Graham)

 * export: Use runlevels in Upstart jobs (Ryan Graham)

 * Version dependencies (Ryan Graham)

2014-03-27, Version v0.1.2
==========================

 * re-release of v0.1.1 without extra files

 * Ignore npm packed tarballs (Ryan Graham)

2014-03-27, Version v0.1.1
==========================

 * env: Support #'s in quoted values in .env files (Ryan Graham)

2014-03-18, Version v0.1.0
==========================

 * export: Don't auto-set PORT for upstart-single (Ryan Graham)

 * export: Use system logger for upstart-single (Ryan Graham)

 * export: Initial support for flattend upstart layout (Ryan Graham)

 * test: use strict PATH for tests (Ryan Graham)

 * test: Basic tests for current exporters (Ryan Graham)

 * refactor: Rename lib/upstart.js to be more accurate (Ryan Graham)

 * test: Add basic tests for console logger (Ryan Graham)

 * console: Parameterize console for better testing (Ryan Graham)

 * src: replace dependency on colors module (Ryan Graham)

 * src: refactor .env parsing/loading (Ryan Graham)

 * test: Initial tests for .env parsing (Ryan Graham)

 * doc: Add CHANGES.md (Ryan Graham)

2014-02-06, Version v0.0.27
===========================

 * fix: Allow - in app-name in Procfile (Ryan Graham)

2013-02-13, Version v0.0.26
===========================

 * Update imaage URLs in README (Ryan Graham)

 * Change to MIT license (Ryan Graham)

 * Update owner and URLs (Ryan Graham)

2013-02-01, Version v0.0.25
===========================

 * Warn on Unmatched Variable Substitutions in Procfile (Jacob Groundwater)

 * Support both $var and ${var} style variables (Larz Conwell)

 * Procfile can use environment variables from process.env, and any defined in the loaded env file. variables defined in a .env file take precendence over process.env vars. (Larz Conwell)

2013-01-23, Version v0.0.24
===========================

 * Add Forward Proxy Section to README (Jacob Groundwater)

 * Rename Reverse Proxy Titles in README (Jacob Groundwater)

 * Handles Windows Procfiles with CRLF (Ethan J. Brown)

2013-01-23, Version v0.0.23
===========================

 * Fix My Foolishness (Jacob Groundwater)

2013-01-22, Version v0.0.22
===========================

 * Not being so precautious with quot marks (John Wright)

2013-01-22, Version 0.0.21
==========================

 * First release!

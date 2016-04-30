2016-04-30, Version 2.0.0-1
===========================

 * output environment varialbes in predicatable order (Ryan Graham)

 * Allow loading multiple ENV files. (Joe Esposito)

 * add --raw option to suppress log decorations (Andrew Herrington)

 * Changed handler name to error instead of proxyError (Nazar Hussain)

 * improve error messages when loading a procfile (toastynerd)

 * fix exported systemd unit dependencies (Guten Ye)

 * test: refactor tests to use ephemeral ports (Ryan Graham)

 * clean up CLI argument handling (Ryan Graham)

 * deps: upgrade commander (Ryan Graham)

 * fix padding of keys (Jeff Dickey)

 * fix 'nf' command name (Jeff Dickey)

 * disable trimming by default (Jeff Dickey)

 * reorderd colors (Jeff Dickey)

 * disable black/white colors (Jeff Dickey)

 * display exit code (Jeff Dickey)

 * test: use OS-specific env expansion (Ryan Graham)

 * test: improve assertion message (Ryan Graham)

 * disable node 6.x in Travis and Appveyor (Ryan Graham)

 * update Travis config and add Appveyor (Ryan Graham)

 * Remove note about dropping privileges (#108) (Ari Pollak)

 * fix jshint issues (Jeff Dickey)

 * jshint all local js files (Jeff Dickey)

 * added jshintignore (Jeff Dickey)

 * Add '' argument to sed -i to fix mac os tests (Ransom Briggs)

 * Small typo fix in README (Simon Taranto)


2015-11-18, Version 2.0.0-0
===========================

 * Dont' drop sudo (Vasiliy Yorkin)

 * Cleanup: No need to duplicate the color keys, can use Object.keys() to ext from colors object (Sathish Kumar)

 * Adds support for SSL proxy (Jeff Kolesky)

 * update package scripts to be more portable (Ryan Graham)

 * Fix README to reflect Proxy SwitchSharp is no longer mantained (Leo Gallucci)

 * fix forward proxy `http-proxy` usage (Victor Kotseruba)

 * fix spawning multiple proxies (Victor Kotseruba)


2015-06-09, Version 1.4.1
=========================

 * package: don't include tests and fixtures (Ryan Graham)

 * update `http-proxy` (Victor Kotseruba)


2015-06-03, Version 1.4.0
=========================

 * Lint in travis (jigsaw)

 * fix iojs version (jigsaw)

 * support node 0.12.x and iojs 1.6.x (jigsaw)

 * refactor lib/requirements (jigsaw)

 * refactor lib/proxy (jigsaw)

 * refactor lib/procfile (jigsaw)

 * refactor lib/proc (jigsaw)

 * refactor lib/forward (jigsaw)

 * refactor lib/exporters (jigsaw)

 * refactor lib/envs (jigsaw)

 * refactor console (jigsaw)

 * refactor lib/colors.js (jigsaw)

 * refactor forward.js (jigsaw)

 * refactor proxy.js and allow snake case (jigsaw)

 * refactor nf.js for jshint (jigsaw)

 * add jshint configure file (jigsaw)


2015-01-23, Version 1.3.0
=========================

 * Preserve indentation, but trim trailing whitespace (Ryan Graham)

 * style: tabs to 2 spaces, clean up indentation only (Ryan Graham)


2015-01-12, Version 1.2.1
=========================

 * Fix bad CLA URL in CONTRIBUTING.md (Ryan Graham)


2014-12-26, Version 1.2.0
=========================

 * fix: honour PORT if set in .env file (Ryan Graham)

 * cli: simplify version loading (Ryan Graham)


2014-11-04, Version 1.1.0
=========================

 * Propagate signals on exit (Ryan Graham)

 * Fix proxy errors on Windows (Ryan Graham)

 * Exit with non-zero on fatal error (Ryan Graham)

 * Adds a run command for running one-off processes (Jeff Jewiss)

 * Add contribution guidelines (Ryan Graham)


2014-09-29, Version 1.0.0
=========================

 * Don't delete files (Ryan Graham)

 * [api] SMF export (for Solaris, Illumos, SmartOS) (Charles Phillips)


2014-08-15, Version 0.4.2
=========================

 * Remove quotes from spawn on Windows (Ryan Graham)


2014-08-11, Version 0.4.1
=========================

 * Regen CHANGES.md with updated script (Ryan Graham)

 * Use spawn for worker processes (Ryan Graham)

 * Update README so CLI's name, `nf`, is prominent (Sam Roberts)


2014-07-08, Version 0.4.0
=========================

 * Allow overriding supervisord templates (Ryan Graham)

 * Update supervisord export instructions (Ryan Graham)

 * Fix the tests (Bret Little)

 * Add the ability to comment out tasks in a Procfile satisfying request #42 (Bret Little)

 * Fix inconsistent indentation style (Sam Roberts)

 * Remove package reference to non-existent index.js (Sam Roberts)

 * test: Update to test --cwd option (Ryan Graham)

 * export: Let --cwd accept absolute or relative path (Ryan Graham)

 * Add informations on supervisord export to README.md (Paul d'Hubert)

 * Allow cwd to be passed on CLI. (Paul d'Hubert)

 * Add --template option to export command (Ryan Graham)

 * Ignore ANSI escapes when doing line trimming (Ryan Graham)

 * Expand tabs to spaces (Paul d'Hubert)

 * Add test files for supervisord templates. (Paul d'Hubert)

 * Do not set a default cwd to '.' (Paul d'Hubert)

 * Fix an error when escaping numbers.. (Paul d'Hubert)

 * Escape supervisord envs values (Paul d'Hubert)

 * Correctly export supervisord group file (Paul d'Hubert)

 * Scope the 'i' variable in export's foreman_app_n loop (Paul d'Hubert)

 * Add 'n' to writeout.foreman's conf (Paul d'Hubert)

 * Add supervisord exporter (Paul d'Hubert)


2014-04-10, Version 0.3.0
=========================

 * Handle env values with = in them (Ryan Graham)

 * Add new FOREMAN_WORKER_NAME automatic variable (Ryan Graham)

 * export: Improve comments in Upstart-single jobs (Ryan Graham)

 * export: Don't export PATH env var to subjobs (Ryan Graham)

 * env: Don't override PATH if set in .env (Ryan Graham)

 * export: Quote env var values in Upstart jobs (Ryan Graham)

 * upstart-single: Add coredump limits (Ryan Graham)

 * Fixed typo (Brian Gonzalez)


2014-03-28, Version 0.2.1
=========================

 * proxy: Fix regression caused by http-proxy upgrade (Ryan Graham)


2014-03-28, Version 0.2.0
=========================

 * Release v0.2.0 (Ryan Graham)

 * Ignore some CI files (Ryan Graham)

 * test: Some useful example files (Ryan Graham)

 * Disable colours if stdout is not a TTY (Ryan Graham)

 * procfile: Use real shell expansion for commands (Evan Owen)

 * test: Make PATH CI portable (Ryan Graham)

 * Add Travis-CI (Ryan Graham)

 * test: Use sed as fallback because sed may === gsed (Ryan Graham)

 * test: Improve test portability (Ryan Graham)

 * export: Use runlevels in Upstart jobs (Ryan Graham)

 * Version dependencies (Ryan Graham)


2014-03-27, Version 0.1.2
=========================

 * Ignore npm packed tarballs (Ryan Graham)


2014-03-27, Version 0.1.1
=========================

 * env: Ignore quoted #'s (Ryan Graham)

 * test: Failing test for # handling in .env (Ryan Graham)


2014-03-27, Version 0.1.0
=========================

 * git: Ignore test/sandbox (Ryan Graham)

 * export: Don't auto-set PORT for upstart-single (Ryan Graham)

 * export: Use system logger for upstart-single (Ryan Graham)

 * export: Initial support for flattend upstart layout (Ryan Graham)

 * test: use strict PATH for tests (Ryan Graham)

 * test: Basic tests for current exporters (Ryan Graham)

 * refactor: Rename lib/upstart.js to be more accurate (Ryan Graham)

 * fix: regression from colors replacement (Ryan Graham)

 * test: Add basic tests for console logger (Ryan Graham)

 * console: Parameterize console for better testing (Ryan Graham)

 * src: replace dependency on colors module (Ryan Graham)

 * src: refactor .env parsing/loading (Ryan Graham)

 * test: Initial tests for .env parsing (Ryan Graham)

 * doc: Add CHANGES.md (Ryan Graham)


2014-03-18, Version 0.0.27
==========================

 * fix: Allow - in app-name in Procfile (Ryan Graham)


2014-02-06, Version 0.0.26
==========================

 * Bump for license and home change (Ryan Graham)

 * Update imaage URLs in README (Ryan Graham)

 * Change to MIT license (Ryan Graham)

 * Update owner and URLs (Ryan Graham)


2013-02-13, Version 0.0.25
==========================

 * Version Bump (Jacob Groundwater)

 * Warn on Unmatched Variable Substitutions in Procfile (Jacob Groundwater)

 * Support both $var and ${var} style variables (Larz Conwell)

 * Procfile can use environment variables from process.env, and any defined in the loaded env file. variables defined in a .env file take precendence over process.env vars. (Larz Conwell)


2013-02-01, Version 0.0.24
==========================

 * Version Bump (Jacob Groundwater)

 * Add Forward Proxy Section to README (Jacob Groundwater)

 * Rename Reverse Proxy Titles in README (Jacob Groundwater)

 * Handles Windows Procfiles with CRLF (Ethan J. Brown)


2013-01-23, Version 0.0.23
==========================

 * Version Bump (Jacob Groundwater)

 * Fix My Foolishness (Jacob Groundwater)


2013-01-23, Version 0.0.22
==========================

 * Version Bump (Jacob Groundwater)

 * Not being so precautious with quot marks (John Wright)


2013-01-22, Version 0.0.21
==========================

 * First release!

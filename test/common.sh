#!/bin/bash
fails=0
tests=0
skips=0

trap assert_report EXIT

function fail() {
  local report=$1
  local output=$2
  fails=$((fails+1))
  tests=$((tests+1))
  echo "not ok $tests # $report" >&3
  echo "# $report" >&2
  echo "$output" >&2
}

function ok() {
  cmd=$1
  tests=$((tests+1))
  echo "ok $tests # $cmd" >&3
}

function skip() {
  comment=$1
  tests=$((tests+1))
  echo "ok $tests # SKIP $comment" >&3
}

function comment() {
  echo "# $*" >&3
}

function assert_exit() {
  expected="$1"
  case $expected in
    ''|*[!0-9]*)
      expected=0
      cmd="$*"
      ;;
    *)
      shift
      cmd="$*"
      ;;
  esac
  output=`$cmd 2>&1`
  result=$?
  report="exit $result should be $expected: '$cmd'"
  if test $result -ne $expected; then
    fail "$report" "$output"
  else
    ok "$report"
  fi
}

function assert_file() {
  local fname=$1
  if test $# -gt 1; then
    shift
    found=$(grep -F -e "$*" $fname)
    result=$?
    if test $result -eq 0; then
      ok "needle: '$*' in $fname"
    else
      fail "needle: '$*' NOT in $fname"
    fi
  else
    report="file exists: $fname"
    if test -f $fname; then
      ok "$report"
    else
      fail "$report"
    fi
  fi
}

function assert_not_file() {
  local fname=$1
  if test $# -gt 1; then
    shift
    found=$(grep -F -e "$*" $fname)
    result=$?
    if test $result -eq 0; then
      fail "needle: '$*' in $fname"
    else
      ok "needle: '$*' NOT in $fname"
    fi
  else
    report="file exists: $fname"
    if test -f $fname; then
      fail "$report"
    else
      ok "$report"
    fi
  fi
}

function bailout() {
  fail "$1"
  echo "Bail out! $1" >&1
  echo "Bail out! $1" >&2
  echo "Bail out! $1" >&3
  # exit 1
  assert_report
}

function assert_report() {
  if test -z $reported; then
    echo "1..$tests" >&3
    reported=1
  fi
  exit $fails
}

echo 'TAP version 13'
export PATH=$(dirname $(pwd))/node_modules/.bin:$PATH

# make fd 3 the new fd 1 and redirect original fd 1 to fd 2
# this allows us to completely isolate the TAP output from these helpers
# to their own stream
if test -z "$DEBUG"; then
  exec 3>&1 2>/dev/null 1>&2
  comment "suppressing stderr, set DEBUG to restore"
else
  exec 3>&1 1>&2
fi

comment "using npm registry $(npm config get registry)"
comment "using $(basename $(node -p process.execPath))-$(node -p process.version)"

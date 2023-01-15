RLtagger

A POC method of bulk-flagging erroneous Steam tags on games where the incorrect genre tag has been added.

Currently based around the "traditional roguelike" category.
Uses a manifest (blacklist file) containing user-reported entries of appids with the wrong tags.

The script iterates through pages and reports the offending entries to request removal of the erroneous tag.

If the user has already reported the game, no action is taken.

Dependencies:

Requires greasemonkey/tampermonkey/violentmonkey or another method of local JS injection

Installation:

Turnkey installation is supported by navigating directly to https://github.com/aclist/rltagger/raw/main/rltagger.user.js

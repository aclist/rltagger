// ==UserScript==
// @name             RLTagger
// @description untag games
// @author           yendor
// @version          2.1.3
// @match            https://store.steampowered.com/*
// @connect         githubusercontent.com
// @require           http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @grant               GM_xmlhttpRequest
// @grant               GM.getValue
// @grant               GM.setValue
// ==/UserScript==
var arr = [];
var aid = "https://store.steampowered.com/app/";
var site = "https://raw.githubusercontent.com/aclist/rltagger/main/blacklist"
var upstream = "https://raw.githubusercontent.com/aclist/rltagger/main/rltagger.js"
var issues = "https://github.com/aclist/rltagger/issues/new?body=Rationale: &title=[Blacklist] "
var appid = window.location.pathname.split('/')[2];
var localVersion = GM_info.script.version;

var buttonStyle = "z-index: 9999; color: white;margin-top: 5px;background-color:#222; border: 0px; font-size: 1em;margin-right:5px !important;margin-bottom: 0;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;border-radius: 4px;text-decoration: none;"
var carousel = document.querySelector('.glance_tags_ctn.popular_tags_ctn')
var oneShotButton = document.createElement('div');
oneShotButton.setAttribute("id", "oneShotButton")
oneShotButton.style = buttonStyle + "background-color:#444 !important";

var startButton = document.createElement('div');
startButton.setAttribute("id", "rlStartButton");
startButton.style = "z-index: 9999; color: white;background-color:black; border: 0px; font-size: 1em;text-align:center;margin-right:5px";

var reportButton = document.createElement('div');
reportButton.setAttribute("id", "rlReportButton");
reportButton.innerHTML = 'Submit report (GitHub)';
reportButton.style = buttonStyle;


function makeArr(response) {

    (async () => {
        const state = await (GM.getValue("state"));
        const pg = await (GM.getValue("id"));
        const len = arr.length;
        const time = Math.round((len * 3) / 60);
        let pg_next = pg + 1

        function nextPg() {
            window.location.href = aid + arr[pg_next];
        }
        if (state == 1 && pg < len - 1) {
            if (window.location.href.indexOf("app") == -1) {
                setTimeout(nextPg, 3000);
            } else {
                console.log("[RLTagger] One-shot mode");
                console.log("[RLTagger] Index: " + pg + "/" + (len - 1) + ", ID:" + arr[pg]);
                await GM.setValue("id", pg_next);

                var stopButton = document.createElement('div');
                stopButton.setAttribute("id", "stopButton")
                stopButton.innerHTML = "Stop one-shot mode (" + pg + "/" + (len - 1) + ")";
                stopButton.style = buttonStyle;
                carousel.appendChild(stopButton);

                stopButton.onclick = () => {
                    console.log("[RLTagger] Stopping one-shot mode");
                    (async () => {
                        GM.setValue("state", 0);
                    })();
                    window.location.reload
                }

                process();
                setTimeout(nextPg, 3000);
            }

        } else if (state == 1) {
            //last page
            console.log("[RLTagger] Index: " + pg + "/" + (len - 1) + ", ID:" + arr[pg]);
            await GM.setValue("id", 0);
            await GM.setValue("state", 0);
            console.log("[RLTagger] One-shot mode ended");
            console.log("[RLTagger] Index: " + pg + "/" + len - 1 + ", ID:" + arr[pg]);
            process();
            oneShotButton.innerHTML = 'One-shot mode (ETA ' + time + ' minutes)';
            carousel.appendChild(oneShotButton);
        } else {
            console.log("[RLTagger] Normal mode");
            process();
            oneShotButton.innerHTML = 'One-shot mode (ETA ' + time + ' minutes)';
            carousel.appendChild(oneShotButton);

            oneShotButton.onclick = () => {

                (async () => {
                    console.log("[RLTagger] One-shot mode")
                    await GM.setValue("state", 1);
                    const a = await (GM.getValue("state"));
                    await GM.setValue("id", 0);
                    const b = await (GM.getValue("id"));
                    window.location.href = aid + arr[0]
                })();
            };
        }
    })();

    var parser = new DOMParser();
    var doc = parser.parseFromString(response.responseText, "text/html");
    var content = response.responseText
    arr = content.toString().replace(/\r\n/g, '\n').split('\n').filter(x => x !== '');

    carousel.appendChild(startButton);

    reportButton.onclick = () => {
        console.log(appid);
        window.open(issues + appid);
    }

    function checkTagExists() {
        const tagtext = Array.from(document.querySelectorAll(".app_tag")).map(x => x.innerText).join('\n');
        if (tagtext.includes("Traditional Roguelike")) {
            console.log("[RLTagger] Found Traditional Roguelike tag");
            return true
        }
    };

    function alreadyFlagged() {
        startButton.innerHTML = '[RLTagger] Already flagged';
        console.log("[RLTagger] Already reported, skipping");
        document.querySelector(".newmodal_close").click();
    };

    function tagPresentButRemoved() {

        startButton.innerHTML = '[RLTagger] Blacklisted + removed';
        document.querySelector(".newmodal_close").click();
        console.log("[RLTagger] Tag was removed, skipping");
    }

    function tickReportFlag() {
        document.querySelector(".app_tag_control.popular[data-tagid='454187'] > .app_tag_report").click();
        setTimeout(function() {
            document.querySelector(".newmodal_close").click();
        }, 1000);
        setTimeout(function() {
            document.querySelector(".newmodal_close").click();
        }, 1000);
        startButton.innerHTML = '[RLTagger] Submitted flag';
        console.log("[RLTagger] Submitted new flag");
    }

    function validateTag() {
        console.log("[RLTagger] Found appid in blacklist");
        document.getElementsByClassName('add_button')[0].click();
        var parent = document.querySelector(".app_tag_control.popular[data-tagid='454187']"),
            child = document.querySelector(".reported");
        if (parent == null) {
            tagPresentButRemoved();
        } else {
            if (parent.contains(child)) {
                alreadyFlagged();
            } else {
                tickReportFlag();
            }
        }
    }

    function notInBlacklist() {
        startButton.innerHTML = '[RLTagger] Not in blacklist';
        carousel.appendChild(reportButton);
        console.log("[RLtagger] Not in blacklist, skipping")
    }

    function process() {
        // validate blacklist
        if (window.location.href.indexOf("app") > -1) {
            if (checkTagExists()) {
                if (arr.indexOf(appid) > -1) {
                    validateTag();
                } else {
                    notInBlacklist();
                    return;
                }
            }
        }
    }
}

function fetch() {
    GM_xmlhttpRequest({
        method: 'GET',
        url: site,
        onload: makeArr,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "text/xml"
        },

    });
};

function compare(response) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(response.responseText, "text/html");
    var content = response.responseText
    var lines = content.split("\n")

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.indexOf("@version") != -1) {
            var reg = line.match(/\d.+/)
            if (localVersion !== reg[0]) {
                var newVerAlert = "New version available!"

            } else {
                return
            }
        }
    }
    var alButton = document.createElement('div');
    alButton.innerHTML = newVerAlert
    alButton.setAttribute("id", "alButton")
    alButton.style = "color:yellow;text-decoration:underline;cursor:pointer"
    carousel.appendChild(alButton);
    alButton.onclick = () => {
        window.open(upstream);
    }

}

function checkVersion() {
    GM_xmlhttpRequest({
        method: 'GET',
        url: upstream,
        onload: compare,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "text/xml"
        },

    });
};

//localVersion
var login = document.querySelector("#account_pulldown")
if (login == null) {
    console.log("[RLTagger] Not logged in. Exiting.")
    return false
} else {
    checkVersion();
    fetch();
}

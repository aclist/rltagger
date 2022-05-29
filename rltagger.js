
// ==UserScript==
// @name     RLTagger
// @description untag games
// @author yendor
// @version 2.0.0
// @match        https://store.steampowered.com/app/*
// @connect githubusercontent.com
// @require  http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @grant       GM_xmlhttpRequest
// ==/UserScript==

function makeArr(response){
var parser = new DOMParser ();
var doc = parser.parseFromString (response.responseText, "text/html");
var content = response.responseText
const arr = content.toString().replace(/\r\n/g,'\n').split('\n').filter(x => x !== '');

var startButton = document.createElement('div');
startButton.style = "top:0;right:0;position:fixed;z-index: 9999; background-color:black; border: 0px; padding-right: 5px; font-size: 1em";
document.body.appendChild(startButton);

//report button//
var reportButton = document.createElement('button');
reportButton.innerHTML = 'Add to blacklist';
reportButton.style = "top:0;right:0;position:fixed;z-index: 9999; background-color:black; color: white; border: 0px; padding-right: 5px; margin-top: 20px; font-size: 1em";
var issues = "https://github.com/aclist/rltagger/issues/new?body=Rationale:&title=[Blacklist] "
var appid = window.location.pathname.split('/')[2];

    reportButton.onclick = () => {
    console.log(appid);
    window.open(issues + appid);
}

 // validate blacklist
if (arr.indexOf(appid) > -1) {
    console.log("[RLtagger] Found appid in blacklist");
//check for tag
    var xpathResult = document.evaluate("(//text()[contains(., 'Traditional Roguelike')])[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
var node=xpathResult.singleNodeValue;
// open tag modal
document.getElementsByClassName('add_button')[0].click();
// check if ticked
    var parent = document.querySelector (".app_tag_control.popular[data-tagid='454187']"),
       child = document.querySelector(".reported");
if (parent==null) {
// tag not present
startButton.innerHTML = '[RLTagger] Blacklisted + removed';
    document.querySelector(".newmodal_close").click();
    console.log("[RLtagger] Tag was removed, skipping");
} else {
if (parent.contains(child)) {
//close window
startButton.innerHTML = '[RLTagger] Already reported';
    console.log("[RLtagger] Already reported, skipping");
document.querySelector(".newmodal_close").click();
} else {
// click flag
document.querySelector (".app_tag_control.popular[data-tagid='454187'] > .app_tag_report").click();
    setTimeout( function() {
document.querySelector(".newmodal_close").click();
}, 1000 );
        setTimeout( function() {
document.querySelector(".newmodal_close").click();
}, 1000 );
startButton.innerHTML = '[RLTagger] Submitted report';
 console.log("[RLTagger] Submitted new report");
}
}}
    else {
startButton.innerHTML = '[RLTagger] Not in blacklist';
document.body.appendChild(reportButton);
console.log("[RLtagger] Not in blacklist, skipping")
   return;
}
};

var site = "https://raw.githubusercontent.com/aclist/rltagger/main/blacklist"

function fetch(){
GM_xmlhttpRequest ( {
        method:     'GET',
        url:        site,
        onload:     makeArr,
       headers: {
    "User-Agent": "Mozilla/5.0",
    "Accept": "text/xml"
  },

    } );
};

var login = document.querySelector("#account_pulldown")
 if (login == null){
console.log("[RLTagger] Not logged in. Exiting.")
return false
 } else {
fetch();
}

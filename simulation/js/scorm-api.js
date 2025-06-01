var scormAPI = null;

function findAPI(win) {
    var findAPITries = 0;
    while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
        findAPITries++;
        if (findAPITries > 500) {
            return null;
        }
        win = win.parent;
    }
    return win.API;
}

function getAPI() {
    var theAPI = findAPI(window);
    if ((theAPI == null) && (window.opener != null) && (typeof(window.opener) != "undefined")) {
        theAPI = findAPI(window.opener);
    }
    if (theAPI == null) {
        console.log("Unable to find an API adapter");
    }
    return theAPI;
}

function initializeSCORM() {
    scormAPI = getAPI();
    if (scormAPI == null) {
        console.log("Could not establish a connection with the API.");
        return false;
    }
    
    var result = scormAPI.LMSInitialize("");
    if (result.toString() != "true") {
        var errorNumber = scormAPI.LMSGetLastError();
        var errorString = scormAPI.LMSGetErrorString(errorNumber);
        console.log("Could not initialize communication with the LMS - " + errorString);
        return false;
    }
    return true;
}

function setSCORMValue(element, value) {
    if (scormAPI == null) {
        console.log("SCORM API not initialized");
        return false;
    }
    
    var result = scormAPI.LMSSetValue(element, value);
    if (result.toString() != "true") {
        var errorNumber = scormAPI.LMSGetLastError();
        var errorString = scormAPI.LMSGetErrorString(errorNumber);
        console.log("Could not set " + element + " to " + value + " - " + errorString);
        return false;
    }
    return true;
}

function getSCORMValue(element) {
    if (scormAPI == null) {
        console.log("SCORM API not initialized");
        return "";
    }
    
    var value = scormAPI.LMSGetValue(element);
    var errorNumber = scormAPI.LMSGetLastError();
    if (errorNumber != 0) {
        var errorString = scormAPI.LMSGetErrorString(errorNumber);
        console.log("Could not retrieve " + element + " - " + errorString);
        return "";
    }
    return value;
}

function commitSCORM() {
    if (scormAPI == null) {
        console.log("SCORM API not initialized");
        return false;
    }
    
    var result = scormAPI.LMSCommit("");
    if (result.toString() != "true") {
        var errorNumber = scormAPI.LMSGetLastError();
        var errorString = scormAPI.LMSGetErrorString(errorNumber);
        console.log("Could not commit data - " + errorString);
        return false;
    }
    return true;
}

function finishSCORM() {
    if (scormAPI == null) {
        console.log("SCORM API not initialized");
        return false;
    }
    
    var result = scormAPI.LMSFinish("");
    if (result.toString() != "true") {
        var errorNumber = scormAPI.LMSGetLastError();
        var errorString = scormAPI.LMSGetErrorString(errorNumber);
        console.log("Could not finish communication with the LMS - " + errorString);
        return false;
    }
    return true;
}

// Initialize SCORM when the page loads
window.addEventListener('load', function() {
    initializeSCORM();
    // Only set incomplete status, don't assume any specific activity
    setSCORMValue("cmi.core.lesson_status", "incomplete");
    
    // Track which page was accessed
    var currentPage = window.location.pathname.split('/').pop();
    setSCORMValue("cmi.core.lesson_location", currentPage);
    commitSCORM();
});

// Finish SCORM when the page unloads
window.addEventListener('beforeunload', function() {
    finishSCORM();
});

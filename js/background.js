let request_pwd_map = {};
chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        console.log(details);
        console.log(/https:\/\/pan\.baidu\.com\/+share\/verify\?/.test(details.url));
        if (/https:\/\/pan\.baidu\.com\/+share\/verify\?/.test(details.url)) {
            request_pwd_map[details.requestId] = details.requestBody.formData['pwd'][0]
        }
        console.log(request_pwd_map)
        // return {cancel: details.url.indexOf("https://pan.baidu.com/") != -1};
    },
    {urls: ["https://pan.baidu.com/share/*"], types: ["xmlhttprequest"]},
    ["blocking", "requestBody"]
);


chrome.webRequest.onCompleted.addListener(
    function (details) {
        (async () => {
            let headerNames = details.responseHeaders.map(header => header.name);
            console.log("responseHeaders:", details.responseHeaders);
            let result = details.url.match(/https:\/\/pan\.baidu\.com\/+share\/verify\?surl=([^&]+)&?/);
            if (result) {
                console.log(result, details.url)
            }

            if (result &&
                details.requestId in request_pwd_map) {
                console.log('complete with details: ', details);
                let surl = result[1];
                console.log("surl:", surl);
                await addPan({'surl': surl, 'code': request_pwd_map[details.requestId].trim()})
            }

            // return {cancel: details.url.indexOf("https://pan.baidu.com/") != -1};

        })();


    },
    {urls: ["https://pan.baidu.com/share/*"], types: ["main_frame", "xmlhttprequest"]},
    ["responseHeaders"]
);


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    console.log("Received %o from %o, frame", msg, sender.tab, sender.frameId);
    (async () => {
        let code;
        try {
            code = await getPanCode(msg.surl);
            console.log("get pan-code:", code)
        } catch (e) {
            console.log(`failed to get pan-code {e}`)
        }
        sendResponse({result: code});
    })();
    return true
});
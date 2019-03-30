let request_pwd_map = {}
chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        console.log(details)
        console.log(/https:\/\/pan\.baidu\.com\/+share\/verify\?/.test(details.url))
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
    async function (details) {
        let result = details.url.match(/https:\/\/pan\.baidu\.com\/+share\/init\?surl=([^&]+)&?/)
        if (result) {
            let surl = result[1]
            let code = await getPanCode(surl)
            console.log('using code: ', code)
            if (code) {
                chrome.tabs.sendMessage(details.tabId, {type: 'fill', value: code}, (response) => {
                    console.log('response:',response)
                })

            } else {
                let headerNames = details.responseHeaders.map(header => header.name)
                console.log(headerNames)
                if (headerNames.includes('Set-Cookie') &&
                    details.requestId in request_pwd_map) {
                    console.log('complete with details: ',details)

                    let result = details.url.match(/https:\/\/pan\.baidu\.com\/+share\/verify\?surl=([^&]+)&?/)
                    console.log(result, details.url)

                    if (result) {
                        let surl = result[1]
                        console.log(surl)
                        await addPan({'surl': surl, 'code': request_pwd_map[details.requestId].trim()})
                    }
                }
            }
        }

        // return {cancel: details.url.indexOf("https://pan.baidu.com/") != -1};
    },
    {urls: ["https://pan.baidu.com/share/*"], types: ["main_frame","xmlhttprequest"]},
    ["responseHeaders"]
)
let result = location.href.match(/https:\/\/pan\.baidu\.com\/+share\/init\?surl=([^&]+)&?/)
let surl = ''
if(result){
    surl = result[1]
}
chrome.runtime.sendMessage({surl: surl}, function (response) {
    console.log(response)
    if (response.result)
            document.querySelector("[CLASS~=pickpw] input").value = response.result

})
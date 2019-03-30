chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == 'fill') {
        $("[CLASS~=pickpw] input").val(message.value)
    }else if(message.type=='msg'){
        alertify.log(message.content)
    }
    return true//required
})




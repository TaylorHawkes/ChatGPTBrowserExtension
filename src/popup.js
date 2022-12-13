const port = chrome.runtime.connect();

document.getElementById('enable_caching').addEventListener('change', function(){
    console.log(port);
  if (event.currentTarget.checked) {
        chrome.storage.sync.set({'enabled_caching': true},function() {
           port.postMessage({ "action":"updateSettings" });
        });
  } else {
        chrome.storage.sync.set({'enabled_caching': false},function(){
           port.postMessage({ "action":"updateSettings" });
        });
  }
});
document.getElementById('enable_keypress').addEventListener('change', function(){
  if (event.currentTarget.checked) {
        chrome.storage.sync.set({'enable_keypress': true},function(){
           port.postMessage({ "action":"updateSettings" });
        });
  } else {
        chrome.storage.sync.set({'enable_keypress': false},function(){
           port.postMessage({ "action":"updateSettings" });
        });
  }
    chrome.runtime.sendMessage({ "action":"updateSettings" });
});

chrome.storage.sync.get(['enabled_caching','enable_keypress'], function(all_items) {
    var enable_caching=(all_items.hasOwnProperty('enabled_caching')) ? all_items.enabled_caching : true; 
    var enable_keypress=(all_items.hasOwnProperty('enable_keypress')) ? all_items.enable_keypress : false; 

    var enable_caching_dom= document.getElementById('enable_caching');
    if(enable_caching){
        enable_caching_dom.setAttribute("checked","checked");
    }else{
        if(enable_caching_dom.hasAttribute("checked")){
            enable_caching_dom.removeAttribute("checked");
        }
    }

    var enable_keypress_dom= document.getElementById('enable_keypress');
    if(enable_keypress){
        enable_keypress_dom.setAttribute("checked","checked");
    }else{
        if(enable_keypress_dom.hasAttribute("checked")){
            enable_keypress_dom.removeAttribute("checked");
        }
    }
    
});

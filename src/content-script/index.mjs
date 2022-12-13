import Browser from "webextension-polyfill";

function commando() {
  this.listenForFeedbackOnAnswer = true; 
  this.user_id=false;
  this.answers=[];
  this.products=[];
  this.writeups=[];
  //this.doneLoadingAnswersDom=false;
  this.languageGuess="whatever";
  this.isWrittingAnswer=false;
  this.copyClickedTimes=0;
  this.bounty=0;
  this.needsResults1ToDisplayOnDomLoaded=false;
  var currentDate = new Date();
  this.currentTime = currentDate.getTime();
  this.resultsURLS=[];
  this.loadedCodeMirrorModes=[];
  this.moreAnswers=[];
  this.moreResultsInitiated=false;
  this.moreAnswersTotalCount=0;
  this.stateDomLoadedNoResults=0;
  this.mHasBeenClicked=false;
  this.oHasBeenClicked=false;
  this.stream;
  this.recorder;
  this.videoHolder = false;
  this.uploadedVideoName = false;
  this.currentEditingAnswer=false;
  this.grepperSpecialKeysDown={};
  this.grepperActionDownPressedKey=false;
  this.grepcc_tips_left=0;
  this.showWrongAnswerFeedbackButton=false;
  this.user_data=false;
  this.f_more_results=0;
}

commando.prototype.displayResult =function(answer,container) {
       if(!answer.is_code){
        var newText = document.createElement("p");
            newText.textContent=answer.answer;
            container.appendChild(newText);
            return;
       }

        var answer_id=answer.id;

        var codeResults = document.createElement("code");
            codeResults.textContent=answer.answer;
            codeResults.classList.add("gpt_commando_code_block");

            var languageGuess="javascript";
            if(answer.language){
                languageGuess=answer.language;
            }
            codeResults.classList.add("language-"+languageGuess);

        var codeResultsPre = document.createElement("pre");
            codeResultsPre.classList.add("language-"+languageGuess);
            codeResultsPre.appendChild(codeResults);
            codeResultsPre.classList.add("gpt_commando_selectable");
            
        var codeResultsOuter = document.createElement("div");
            codeResultsOuter.classList.add("gpt_commando_code_block_outer");

         var answerOptionsHolder= document.createElement("div");
             answerOptionsHolder.classList.add("commando_answers_options_holder");


            codeResultsOuter.appendChild(codeResultsPre);

          answer.codeResults=codeResults;
          answer.myDom=codeResultsOuter;

        container.appendChild(codeResultsOuter);
        Prism.highlightAll();

        
}


let co=new commando();

var doneLoading=false;
var  loading=document.createElement("p");
     loading.textContent="Waiting for ChatGPT response..."; 
     loading.classList.add('loading');
  
async function run(question) {
  const container = document.createElement("div");
  container.className = "chat_gpt_container_enhanced";

  const attribution = document.createElement("a");
        attribution.textContent="ChatGPT";
        attribution.href="https://openai.com/blog/chatgpt/";
        attribution.target="_blank";
        attribution.classList.add('chat_gpt_container_attribution');
    container.appendChild(attribution);


 let lastAnswer=false;
       container.appendChild(loading);
       doneLoading=false;

  const siderbarContainer = document.getElementById("rhs");
  if (siderbarContainer) {
    siderbarContainer.prepend(container);
  } else {
    container.classList.add("sidebar-free");
    document.getElementById("rcnt").appendChild(container);
  }

  const port = Browser.runtime.connect();
  port.onMessage.addListener(function (msg) {
     if(msg.answer=="[DONE_FROM_CACHE]"){
       parseIntoAnswers(lastAnswer,container,true);
     }else if(msg.answer=="[DONE]"){
         parseIntoAnswers(lastAnswer,container,true);
         port.postMessage({
            'action':'cacheAnswer', 
            'question':question,
            'answer':lastAnswer
         });
     }else if (msg.answer) {
        lastAnswer=msg.answer;
    

       parseIntoAnswers(msg.answer,container,false);

    // container.querySelector("pre").textContent = answerContent ;
    } else if (msg.error === "UNAUTHORIZED") {
      container.innerHTML = '<p>Please login at <a href="https://chat.openai.com" target="_blank">chat.openai.com</a> first</p>';
    } else {
      container.innerHTML = "<p>Failed to load response from ChatGPT</p>";
    }
  });
      port.postMessage({
        'action':'getAnswer', 
        'question':question
     });
}


let allAnswers=[];
function parseIntoAnswers(content,container,isDone){
    if(content.length > 1){
        let answersRaw=content.split("\n"); 
        let answers2=[];
        for (let j = 0;j<answersRaw.length;j++){
            //push the last answer so we can remove it later
            if(answersRaw[j].length > 0 || answersRaw.length==j){
                answers2.push(answersRaw[j]);
            }
        }

        if(answers2.length && !isDone){
            answers2.pop();
        }

        let answers=[];
        let isCode=false;
        let fullAnswer="";
        for (let t = 0;t<answers2.length;t++){

            if(answers2[t]=='```'){
                if(isCode){
                    //end the code
                    answers.push({"is_code":true,"answer":fullAnswer})
                    fullAnswer="";
                    isCode=false;
                }else{
                    isCode=true;
                }
            }else{
                if(isCode){
                    fullAnswer+=answers2[t]+"\n";
                }else{
                    answers.push({"is_code":false,"answer":answers2[t]})
                }
            }
        }
        

        //remove the last answer bc it will be too short.
        if(answers.length){
           if(!doneLoading){
                container.removeChild(loading);
                doneLoading=true;
            }
        }

        if(answers.length > allAnswers.length){
            for (let i = allAnswers.length;i<answers.length;i++){
                let answer={};
                    answer.id=12;
                    answer.answer=answers[i].answer;
                    answer.user_id=4;
                    answer.created_at=4;
                    answer.is_code=answers[i].is_code;
                    allAnswers.push(answer);
                    co.displayResult(answer,container);
            }
        }
    }
}

const searchInput = document.getElementsByName("q")[0];

if (searchInput && searchInput.value) {
  // only run on first page
  const startParam = new URL(location.href).searchParams.get("start") || "0";
  if (startParam === "0") {
    chrome.storage.sync.get(['enable_keypress'], function(all_items) {
        var enable_keypress=(all_items.hasOwnProperty('enable_keypress')) ? all_items.enable_keypress : false; 
        if(!enable_keypress){
            run(searchInput.value);
        }else{
            //listen for "g"
            document.addEventListener('keydown', function(event) {
                if(event.key=="g"){
                    run(searchInput.value);
                }
            });
        }
    });

  }
}




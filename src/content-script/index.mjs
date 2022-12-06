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
        if(answer.do_hide4 == 1){
            return;
        }

        var answer_id=answer.id;

        var codeResults = document.createElement("code");
            codeResults.textContent=answer.answer;
            codeResults.classList.add("commando_code_block");

            var languageGuess="javascript";
            if(answer.language){
                languageGuess=answer.language;
            }
            codeResults.classList.add("language-"+languageGuess);

        var codeResultsPre = document.createElement("pre");
            codeResultsPre.classList.add("language-"+languageGuess);
            codeResultsPre.appendChild(codeResults);
            codeResultsPre.classList.add("commando_selectable");
            
        var codeResultsOuter = document.createElement("div");
            codeResultsOuter.classList.add("commando_code_block_outer");

         var answerOptionsHolder= document.createElement("div");
             answerOptionsHolder.classList.add("commando_answers_options_holder");


            codeResultsOuter.appendChild(codeResultsPre);

          answer.codeResults=codeResults;
          answer.myDom=codeResultsOuter;

        container.appendChild(codeResultsOuter);

        
}



let co=new commando();

async function run(question) {
  const container = document.createElement("div");
  container.className = "chat-gpt-container";
  container.innerHTML = '<p class="loading">Waiting for ChatGPT response...</p>';

  const siderbarContainer = document.getElementById("rhs");
  if (siderbarContainer) {
    siderbarContainer.prepend(container);
  } else {
    container.classList.add("sidebar-free");
    document.getElementById("rcnt").appendChild(container);
  }

  const port = Browser.runtime.connect();
  port.onMessage.addListener(function (msg) {
    if (msg.answer) {
      container.innerHTML = '<p><span class="prefix">ChatGPT:</span><pre></pre></p>';

    var answer = parseIntoAnswers(msg.answer,container);
    // container.querySelector("pre").textContent = answerContent ;

    } else if (msg.error === "UNAUTHORIZED") {
      container.innerHTML =
        '<p>Please login at <a href="https://chat.openai.com" target="_blank">chat.openai.com</a> first</p>';
    } else {
      container.innerHTML = "<p>Failed to load response from ChatGPT</p>";
    }
  });
  port.postMessage({ question });
}

let allAnswers=[];
function parseIntoAnswers(content,container){
    if(content.length > 1){
        let answersRaw=content.split("\n"); 
        let answers=[];
        for (let j = 0;j<answersRaw.length;i++){
            if(answersRaw[j].length > 1){
                answers.push(answersRaw[j]);
            }
        }

        if(answers.length > allAnswers.length){
            for (let i = allAnswers.length;i<answers.length;i++){
                let answer={};
                    answer.id=12;
                    answer.answer=answers[i];
                    answer.user_id=4;
                    answer.created_at=4;
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
    run(searchInput.value);
  }
}




import ExpiryMap from "expiry-map";
import { v4 as uuidv4 } from "uuid";
import Browser from "webextension-polyfill";
import { fetchSSE } from "./fetch-sse.mjs";

const KEY_ACCESS_TOKEN = "accessToken";

const cache = new ExpiryMap(10 * 1000);

let enabled_caching=true;
let enable_keypress=false;

function updateSettings(){
    chrome.storage.sync.get(['enabled_caching','enable_keypress'], function(all_items) {
        enable_caching=(all_items.hasOwnProperty('enabled_caching')) ? all_items.enabled_caching : true; 
        enable_keypress=(all_items.hasOwnProperty('enable_keypress')) ? all_items.enable_keypress : false; 
    });
    console.log("updateding sttings");
}

updateSettings();

async function getAccessToken() {
  if (cache.get(KEY_ACCESS_TOKEN)) {
    return cache.get(KEY_ACCESS_TOKEN);
  }
  const resp = await fetch("https://chat.openai.com/api/auth/session")
    .then((r) => r.json())
    .catch(() => ({}));
  if (!resp.accessToken) {
    throw new Error("UNAUTHORIZED");
  }
  cache.set(KEY_ACCESS_TOKEN, resp.accessToken);
  return resp.accessToken;
}

async function cacheAnswer(question,answer) {
    const rawResponse = await fetch('https://www.codegrepper.com/api/cache_answer.php', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({term: question, answer:answer})
  });
 const content = await rawResponse.json();
}

async function getAnswer(question, callback) {
  const accessToken = await getAccessToken();
  if(enable_caching){
      const resp = await fetch("https://www.codegrepper.com/api/cache_get_answers.php?term="+question)
      .then((r) => r.json())
      .catch(() => ({}));
      if(resp.answers.length){
            callback(resp.answers[0].answer);
            callback("[DONE_FROM_CACHE]");
            return;
      }
   }

  await fetchSSE("https://chat.openai.com/backend-api/conversation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      action: "next",
      messages: [
        {
          id: uuidv4(),
          role: "user",
          content: {
            content_type: "text",
            parts: [question],
          },
        },
      ],
      model: "text-davinci-002-render",
      parent_message_id: uuidv4(),
    }),
    onMessage(message) {
      //console.debug("sse message", message);
      if (message === "[DONE]") {
        callback("[DONE]");
        return;
      }
      const data = JSON.parse(message);
      const text = data.message?.content?.parts?.[0];
      if (text) {
        callback(text);
      }
    },
  });
}

Browser.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (msg) => {
    if(msg.action=="getAnswer"){
        try {
          await getAnswer(msg.question, (answer) => {
            port.postMessage({ answer });
          });
        } catch (err) {
          console.error(err);
          port.postMessage({ error: err.message });
          cache.delete(KEY_ACCESS_TOKEN);
        }

    } else if(msg.action=="cacheAnswer"){
        cacheAnswer(msg.question,msg.answer)
    } else if(msg.action=="updateSettings"){
        updateSettings();
    }

  });
});

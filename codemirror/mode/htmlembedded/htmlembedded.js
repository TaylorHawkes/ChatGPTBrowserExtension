// TaysCodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../htmlmixed/htmlmixed"),
        require("../../addon/mode/multiplex"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../htmlmixed/htmlmixed",
            "../../addon/mode/multiplex"], mod);
  else // Plain browser env
    mod(TaysCodeMirror);
})(function(TaysCodeMirror) {
  "use strict";

  TaysCodeMirror.defineMode("htmlembedded", function(config, parserConfig) {
    var closeComment = parserConfig.closeComment || "--%>"
    return TaysCodeMirror.multiplexingMode(TaysCodeMirror.getMode(config, "htmlmixed"), {
      open: parserConfig.openComment || "<%--",
      close: closeComment,
      delimStyle: "comment",
      mode: {token: function(stream) {
        stream.skipTo(closeComment) || stream.skipToEnd()
        return "comment"
      }}
    }, {
      open: parserConfig.open || parserConfig.scriptStartRegex || "<%",
      close: parserConfig.close || parserConfig.scriptEndRegex || "%>",
      mode: TaysCodeMirror.getMode(config, parserConfig.scriptingModeSpec)
    });
  }, "htmlmixed");

  TaysCodeMirror.defineMIME("application/x-ejs", {name: "htmlembedded", scriptingModeSpec:"javascript"});
  TaysCodeMirror.defineMIME("application/x-aspx", {name: "htmlembedded", scriptingModeSpec:"text/x-csharp"});
  TaysCodeMirror.defineMIME("application/x-jsp", {name: "htmlembedded", scriptingModeSpec:"text/x-java"});
  TaysCodeMirror.defineMIME("application/x-erb", {name: "htmlembedded", scriptingModeSpec:"ruby"});
});

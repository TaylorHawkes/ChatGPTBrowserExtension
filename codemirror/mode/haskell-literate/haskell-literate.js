// TaysCodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function (mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../haskell/haskell"))
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../haskell/haskell"], mod)
  else // Plain browser env
    mod(TaysCodeMirror)
})(function (TaysCodeMirror) {
  "use strict"

  TaysCodeMirror.defineMode("haskell-literate", function (config, parserConfig) {
    var baseMode = TaysCodeMirror.getMode(config, (parserConfig && parserConfig.base) || "haskell")

    return {
      startState: function () {
        return {
          inCode: false,
          baseState: TaysCodeMirror.startState(baseMode)
        }
      },
      token: function (stream, state) {
        if (stream.sol()) {
          if (state.inCode = stream.eat(">"))
            return "meta"
        }
        if (state.inCode) {
          return baseMode.token(stream, state.baseState)
        } else {
          stream.skipToEnd()
          return "comment"
        }
      },
      innerMode: function (state) {
        return state.inCode ? {state: state.baseState, mode: baseMode} : null
      }
    }
  }, "haskell")

  TaysCodeMirror.defineMIME("text/x-literate-haskell", "haskell-literate")
});

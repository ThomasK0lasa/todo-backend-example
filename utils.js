exports.debugConsole = function () {
    if (debug) console.log.apply(null,arguments);
  }
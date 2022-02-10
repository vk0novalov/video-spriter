'use strict';

const callOnce = (fn) => {
  let called = false;

  return (...args) => {
    if (called) return;
    fn(...args);
    called = true;
  };
};

module.exports = {
  callOnce,
};

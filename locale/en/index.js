//this is the "en" locale spec
//it should have numbers, dates, plurals
//mostly lifted from counterpart.
var ORDINALS = ["th","st","nd","rd"];

module.exports = {
  dates: {
    names: require("date-names/en"),
    //used for dates only.
    ordinals: function(n){
      var i = n%10, ii = n%100;
      if((ii >10 && ii < 14) || i > 3 || i === 0){
        i = 0;
      }
      return ORDINALS[i];
    },
    formats:{
      date: {
        "default":  "%a, %e %b %Y",
        long:       "%A, %B %o, %Y",
        short:      "%b %e"
      },
      time: {
        "default":  "%H:%M",
        long:       "%H:%M:%S %z",
        short:      "%H:%M"
      },
      datetime: {
        "default":  "%a, %e %b %Y %H:%M",
        long:       "%A, %B %o, %Y %H:%M:%S %z",
        short:      "%e %b %H:%M"
      }
    }
  },
  //how to format numbers.
  numbers: {
    thousands: ",",
    decimals: "."
  },
  //pick a key based on the count in english.
  //that is one if one, zero if zero and zero specified, other otherwise.
  plurals: function(entry, count){
    if(count === 0){
      return ("zero" in entry) ? "zero" : "other";
    }
    return count === 1 ? "one" : "other";
  }
};
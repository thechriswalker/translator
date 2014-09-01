var sprintf = require("sprintf").sprintf,
    strftime = require("./strftime"),
    pluck = require("./pluck"),
    merge = require("./merge");

//to help minification.
var THOUSANDS = "thousands",
    DECIMALS = "decimals",
    FORMATS = "formats",
    ORDINALS = "ordinals",
    NAMES = "names",
    DATES = "dates",
    NUMBERS = "numbers",
    STRINGS = "strings",
    PLURALS = "plurals";

var undef; //undefined

module.exports = Translator;

//Main constructor
function Translator(){
  this._locales = {};
  this._locale = null;
  //bind translate/date/number for ease of use
  this.translate = this.translate.bind(this);
  this.date = this.date.bind(this);
  this.number = this.date.bind(this);
}

Translator.prototype = {
  //Set the Translator to use a given locale, throws an error
  //if the locale is not registered
  setLocale: function(locale){
    if(!(locale in this._locales)){
      throw new Error("Missing Locale: `"+locale+"`, please call `registerLocale` first.");
    }
    var prev = this._locale;
    this._locale = locale;
    return prev;
  },
  //Gets the current locale
  getLocale: function(){
    return this._locale;
  },
  //register a new locale, the `spec` object should contain the locale formats
  //and pluralizing function. see `locales/en` for details.
  //strings is optional, and registers strings as well.
  //@TODO throw error on missing/invalid stuff
  registerLocale: function(locale, spec, strings){
    var loc = this._locales[locale] = { strings: {} };
    if(spec){
      [NUMBERS,DATES,PLURALS].forEach(function(k){
        if(spec[k]){ loc[k] = spec[k]; }
      });
    }
    if(strings){
      this.registerStrings(locale, strings);
    }
    //if no locale currently selected, this is the one.
    if(!this._locale){
      this._locale = locale;
    }
  },
  //this function adds a new batch of strings to a locale
  registerStrings: function(locale, strings){
    if(!(locale in this._locales)){
      throw new Error("Missing Locale: `"+locale+"`, please call `registerLocale` first.");
    }
    merge(this._locales[locale].strings, strings);
  },
  //create a translation.
  //it is lazy, so we don't actually translate until the returned function is
  //either called (with optional interpolations), or cast to string.
  //this allows you to not bother calling the function in most situations and
  //treating the response from this function as a string anyway.
  //That may break aother libraries expecting strings, so for them, just call
  //immediately -> translate("some.key")();
  translate: function(key, options){
    if(!Array.isArray(key)){ key = key.split("."); }
    if(!options){ options = {}; }
    if(options.scope){
      var scope = options.scope;
      if(!Array.isArray(scope)){ scope = scope.split("."); }
      key = scope.concat(key);
    }
    //build the full key
    key = [STRINGS].concat(key);
    var locale = options.locale||this._locale;

    //here's a clever bit, we return a curried function, that can take
    //interpolations. but it can also just be cast to string!
    var returnFn = this._translate.bind(this, locale, key, options);
    returnFn.toString = returnFn;
    return returnFn;
  },
  //actually translate
  //this does the real translation, find the text/fallback from a key/locale and
  //do interpolations if necessary
  _translate: function(locale, keyArray, options, interpolations){
    if(!options){ options = {}; }
    var errorMessage, plural, pluralKey,
        text = fallback_pluck(locale, keyArray, this._locales);
    //check for plural
    if(text !== undef && typeof text === "object"){
      //could have plural forms.
      plural = fallback_pluck(locale, [PLURALS], this._locales);
      if(typeof plural !== "function"){
        errorMessage = "missing `plurals` function for locale `"+locale+"`";
        if(options.doNotThrow === true){
          return errorMessage;
        }
        throw new Error(errorMessage);
      }
      //we have the plurals function
      pluralKey = plural(text, (interpolations && interpolations.count)||0);
      //add the plural to the keys array but deference
      keyArray = keyArray.concat([pluralKey]);
      text = text[pluralKey]; //this may be undefined...
    }
    if(text === undef){
      errorMessage = "missing translation: "+locale+"."+JSON.stringify(keyArray);
      if(options.doNotThrow === true){
        return errorMessage;
      }
      throw new Error(errorMessage);
    }
    if(interpolations){
      text = sprintf(text, interpolations);
    }
    return text;
  },
  //localize a date
  //options can be "type" => (date|time|datetime)
  //and "format" => (default|short|long)
  date: function(date, options){
    if(Object.prototype.toString.call(date) !== "[object Date]"){ throw new TypeError("Translator.date expects a `Date` as first argument"); }
    if(!options){ options = {}; }
    var locale = options.locale||this._locale,
      keys = [
        DATES,
        FORMATS,
        options.type || "datetime",
        options.format || "default"
      ],
      names = fallback_pluck(locale, [DATES,NAMES], this._locales),
      ordinals = fallback_pluck(locale, [DATES,ORDINALS], this._locales),
      text = this._translate(locale, keys);
    if(names === undef || ordinals === undef){
      throw new Error("Missing Date names/ordinals for locale `"+locale+"`");
    }
    return strftime(date, text, names, ordinals);
  },
  //localize a number
  //options can alter the default locale "thousands" for thousands seperator,
  //and decimals seperator.
  number: function(number, options){
    if(typeof number !== "number"){ throw new TypeError("Translator.number expects a `Number` as first argument"); }
    var locale = options.locale||this._locale,
        thousands = options.thousands || fallback_pluck(locale, [NUMBERS,THOUSANDS], this._locales),
        decimals = options.decimals || fallback_pluck(locale, [NUMBERS,DECIMALS], this._locales);
    if(thousands === undef || decimals === undef){
      throw new Error("Missing thousands/decimals for locale: `"+locale+"`");
    }

    var num = ("dp" in options) ? number.toFixed(options.dp) : number.toString();
    var parts = num.split("."), digits = parts[0].length;
    //do thousands on parts[0]
    return parts[0].split("").reduceRight(function(p,c,i){
      if((i-digits+1) %3 === 0 && i!==digits-1){ p = thousands+p; }
      return c+p;
    }, parts[1] ? decimals+parts[1] : "");
  }
};

//fallback pluck
//we try and pluck from a locale, but fallback to a another if we don't find it in the first.
function fallback_pluck(locale, keys, object){
  var val;
  if( (val = pluck(keys, object[locale])) !== undef){
    return val;
  }
  var fallback = fallback_locale(locale);
  if(fallback){
    return fallback_pluck(fallback, keys, object);
  }
}

//returns the name of an alternative locale or nothing.
function fallback_locale(locale){
  var fallback;
  if(locale && (fallback = locale.split("_")[0]) !== locale){
    return fallback;
  }
}
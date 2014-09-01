"use strict";
var assert = require("assert"),
    vows = require("vows"),
    Translator = require("../lib/translator");

vows
  .describe("Translator")
  .addBatch({
    "before adding a locale": {
      topic: function(){ return new Translator(); },
      "setLocale should throw an error": function(T){
        assert.throws(T.setLocale.bind(T, "en"));
      },
      "translate should throw an error on lazy evaluate (but not before)": function(T){
        var translation;
        assert.doesNotThrow(function(){ translation = T.translate("some.key"); });
        assert.throws(function(){ return translation+""; });
      },
      "translate should return `missing` if options.doNotThrow is set": function(T){
        var text;
        assert.doesNotThrow(function(){
          text = T.translate("some.key", {doNotThrow: true}) + "";
        });
        console.log(text);
        assert.equal(!!text.match(/missing/), true);
      }
    }
  })
  .addBatch({
    "adding a locale": {
      topic: function(){
        var t = new Translator();
        t.registerLocale("en", require("../locale/en"));
        return t;
      },
      "the first time should set the locale": function(T){
        assert.equal(T.getLocale(), "en");
      },
      "should allow us to call setLocale": function(T){
        assert.doesNotThrow(function(){ T.setLocale("en"); });
      },
      "should allow us to localize": function(T){
        //we test this works properly later...
        assert.doesNotThrow(function(){ T.date(new Date()); });
      },
      "we shouldn't be able to translate yet": function(T){
        assert.throws(function(){ T.translate("anything")(); });
      },
      "we should not be able to add string for another locale": function(T){
        assert.throws(function(){ T.registerStrings("de", {}); });
      },
      "we should be able to add strings for the given locale and translate them": function(T){
        assert.doesNotThrow(function(){
          T.registerStrings("en", {"test":"This is a Test"});
        });
        assert.equal(T.translate("test")(), "This is a Test");
      }
    }
  })
  .addBatch({
    "given a fully loaded Translator": {
      topic: function(){
        var t = new Translator();
        t.registerLocale("en", require("../locale/en"), {
          "my_string": "My String",
          "nested": { "key": "Nested Key" },
          "with": {"interpolations": "Hello %(name)s" },
          "with.dot": "tricky",
          "plural": {
            "one": "Just One",
            "zero": "Zero",
            "other": "This Many: %(count)d"
          }
        });
        return t;
      },
      "simple translation should work": function(T){
        assert.equal(T.translate("my_string")(), "My String");
        //cast to string!
        assert.equal(T.translate("my_string")+"", "My String");
        assert.equal(String(T.translate("my_string")), "My String");
      },
      "nested translation should work": function(T){
        assert.equal(T.translate("nested.key")(), "Nested Key");
        assert.equal(T.translate(["nested","key"])(), "Nested Key");
      },
      "array notation can contain dots": function(T){
        assert.equal(T.translate(["with.dot"])(), "tricky");
        assert.throws(function(){
          T.translate("with.dot")();
        });
      },
      "scope option should work": function(T){
        assert.equal(T.translate("key", {scope: "nested"})(), "Nested Key");
      },
      "locale option should work (in this case erroring)": function(T){
        assert.throws(function(){
          T.Translate("my_string", {locale: "de"})();
        });
      },
      "interpolation should work": function(T){
        assert.equal(T.translate("with.interpolations")({name: "World!"}), "Hello World!");
        assert.throws(function(){
          T.translate("with.interpolations")({bad:"key"});
        });
      },
      "pluralisation should work": {
        topic: function(T){
          return T.translate("plural");
        },
        "with zero": function(p){
          assert.equal(p({count: 0}), "Zero");
        },
        "with one": function(p){
          assert.equal(p({count: 1}), "Just One");
        },
        "with more": function(p){
          assert.equal(p({count: 42}), "This Many: 42");
        }
      }
    }
  })
  .addBatch({"multiple locales":{
    topic: function(){
      var t = new Translator();
        t.registerLocale("en", require("../locale/en"), {
          "my_string": "My String",
          "nested": { "key": "Nested Key" },
          "with": {"interpolations": "Hello %(name)s" },
          "with.dot": "tricky",
          "plural": {
            "one": "Just One",
            "zero": "Zero",
            "other": "This Many: %(count)d"
          }
        });
    }

    }
  }) //testing specifying and fallback
  .addBatch({"date localisation":{}})
  .addBatch({"number localisation":{}})
  .export(module);
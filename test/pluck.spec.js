"use strict";
var assert = require("assert"),
    vows = require("vows"),
    pluck = require("../lib/pluck");

var OBJ = {
  a: {b: {c: {d: {e: "e"}}}},
};

var undef;

vows
  .describe("pluck")
  .addBatch({
    "plucking a non-existent path": {
      topic: function(){
        return {value: pluck(["non","existent-path"], OBJ)};
      },
      "should return undefined": function(res){
        assert.strictEqual(res.value, undef);
      }
    },
    "plucking a valid path": {
      topic: function(){
        return pluck(["a","b","c","d","e"], OBJ);
      },
      "should return the correct value": function(res){
        assert.equal(res, "e");
      }
    },
    "plucking a partial path": {
      topic: function(){
        return pluck(["a","b","c"], OBJ);
      },
      "should return the rest (by reference)": function(res){
        assert.strictEqual(res, OBJ.a.b.c);
        assert.equal(res.d.e, "e");
      }
    }
  })
  .export(module);
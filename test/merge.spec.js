"use strict";
var assert = require("assert"),
    vows = require("vows"),
    merge = require("../lib/merge");

vows
  .describe("merge")
  .addBatch({
    "when merging simply": {
      topic: function(){
        var obj1 = { a: "a", c: 3 , e: "e"},
          obj2 = {b: "b", d: 4, e: "e2"};
        merge(obj1, obj2);
        return obj1;
      },
      "it should add non-conflicting keys to target": function(res){
        assert.equal(res.a, "a");
        assert.equal(res.b, "b");
        assert.equal(res.c, 3);
        assert.equal(res.d, 4);
      },
      "it should overwrite conflicting keys": function(res){
        assert.equal(res.e, "e2");
      }
    },
    "when deep merging": {
      topic: function(){
        var obj1 = {
          a: { b: { c: { d: "deep"} } },
          d: { d: {d: "d"} }
        },
        obj2 = {
          a: { b2: "b2", b: { c: { e: "e", } } },
          d: { d: "overwrite" }
        };
        merge(obj1, obj2);
        return obj1;
      },
      "it should keep/add non-conflicting keys": function(res){
        assert.equal(res.a.b.c.d, "deep");
        assert.equal(res.a.b.c.e, "e");
        assert.equal(res.a.b2, "b2");
      },
      "it should overwrite objects with strings": function(res){
        assert.equal(res.d.d, "overwrite");
      }
    }
  })
  .export(module);
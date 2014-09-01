//plucks a value from an object by the given array of keys.
//super simple.
var undef; //undefined

module.exports = function pluck(keys, v){
  if(v === undef){ return; }
  var k = keys.slice(); //don't affect original array
  while(k.length && (v = v[k.shift()])){}
  return v;
};
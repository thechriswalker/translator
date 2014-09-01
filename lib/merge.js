//deep merge objects by reference
//they should not have array keys
module.exports = function merge(target, data){
  for(var k in data){
    if(Object.prototype.hasOwnProperty.call(data, k)){
      //if k is not in target, we can safely just set.
      //or if data[k] is not an object, we will overwrite.
      if(!(k in target) || typeof data[k] !== "object"){
        target[k] = data[k];
      }else{
        merge(target[k], data[k]);
      }
    }
  }
};
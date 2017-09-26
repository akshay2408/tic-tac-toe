import Ember from 'ember';

export default Ember.Object.extend({
  board : [
    '','','',
    '','','',
    '','',''
  ],
  wins: [
    [0,1,2], [3,4,5], [6,7,8], [0,3,6],
    [1,4,7], [2,5,8], [0,4,8], [2,4,6]
  ],
  
  update: function(item, symbol){
    if(item) {
      let cls = item.cls.concat(" "+symbol);
      Ember.set(item, 'cls', cls);
      Ember.set(item, 'symbol', symbol);
    }
  }
})

import Ember from 'ember';

export default Ember.Object.extend({
	board : [
		'_','_','_',
		'_','_','_',
		'_','_','_'
	],
	wins: [
		[0,1,2], [3,4,5], [6,7,8], [0,3,6],
		[1,4,7], [2,5,8], [0,4,8], [2,4,6]
	],
	update: function(){
		var board = this.get('board');
		Ember.$('#game tr').each(function(x, el){
			Ember.$('td', el).each(function(i){
				var pos = Number(i);
				if(x == 1) pos = (pos+3);
				if(x == 2) pos = (pos+6);
				var txt = (board[pos] == '_') ? '' : board[pos];
				Ember.$(this).html( txt ).addClass( txt );
			});
		});
	}
})
import Ember from 'ember';
import BoardObject from '../custom-objects/board-object';

export default Ember.Service.extend({
	currentPlayer: null,
	status: null,
	newMatchBtnShow: false,
	restartBtnShow: false,
	subscription: null,
	score: {'X': 0, 'O': 0},

	init(){
		this.over = false,
		this.moves = 0,
		this._winPiece = [],
		this.players = Ember.A(),
		this.activePlayer = 0, // current active player (index of this.players)
		this.playerType = null;
		this.board = BoardObject.create({board : ['_','_','_','_','_','_','_','_','_']})
	},

	setPType(pType){
		this.set('currentPlayer',(pType == 'cross') ? 0 : 1);
		this.start();
	},

	start(){
		this.init();
		this.getTurn();
		this.get('players').pushObject({_id: 0,symbol:"X",computer:false,moves:[]});
		this.get('players').pushObject({_id: 1, symbol: "O",computer:false,moves:[]});
		this.get('board').update();
	},

	getTurn(){
		if(this.get('over')) return;
		if(this.get('activePlayer') === this.get('currentPlayer')) {
			this.set('status','Your turn');
		} else {
			this.set('status','Opponent\'s turn');
		}
	},

	getMarked(row,col){
		if(this.get('over')) return;
		if(this.get('activePlayer') !== this.get('currentPlayer')) return;
		var move = row +' '+ col;
		this.get('subscription').perform('take_turn', {data:move});
		this.move(move);
	},

	getHovered() {
		if(this.get('activePlayer') !== this.get('currentPlayer')) return;
		if(this.get('over')) return;
		if(event.type == 'mouseover')
			Ember.$(event.target).addClass('hover-'+ this.activePlayer);
		else
			Ember.$(event.target).removeClass('hover-0 hover-1');
	},
		
	move(move){
		var self = this;
		var Player = self.get('players')[ self.get('activePlayer') ];
		var v = move.split(' ');
		var pos = Number(v[1]);
		if(v[0] == 1) pos = (pos+3);
		if(v[0] == 2) pos = (pos+6);
		move = {
			row: v[0],
			col: v[1],
			index: pos
		};
		if(self.get('board').board[move.index] != '_') return false;
		Player.moves.pushObject( move.index );
		var moves = self.get('moves');
		moves = ++moves;
		self.set('moves',moves);
		self.get('board').board[move.index] = Player.symbol;
		self.set('activePlayer', (Player._id) ? 0 : 1); // inverse of Player._id
		self.getTurn();
		self.get('board').update();

		// a player has won!
		var won = false;
		var wins = Player.moves.join(' ');
		self.get('board').wins.forEach(function(n){
			if(wins.includes(n[0]) && wins.includes(n[1]) && wins.includes(n[2])){
				won = true;
				self.set('_winPiece',n);
				return true;
			}
		});

		if(won){
			self.get('subscription').perform('final_result',{data:Player.symbol});
			self.gameOver(Player);
			return true;
		}

		//draw!
		if(self.get('moves') >= 9) self.gameOver(null)

		return true;
	},

	gameOver(Player){
		if (!Player) {
			this.get('subscription').perform('final_result',{data:'draw'});
			Ember.$('td.X, td.O', Ember.$('#game-container')).addClass('animated swing');
			this.set('restartBtnShow',true);
			this.set('status','It\'s a Draw!');
			return true;
		}
		this.set('status','Player '+ Player.symbol +' Wins!');
		Ember.set(this.get('score'), Player.symbol, this.get('score')[Player.symbol]+1)
		Ember.$('td.'+Player.symbol, Ember.$('#game-container')).addClass('animated bounce');
		this.set('restartBtnShow',true);
		this.set('over',true);
	},

	setScore(data) {
		Ember.set(this.get('score'), data.symbol, data.score);
	}
});

import Ember from 'ember';
import Board from '../custom-objects/board';
import Player from '../custom-objects/player';

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
    this.playerType = null,
    this.board = Board.create({board: ['','','','','','','','','']});
  },

  setPType(pType){
    this.set('currentPlayer',(pType == 'cross') ? 0 : 1);
    this.start();
  },

  start(){
    this.init();
    Ember.$('#game tr td').attr('class', '');
    this.getTurn();
    this.get('players').pushObject(Player.create({_id: 0,symbol:"X",moves:[]}));
    this.get('players').pushObject(Player.create({_id: 1, symbol: "O",moves:[]}));
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
    let move = row +' '+ col;
    this.get('subscription').perform('take_turn', {data:move});
    this.move(move);
  },

  getHovered() {
    if(this.get('activePlayer') !== this.get('currentPlayer')) return;
    if(this.get('over')) return;
    if(event.type == 'mouseover'){
      event.target.classList.add('hover-'+ this.activePlayer);
    }else{
      event.target.classList.remove('hover-'+ this.activePlayer);
    }
  },
    
  move(move){
    let self = this;
    let Player = self.get('players')[ self.get('activePlayer') ];
    let v = move.split(' ');
    let pos = Number(v[1]);
    if(v[0] == 1) pos = (pos+3);
    if(v[0] == 2) pos = (pos+6);
    move = {
      row: v[0],
      col: v[1],
      index: pos
    };
    if(self.get('board').board[move.index] != '') return false;
    Player.moves.pushObject( move.index );
    let moves = self.get('moves');
    moves = ++moves;
    self.set('moves',moves);
    self.get('board').board[move.index] = Player.symbol;
    self.set('activePlayer', (Player._id) ? 0 : 1); // inverse of Player._id
    self.getTurn();
    self.get('board').update();
    // a player has won!
    let won = false;
    let wins = Player.moves.join(' ');
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
    
    Ember.$('td.'+Player.symbol, Ember.$('#game-container')).addClass('animated rubberBand');
    this.set('restartBtnShow',true);
    this.set('over',true);
  },

  setScore(data) {
    Ember.set(this.get('score'), data.symbol, data.score);
  }
});

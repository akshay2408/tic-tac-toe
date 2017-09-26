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
    this.board = Board.create();    
    this.set('items', [
          {row: 0, col: 0, cls: '', symbol: ''}, {row: 0, col: 1, cls: '', symbol: ''},{row: 0, col: 2, cls: '', symbol: ''},
          {row: 1, col: 0, cls: '', symbol: ''}, {row: 1, col: 1, cls: '', symbol: ''}, {row: 1, col: 2, cls: '', symbol: ''}, 
          {row: 2, col: 0, cls: '', symbol: ''}, {row: 2, col: 1, cls: '', symbol: ''}, {row: 2, col: 2, cls: '', symbol: ''}]);
  },

  setPType(pType){
    this.set('currentPlayer', (pType == 'cross') ? 0 : 1);
    this.start();
  },

  start(){
    this.init();
    this.get('items').forEach((item) => Ember.set(item, 'cls', '')); 
    this.getTurn();
    this.get('players').pushObject(Player.create({_id: 0,symbol:"X",moves:[]}));
    this.get('players').pushObject(Player.create({_id: 1, symbol: "O",moves:[]}));
    this.get('board').update();
  },

  getTurn(){
    if(this.get('over')) return;
    if(this.get('activePlayer') === this.get('currentPlayer')) {
      this.set('status', 'Your turn');
    } else {
      this.set('status', 'Opponent\'s turn');
    }
  },

  getMarked(item){
    if(this.get('over')) return;
    if(this.get('activePlayer') !== this.get('currentPlayer')) return;
    this.clearHoverClass(item);
    this.get('subscription').perform('take_turn', {item: item });
    this.move(item);
  },

  getHovered(item) {
    if(this.get('activePlayer') !== this.get('currentPlayer')) return;
    if(this.get('over')) return;
    if(event.type == 'mouseover'){
      let cls = item.cls.concat(' hover-'+ this.activePlayer);
      this.clearHoverClass(item);
      Ember.set(item, 'cls', cls);
    }else{
      let cls = item.cls.replace(' hover-'+ this.activePlayer, '');
      Ember.set(item, 'cls', cls);
    }
  },
    
  clearHoverClass(item) {
    let self = this;
    this.get('items').forEach((itm) => {
      if(item != itm) {
        let cls = itm.cls.replace(' hover-'+ self.activePlayer, '');
        Ember.set(itm, 'cls', cls);
      }
    });
  },
  
  move(item){
    let Player = this.get('players')[ this.get('activePlayer') ];
    let pos = Number(item.col);
    if(item.row == 1) pos = (pos+3);
    if(item.row == 2) pos = (pos+6);
    if(item.symbol != '') return false;
    Player.moves.pushObject( pos );
    let moves = this.get('moves');
    moves = ++moves;
    this.set('moves',moves);
    Ember.set(item, 'symbol', Player.symbol);
    this.set('activePlayer', (Player._id) ? 0 : 1); // inverse of Player._id
    this.getTurn();
    this.get('board').update(item, Player.symbol);
    // a player has won!
    let won = false;
    let wins = Player.moves.join(' ');
    this.get('board').wins.forEach((n) => {
      if(wins.includes(n[0]) && wins.includes(n[1]) && wins.includes(n[2])){
        won = true;
        this.set('_winPiece',n);
        return true;
      }
    });

    if(won){
      this.get('subscription').perform('final_result',{data:Player.symbol});
      this.gameOver(Player);
      return true;
    }

    //draw!
    if(this.get('moves') >= 9) this.gameOver(null)

    return true;
  },

  gameOver(Player){
    if (!Player) {
      this.get('subscription').perform('final_result',{data:'draw'});
      this.get('items').forEach((item) => Ember.set(item, 'cls', item.cls.concat(' animated swing'))); 
      this.set('restartBtnShow', true);
      this.set('over', true);
      this.set('status', 'It\'s a Draw!');
      return true;
    }
    this.set('status', 'Player '+ Player.symbol +' Wins!');
    Ember.set(this.get('score'), Player.symbol, this.get('score')[Player.symbol]+1)
    
    this.get('items').forEach((item) => {
      if(item.symbol === Player.symbol)
        Ember.set(item, 'cls', item.cls.concat(' animated rubberBand'));
    }); 
    this.set('restartBtnShow', true);
    this.set('over', true);
  },

  setScore(data) {
    Ember.set(this.get('score'), data.symbol, data.score);
  }
});

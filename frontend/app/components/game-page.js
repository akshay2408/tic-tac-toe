import Ember from 'ember';

export default Ember.Component.extend({
  cableService: Ember.inject.service('cable'),
  gameService: Ember.inject.service('game'),
  status: Ember.computed.alias('gameService.status'),
  subscription: Ember.computed.alias('gameService.subscription'),
  newMatchBtnShow: Ember.computed.alias('gameService.newMatchBtnShow'),
  restartBtnShow: Ember.computed.alias('gameService.restartBtnShow'),
  items: Ember.computed.alias('gameService.items'),
  score: Ember.computed.alias('gameService.score'),
  
  setupConsumer: Ember.on('init', function() {
    let action = null;
    let consumer = this.get('cableService').createConsumer('ws://localhost:3000/cable');
    let self = this;
    const subscription = consumer.subscriptions.create("GameChannel", {
      connected() {
        if(!action)
        self.set('status','Waiting for an other player');
      },
      received(data) {
        action = data.action;
        switch(action) {
          case 'game_start':
            self.set('status','Player found.');
            self.get('gameService').setPType(data.msg);
            break;
          case 'take_turn':
            let item = self.get('items').find(itm => data.item.row === itm.row && data.item.col === itm.col);
            self.get('gameService').move(data.move, item);
            self.get('gameService').getTurn();
            break;
          case 'new_game':
            self.send('newGame');
            break;
          case 'total_win':
            self.get('gameService').setScore(data);
            break;
          case "opponent_withdraw":
            self.set('status','Opponent withdraw, You win!');
            self.set('newMatchBtnShow',true);
            break;
        }
      },
      disconnected() {
        Ember.debug("GameChannel#disconnected");
      }
    });
    this.set('subscription', subscription);
  }),

  actions: {
    newGame() {
      if (this.get('moves') < 1) return;
      this.set('restartBtnShow',false);
      this.get('gameService').start();
    },

    newMatch(){
      location.reload();
    },
    
    restartGame(){
      this.get('subscription').perform('new_game');
      this.send('newGame');
    },
  }
});

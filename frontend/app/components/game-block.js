import Ember from 'ember';

export default Ember.Component.extend({
  gameService: Ember.inject.service('game'),
  itemLoop: [0,3,6],
  items: Ember.computed.alias('gameService.items'),
});

import Ember from 'ember';

export function getAtIndex(params/*, hash*/) {
  return params;
}

export default Ember.Helper.extend({
  recomputeOnArrayChange: Ember.observer('_array.[]', function() {
    this.recompute();
  }),

  compute([array, index]) {
    this.set('_array', array);

    return array.objectAt(index);
  }
});

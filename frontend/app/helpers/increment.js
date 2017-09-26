import Ember from 'ember';

export function inc(params) {
  return params.reduce((a, b) => {
    return a + b;
  });
}

export default Ember.Helper.helper(inc);

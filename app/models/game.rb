class Game 

  def self.start(last_match)
    # Randomly choses who gets to be noughts or crosses
    cross, nought = [last_match.user, last_match.opponent].shuffle

    # Broadcast back to the players subscribed to the channel that the game has started
    ActionCable.server.broadcast "player_#{cross.id}", {action: "game_start", msg: "cross" }
    ActionCable.server.broadcast "player_#{nought.id}", {action: "game_start", msg: "nought" }
    last_match.symbol = last_match.user == cross ? 'X' : 'O'
    last_match.save
  end

  def self.withdraw(id)
    broadcast_according_player id, 'opponent_withdraw'
  end

  def self.take_turn id, move
    broadcast_according_player id, 'take_turn', move['data']
  end

  def self.new_game id
    broadcast_according_player id, 'new_game'
  end
  
  def self.final_result id, status
    match = Match.active.find_by user_id: id
    return unless match
    
    if status['data'] == 'draw'
      match.update_score 'total_draw'
    else
      column = status['data'] == match.symbol ? :total_win : :total_loss
      match.update_score column
    end
  end
  
  private
  
  def self.broadcast_according_player id, action, move = nil
    match = Match.active.by_user(id).first
    
    return unless match
    
    match.update_attributes active: false if action == 'opponent_withdraw'
    
    if match.user_id == id
      ActionCable.server.broadcast "player_#{match.opponent_id}", {action: action, move: move}
      match.update_score 'total_loss' if action == 'opponent_withdraw'
    elsif match.opponent_id == id
      ActionCable.server.broadcast "player_#{match.user_id}", {action: action, move: move}
      match.update_score 'total_win' if action == 'opponent_withdraw'
    end
  end
  
  def self.broadcast_score match
    ActionCable.server.broadcast "player_#{match.user_id}", {action: 'total_win', score: match.total_win, symbol: match.symbol}
    ActionCable.server.broadcast "player_#{match.opponent_id}", {action: 'total_win', score: match.total_loss, symbol: match.symbol == 'X' ? 'O' : 'X'}
  end
end

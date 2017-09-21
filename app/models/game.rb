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
    if match
      if status['data'] == match.symbol
        match.update_column :total_win, match.total_win + 1
      elsif status['data'] == 'draw'
        match.update_column :total_draw, match.total_draw + 1
      else
        match.update_column :total_loss, match.total_loss + 1
      end
    ActionCable.server.broadcast "player_#{match.user_id}", {action: 'total_win', score: match.total_win, symbol: match.symbol}
    ActionCable.server.broadcast "player_#{match.opponent_id}", {action: 'total_win', score: match.total_loss, symbol: match.symbol == 'X' ? 'O' : 'X'}
    end
  end
  
  private
  
  def self.broadcast_according_player id, action, move = nil
    match = Match.active.by_user(id).first
    
    match.update_column :active, false if action == 'opponent_withdraw'
    
    if match
      if match.user_id == id
        ActionCable.server.broadcast "player_#{match.opponent_id}", {action: action, move: move}
        if action == 'opponent_withdraw'
          match.update_column :total_loss, match.total_loss + 1
          ActionCable.server.broadcast "player_#{match.opponent_id}", {action: 'total_win', score: match.total_loss, symbol: match.symbol == 'X' ? 'O' : 'X'}
        end 
      elsif match.opponent_id == id
        ActionCable.server.broadcast "player_#{match.user_id}", {action: action, move: move}
        if action == 'opponent_withdraw'
          match.update_column :total_win, match.total_win + 1
          ActionCable.server.broadcast "player_#{match.user_id}", {action: 'total_win', score: match.total_win, symbol: match.symbol}
        end
      end
    end
  end
end
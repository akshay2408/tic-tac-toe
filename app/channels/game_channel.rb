class GameChannel < ApplicationCable::Channel
  def subscribed
     stream_from "player_#{id}"
     Match.add(id)
  end

  def unsubscribed
    Game.withdraw(id)
  end

  def take_turn(data)
    Game.take_turn(id, data)
  end

  def new_game()
    Game.new_game(id)
  end
  
  def final_result(data)
    Game.final_result(id, data)
  end
end
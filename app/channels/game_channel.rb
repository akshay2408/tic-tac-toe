# Be sure to restart your server when you modify this file. Action Cable runs in a loop that does not support auto reloading.
class GameChannel < ApplicationCable::Channel
  def subscribed
     stream_from "player_#{uuid}"
     Match.create(uuid)
  end

  def unsubscribed
    Game.withdraw(uuid)
    Match.remove(uuid)
  end

  def take_turn(data)
    # byebug
    Game.take_turn(uuid, data)
  end

  def new_game()
    Game.new_game(uuid)
  end
end
# Be sure to restart your server when you modify this file. Action Cable runs in a loop that does not support auto reloading.
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
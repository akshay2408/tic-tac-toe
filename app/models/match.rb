class Match < ApplicationRecord

  belongs_to :user
  belongs_to :opponent, foreign_key: :opponent_id, class_name: 'User', optional: true

  scope :active, -> { where(active: true) }
  scope :by_user, ->(user_id) { where(user_id: user_id).or(where(opponent_id: user_id)) }

  def self.add(id)
    last_match = self.active.where(opponent_id: nil).first
    if last_match.present?
      # Get the uuid of the player waiting
      last_match.opponent_id = id
      last_match.save
      Game.start last_match
    else
      self.create user_id: id
    end
  end
end
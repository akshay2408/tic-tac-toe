class Match < ApplicationRecord

  belongs_to :user
  belongs_to :opponent, foreign_key: :opponent_id, class_name: 'User', optional: true

  scope :active, -> { where(active: true) }
  scope :by_user, ->(user_id) { where(user_id: user_id).or(where(opponent_id: user_id)) }

  after_update :broadcast_score
  
  def self.add(id)
    last_match = self.active.where(opponent_id: nil).first
    if last_match.present?
      last_match.update_column :opponent_id, id
      Game.start last_match
    else
      self.create user_id: id
    end
  end
      
  def update_score column
    update_attributes column.to_sym => self[column] + 1
  end
  
  private
  
  def broadcast_score
    Game.broadcast_score self if total_win_changed? || total_loss_changed?
  end
  
end

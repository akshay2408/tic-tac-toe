class CreateMatches < ActiveRecord::Migration[5.0]
  def change
    create_table :matches do |t|
      t.integer :user_id
      t.integer :opponent_id
      t.integer :total_win, default: 0
      t.integer :total_loss, default: 0
      t.integer :total_draw, default: 0
      t.string :symbol
      t.boolean :active, default: true

      t.timestamps
    end
  end
end

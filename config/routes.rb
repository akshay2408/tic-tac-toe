Rails.application.routes.draw do
  mount ActionCable.server => "/cable"
  mount_ember_app :frontend, to: '/'
end

const scheduleRoutes = require('./schedule_routes');
module.exports = function(app, db) {
  scheduleRoutes(app, db);
};

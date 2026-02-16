import common from './common.json';
import auth from './auth.json';
import navigation from './navigation.json';
import events from './admin/events.json';
import users from './admin/users.json';
import settings from './admin/settings.json';
import athletes from './admin/athletes.json';
import leaderboards from './admin/leaderboards.json';

export default {
  common,
  auth,
  navigation,
  admin: {
    events,
    users,
    settings,
    athletes,
    leaderboards,
  },
};

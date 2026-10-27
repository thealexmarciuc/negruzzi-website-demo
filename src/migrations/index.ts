import * as migration_20261027_085350_initial from './20261027_085350_initial';
import * as migration_20261027_100037_content_model from './20261027_100037_content_model';

export const migrations = [
  {
    up: migration_20261027_085350_initial.up,
    down: migration_20261027_085350_initial.down,
    name: '20261027_085350_initial',
  },
  {
    up: migration_20261027_100037_content_model.up,
    down: migration_20261027_100037_content_model.down,
    name: '20261027_100037_content_model'
  },
];

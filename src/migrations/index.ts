import * as migration_20261027_085350_initial from './20261027_085350_initial';

export const migrations = [
  {
    up: migration_20261027_085350_initial.up,
    down: migration_20261027_085350_initial.down,
    name: '20261027_085350_initial'
  },
];

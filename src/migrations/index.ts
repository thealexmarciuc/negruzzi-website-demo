import * as migration_20261027_085350_initial from './20261027_085350_initial';
import * as migration_20261027_100037_content_model from './20261027_100037_content_model';
import * as migration_20261027_101101_media_single_size from './20261027_101101_media_single_size';
import * as migration_20261027_155842_nav_item_description from './20261027_155842_nav_item_description';
import * as migration_20261027_165524_page_templates_feed from './20261027_165524_page_templates_feed';
import * as migration_20261027_171837_messages_search from './20261027_171837_messages_search';

export const migrations = [
  {
    up: migration_20261027_085350_initial.up,
    down: migration_20261027_085350_initial.down,
    name: '20261027_085350_initial',
  },
  {
    up: migration_20261027_100037_content_model.up,
    down: migration_20261027_100037_content_model.down,
    name: '20261027_100037_content_model',
  },
  {
    up: migration_20261027_101101_media_single_size.up,
    down: migration_20261027_101101_media_single_size.down,
    name: '20261027_101101_media_single_size',
  },
  {
    up: migration_20261027_155842_nav_item_description.up,
    down: migration_20261027_155842_nav_item_description.down,
    name: '20261027_155842_nav_item_description',
  },
  {
    up: migration_20261027_165524_page_templates_feed.up,
    down: migration_20261027_165524_page_templates_feed.down,
    name: '20261027_165524_page_templates_feed',
  },
  {
    up: migration_20261027_171837_messages_search.up,
    down: migration_20261027_171837_messages_search.down,
    name: '20261027_171837_messages_search'
  },
];

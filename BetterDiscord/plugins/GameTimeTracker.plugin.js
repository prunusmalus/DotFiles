/**
 * @name GameTimeTracker
 * @version 1.3.0
 * @description Track time spent in games
 * @license MIT
 * @author Yentis
 * @authorId 68834122860077056
 * @website https://github.com/Yentis/betterdiscord-game-time-tracker
 * @source https://raw.githubusercontent.com/Yentis/betterdiscord-game-time-tracker/master/GameTimeTracker.plugin.js
 */
'use strict';

class PluginConstants {
  static PluginChangelog = [
    {
      title: 'Added',
      type: 'added',
      items: ['Add sort and search'],
    },
    {
      title: 'Fixed',
      type: 'fixed',
      items: ['Fix sending messages'],
    },
  ];

  static SettingsKey = 'settings';
  static CurrentVersionInfoKey = 'currentVersionInfo';

  static SortingType = {
    Name: {
      value: 'NAME',
      label: 'Name',
    },
    Playtime: {
      value: 'PLAYTIME',
      label: 'Playtime',
    },
    LastPlayed: {
      value: 'LAST_PLAYED',
      label: 'Last played',
    },
  };

  static SortingDirection = {
    Ascending: {
      value: 'ASCENDING',
      label: 'Ascending',
    },
    Descending: {
      value: 'DESCENDING',
      label: 'Descending',
    },
  };

  static DefaultSettings = {
    sortingType: PluginConstants.SortingType.LastPlayed.value,
    sortingDirection: PluginConstants.SortingDirection.Descending.value,
    games: {},
  };
}

class Utils {
  static humanReadablePlaytime(playtimeSeconds) {
    let seconds = playtimeSeconds;

    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;

    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  static getSortedGames(settings, search = '') {
    const games = Object.entries(settings.games).filter(([_, game]) => {
      return game.name.toLowerCase().includes(search.toLowerCase());
    });

    switch (settings.sortingType) {
      case PluginConstants.SortingType.Name.value: {
        games.sort(([_aKey, aGame], [_bKey, bGame]) => {
          return aGame.name.localeCompare(bGame.name);
        });

        break;
      }
      case PluginConstants.SortingType.LastPlayed.value: {
        games.sort(([_aKey, aGame], [_bKey, bGame]) => {
          return (aGame.lastPlayed ?? 0) - (bGame.lastPlayed ?? 0);
        });

        break;
      }
      case PluginConstants.SortingType.Playtime.value: {
        games.sort(([_aKey, aGame], [_bKey, bGame]) => {
          return aGame.playtimeSeconds - bGame.playtimeSeconds;
        });

        break;
      }
    }

    if (settings.sortingDirection === PluginConstants.SortingDirection.Descending.value) {
      games.reverse();
    }

    return games;
  }
}

class BaseService {
  plugin;
  bdApi;
  logger;

  constructor(plugin) {
    this.plugin = plugin;
    this.bdApi = this.plugin.bdApi;
    this.logger = this.bdApi.Logger;
  }
}

class SettingsService extends BaseService {
  static TRASH_ICON =
    '<svg class="" fill="#FFFFFF" viewBox="0 0 24 24" ' +
    'style="width: 20px; height: 20px;"><path fill="none" d="M0 0h24v24H0V0z"></path>' +
    '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.' +
    '12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.1' +
    '2zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"></path><path fill="none" d="M0 0h24v24H0z"></path></svg>';

  settings = PluginConstants.DefaultSettings;

  start() {
    const savedSettings = this.bdApi.Data.load(PluginConstants.SettingsKey);
    this.settings = Object.assign({}, PluginConstants.DefaultSettings, savedSettings);

    return Promise.resolve();
  }

  getSettingsElement() {
    const { React, UI } = this.bdApi;

    return React.createElement(() => {
      const [search, setSearch] = React.useState('');
      const [, forceUpdate] = React.useState({});
      const refresh = () => forceUpdate({});
      const settings = [];

      const sortingType = {
        id: 'sortingType',
        name: 'Sort by',
        type: 'dropdown',
        value: this.settings.sortingType,
        options: Object.values(PluginConstants.SortingType).map((type) => {
          return {
            label: type.label,
            value: type.value,
          };
        }),
        onChange: (value) => {
          this.settings.sortingType = value;
          refresh();
        },
      };
      settings.push(sortingType);

      const sortingDirection = {
        id: 'sortingDirection',
        name: 'Sort direction',
        type: 'dropdown',
        value: this.settings.sortingDirection,
        options: Object.values(PluginConstants.SortingDirection).map((direction) => {
          return {
            label: direction.label,
            value: direction.value,
          };
        }),
        onChange: (value) => {
          this.settings.sortingDirection = value;
          refresh();
        },
      };
      settings.push(sortingDirection);

      const searchSetting = {
        id: 'search',
        name: 'Search',
        type: 'text',
        value: search,
        onChange: (value) => setSearch(value),
      };
      settings.push(searchSetting);

      Utils.getSortedGames(this.settings, search).forEach(([id, game]) => {
        const elementId = `GTT-Game-${id}`;
        const deleteButton = React.createElement('button', {
          id: elementId,
          className: 'bd-button bd-button-filled bd-button-color-red',
          dangerouslySetInnerHTML: { __html: SettingsService.TRASH_ICON },
          onClick: () => {
            delete this.settings.games[id];
            this.bdApi.Data.save(PluginConstants.SettingsKey, this.settings);

            refresh();
          },
        });

        const settingItem = {
          id: elementId,
          name: game.name,
          note: Utils.humanReadablePlaytime(game.playtimeSeconds),
          children: [deleteButton],
          type: 'custom',
          value: undefined,
        };

        settings.push(settingItem);
      });

      if (settings.length <= 0) {
        const setting = {
          id: 'noGames',
          name: 'No games found',
          note: 'Go play some!',
          children: [],
          type: 'custom',
          value: undefined,
        };

        settings.push(setting);
      }

      return UI.buildSettingsPanel({
        settings,
        onChange: () => {
          this.bdApi.Data.save(PluginConstants.SettingsKey, this.settings);
        },
      });
    });
  }

  stop() {
    // Do nothing
  }
}

class ModulesService extends BaseService {
  dispatcher;
  messageModule;
  selectedChannelStore;

  start() {
    this.dispatcher = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byKeys('dispatch', 'subscribe'), {
      searchExports: true,
    });

    this.messageModule = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byKeys('sendMessage', 'sendBotMessage'));
    this.selectedChannelStore = this.bdApi.Webpack.Stores.SelectedChannelStore;

    Object.entries(this).forEach(([key, value]) => {
      if (value !== undefined) return;
      this.logger.error(`${key} not found!`);
    });

    return Promise.resolve();
  }

  stop() {
    // Do nothing
  }
}

class GameService extends BaseService {
  modulesService;
  settingsService;

  gameStartTimes = {};

  onRunningGamesChange = (event) => {
    if (event === undefined) return;
    this.logger.debug('Games changed:', event);

    const data = event;

    if (data.added.length > 0) {
      data.added.forEach((game) => {
        this.gameStartTimes[game.exeName] = game.start ?? new Date().getTime();
      });
    }

    if (data.removed.length <= 0) {
      return;
    }

    const games = this.settingsService.settings.games;
    data.removed.forEach((game) => {
      const startTime = game.start ?? this.gameStartTimes[game.exeName];
      if (startTime === undefined) {
        this.logger.warn(`Game ${game.name} closed but start time is unknown`);
        return;
      }

      const id = game.exeName;
      const playtimeSeconds = Math.max(0, (new Date().getTime() - startTime) / 1000);
      this.logger.info(`Played ${game.name} for ${playtimeSeconds} seconds`);

      const trackedGame = games[id] ?? { name: game.name, playtimeSeconds: 0 };
      trackedGame.name = game.name;
      trackedGame.playtimeSeconds += Math.round(playtimeSeconds);
      trackedGame.lastPlayed = Date.now();
      games[id] = trackedGame;
    });

    this.bdApi.Data.save(PluginConstants.SettingsKey, this.settingsService.settings);
  };

  start(modulesService, settingsService) {
    this.modulesService = modulesService;
    this.settingsService = settingsService;

    modulesService.dispatcher.subscribe('RUNNING_GAMES_CHANGE', this.onRunningGamesChange);

    return Promise.resolve();
  }

  stop() {
    this.modulesService.dispatcher.unsubscribe('RUNNING_GAMES_CHANGE', this.onRunningGamesChange);
  }
}

class CommandsService extends BaseService {
  start(modulesService, settingsService) {
    const options = [
      {
        name: 'type',
        description: 'How the summary should be sent',
        required: true,
        type: this.bdApi.Commands.Types.OptionTypes.STRING.valueOf(),
        choices: [
          {
            name: 'clipboard',
            value: 'clipboard',
          },
          {
            name: 'message',
            value: 'message',
          },
          {
            name: 'clyde',
            value: 'clyde',
          },
        ],
      },
      {
        name: 'sort',
        description: 'How the games should be sorted',
        required: false,
        type: this.bdApi.Commands.Types.OptionTypes.STRING.valueOf(),
        choices: Object.values(PluginConstants.SortingType).map((type) => {
          return {
            name: type.label,
            value: type.value,
          };
        }),
      },
      {
        name: 'direction',
        description: 'In what direction the games should be sorted',
        required: false,
        type: this.bdApi.Commands.Types.OptionTypes.STRING.valueOf(),
        choices: Object.values(PluginConstants.SortingDirection).map((direction) => {
          return {
            name: direction.label,
            value: direction.value,
          };
        }),
      },
      {
        name: 'search',
        description: 'Filter games by name',
        required: false,
        type: this.bdApi.Commands.Types.OptionTypes.STRING.valueOf(),
      },
    ];

    const command = {
      id: 'PlayTimeSummary',
      name: 'playtimesummary',
      description: 'Send GameTimeTracker playtime summary',
      options,
      execute: (event) => {
        try {
          const channelId = modulesService.selectedChannelStore.getCurrentlySelectedChannelId() ?? '';
          if (!channelId) return;

          const settings = settingsService.settings;
          const options = {
            type: 'message',
            sort: settings.sortingType,
            direction: settings.sortingDirection,
            search: '',
          };

          event.forEach((option) => {
            const value = option.value?.trim() ?? '';
            if (value === '') return;

            options[option.name] = value;
          });

          const games = Utils.getSortedGames(
            {
              ...settings,
              sortingType: options.sort,
              sortingDirection: options.direction,
            },
            options.search
          ).map(([_, game]) => game);

          games.push({
            name: '---------\nTotal',
            playtimeSeconds: games.reduce((partialSum, game) => partialSum + game.playtimeSeconds, 0),
          });

          const content = games
            .map((game) => `${game.name} - ${Utils.humanReadablePlaytime(game.playtimeSeconds)}`)
            .join('\n');

          if (options.type === 'message') {
            modulesService.messageModule.sendMessage(channelId, {
              content,
              invalidEmojis: [],
              tts: false,
              validNonShortcutEmojis: [],
            });
          } else if (options.type === 'clipboard') {
            DiscordNative.clipboard.copy(content);
          } else if (options.type === 'clyde') {
            modulesService.messageModule.sendBotMessage(channelId, content);
          }
        } catch (error) {
          this.logger.error(error);
        }
      },
    };

    this.bdApi.Commands.register(command);

    return Promise.resolve();
  }

  stop() {
    this.bdApi.Commands.unregisterAll();
  }
}

class GameTimeTrackerPlugin {
  settingsService;
  modulesService;
  commandsService;
  gameService;

  meta;
  bdApi;
  logger;

  constructor(meta) {
    this.meta = meta;
    this.bdApi = new BdApi(this.meta.name);
    this.logger = this.bdApi.Logger;
  }

  start() {
    this.doStart().catch((error) => {
      this.logger.error(error);
    });
  }

  async doStart() {
    this.showChangelogIfNeeded();
    await this.startServices();
  }

  showChangelogIfNeeded() {
    const currentVersionInfo = this.bdApi.Data.load(PluginConstants.CurrentVersionInfoKey) ?? {};
    const UI = this.bdApi.UI;

    if (currentVersionInfo.hasShownChangelog !== true || currentVersionInfo.version !== this.meta.version) {
      UI.showChangelogModal({
        title: `${this.meta.name} Changelog`,
        changes: PluginConstants.PluginChangelog,
        subtitle: '',
      });

      const newVersionInfo = {
        version: this.meta.version,
        hasShownChangelog: true,
      };

      this.bdApi.Data.save(PluginConstants.CurrentVersionInfoKey, newVersionInfo);
    }
  }

  async startServices() {
    this.settingsService = new SettingsService(this);
    await this.settingsService.start();

    this.modulesService = new ModulesService(this);
    await this.modulesService.start();

    this.commandsService = new CommandsService(this);
    await this.commandsService.start(this.modulesService, this.settingsService);

    this.gameService = new GameService(this);
    await this.gameService.start(this.modulesService, this.settingsService);
  }

  getSettingsPanel() {
    return this.settingsService?.getSettingsElement() ?? BdApi.React.createElement('div');
  }

  stop() {
    this.gameService?.stop();
    this.gameService = undefined;

    this.commandsService?.stop();
    this.commandsService = undefined;

    this.modulesService?.stop();
    this.modulesService = undefined;

    this.settingsService?.stop();
    this.settingsService = undefined;
  }
}

module.exports = GameTimeTrackerPlugin;

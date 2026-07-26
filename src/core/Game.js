import { EventBus } from './EventBus.js';
import { Router } from './Router.js';
import { Config } from './Config.js';
import { Logger } from '@utils/logger.js';

import { AccountManager } from '@modules/account/AccountManager.js';
import { GameDataManager } from '@modules/account/GameDataManager.js';
import { ScoreManager } from '@modules/gameplay/ScoreManager.js';
import { AutoMiningManager } from '@modules/gameplay/AutoMiningManager.js';
import { SoundManager } from '@modules/gameplay/SoundManager.js';
import { LeaderboardManager } from '@modules/leaderboard/LeaderboardManager.js';
import { MailManager } from '@modules/mail/MailManager.js';

import { Header } from '@ui/layout/Header.js';
import { BottomNav } from '@ui/layout/BottomNav.js';
import { ScreenManager } from '@ui/ScreenManager.js';
import { showPopup } from '@ui/components/Popup.js';

import { SplashScreen } from '@screens/SplashScreen.js';
import { LandingScreen } from '@screens/LandingScreen.js';
import { HomeScreen } from '@screens/HomeScreen.js';
import { ShopScreen } from '@screens/ShopScreen.js';
import { LeaderboardScreen } from '@screens/LeaderboardScreen.js';
import { MailScreen } from '@screens/MailScreen.js';
import { ProfileScreen } from '@screens/ProfileScreen.js';
import { SettingsScreen } from '@screens/SettingsScreen.js';

/**
 * Game — Core game controller with all systems.
 */
export class Game {
  constructor() {
    this.events = new EventBus();
    this.router = new Router(this.events);
    this.config = Config;

    // Managers
    this.accountManager = new AccountManager(this.events);
    this.gameDataManager = new GameDataManager(this.events, this.accountManager);
    this.scoreManager = new ScoreManager(this.events, this.gameDataManager);
    this.autoMiningManager = new AutoMiningManager(this.events, this.gameDataManager);
    this.soundManager = new SoundManager(this.events);
    this.leaderboardManager = new LeaderboardManager(this.events, this.gameDataManager, this.accountManager);
    this.mailManager = new MailManager(this.events, this.gameDataManager, this.accountManager);

    // UI
    this.header = null;
    this.bottomNav = null;
    this.screenManager = null;

    this._running = false;
    this._account = null;
  }

  init() {
    Logger.info('Game', 'Initializing ' + this.config.APP.NAME + ' v' + this.config.APP.VERSION);
    const app = document.getElementById('app');
    app.innerHTML = '';

    const splash = new SplashScreen(this.events);
    this.events.on('splash:complete', () => this._checkAndRoute(app));
    this.events.on('landing:start', ({ username }) => this._handleRegister(app, username));
    this.events.on('account:logout', () => { this._account = null; this._showLanding(app); });

    splash.show(app);
    this._running = true;
    return this;
  }

  _checkAndRoute(app) {
    const { hasAccount, account } = this.accountManager.checkSession();
    if (hasAccount && account) {
      this._account = account;
      this._initManagers();
      this._startGame(app);
    } else {
      this._showLanding(app);
    }
  }

  _showLanding(app) {
    app.innerHTML = '';
    const landing = new LandingScreen(this.events);
    landing.show(app);
  }

  _handleRegister(app, username) {
    const result = this.accountManager.register(username);
    if (!result.success) { showPopup(result.error, 'error'); return; }
    this._account = result.account;
    this._initManagers();
    this._startGame(app);
  }

  _initManagers() {
    this.gameDataManager.init();
    this.scoreManager.init();
    this.autoMiningManager.init();
    this.leaderboardManager.init();
    this.mailManager.init();
    this.soundManager.init();
  }

  _startGame(app) {
    app.innerHTML = '';

    this.header = new Header(app);
    this.header.render();
    this.header.updateDiamonds(this.gameDataManager.getDiamonds());
    this.header.updateMailCount(this.mailManager.getUnreadCount());

    this.screenManager = new ScreenManager(app, this.events);
    this.screenManager.init();

    this.bottomNav = new BottomNav(app, this.events);
    this.bottomNav.render();

    const home = new HomeScreen(this.events);
    const shop = new ShopScreen(this.events);
    const leaderboard = new LeaderboardScreen(this.events);
    const mail = new MailScreen(this.events);
    const profile = new ProfileScreen(this.events);
    const settings = new SettingsScreen(this.events);

    this.screenManager.register('home', home);
    this.screenManager.register('shop', shop);
    this.screenManager.register('leaderboard', leaderboard);
    this.screenManager.register('mail', mail);
    this.screenManager.register('profile', profile);
    this.screenManager.register('settings', settings);

    this.router.init(this.config.ROUTES);

    // ═══ NAV ═══
    this.events.on('nav:change', (path) => this.router.navigate(path));
    this.events.on('route:change', ({ to }) => {
      this.bottomNav.setActive(to.path);
      if (to.name === 'profile') this._updateProfile(profile);
      if (to.name === 'shop') shop.updateDiamonds(this.gameDataManager.getDiamonds());
      if (to.name === 'leaderboard') this._refreshLeaderboard(leaderboard);
      if (to.name === 'mail') this._refreshMail(mail);
    });

    // ═══ GAMEPLAY ═══
    this.events.on('game:tap', () => {
      const result = this.scoreManager.processTap();
      if (result.success) this.soundManager.playTap();
    });

    this.events.on('game:tapProcessed', ({ score }) => {
      home.updateScore(score);
      this.header.updateRank(this.scoreManager.getRank());
      this.leaderboardManager.updateScore(score);
    });

    this.events.on('gamedata:scoreChange', ({ score }) => home.updateScore(score));
    this.events.on('gamedata:diamondChange', ({ diamonds }) => {
      this.header.updateDiamonds(diamonds);
      this._refreshAutoMiningUI(home);
    });

    // ═══ AUTO MINING ═══
    this._setupAutoMiningUI(home);
    this.events.on('autoMining:activate', ({ package: pkg }) => {
      showPopup(pkg.label + ' activated! ⛏️', 'success');
      this.soundManager.playReward();
      home.showMiningActive(this.autoMiningManager.getStatus());
    });
    this.events.on('autoMining:tick', ({ remainingMs, remainingFormatted, score }) => {
      home.updateMiningTick(remainingMs, remainingFormatted);
      home.updateMiningTotalScore(score);
      this.leaderboardManager.updateScore(score);
    });
    this.events.on('autoMining:expire', () => {
      showPopup('Auto Mining finished!', 'info');
      this.soundManager.playClick();
      home.hideMiningActive();
      this._refreshAutoMiningUI(home);
    });
    this.events.on('autoMining:resume', (status) => home.showMiningActive(status));

    // ═══ LEADERBOARD ═══
    this.events.on('leaderboard:requestUpdate', () => this._refreshLeaderboard(leaderboard));
    this.events.on('leaderboard:update', () => this._refreshLeaderboard(leaderboard));

    // ═══ MAIL ═══
    this.events.on('mail:new', () => {
      this.header.updateMailCount(this.mailManager.getUnreadCount());
    });

    this.events.on('mail:claimRequest', ({ mailId }) => {
      const result = this.mailManager.claimReward(mailId);
      if (result.success) {
        showPopup('+' + result.reward + ' Diamond claimed!', 'success');
        this.soundManager.playReward();
        this._refreshMail(mail);
      } else {
        showPopup(result.error, 'error');
        this.soundManager.playError();
      }
    });

    this.events.on('mail:claim', () => {
      this.header.updateMailCount(this.mailManager.getUnreadCount());
    });

    // ═══ SETTINGS ═══
    this.events.on('settings:logout', () => this.accountManager.logout());
    this.events.on('settings:soundToggle', (enabled) => this.soundManager.setEnabled(enabled));

    // Init
    home.updateScore(this.scoreManager.getScore());
    this._updateProfile(profile);
    this._refreshLeaderboard(leaderboard);
    this._refreshMail(mail);

    Logger.info('Game', 'Game started — Welcome ' + this._account.username);
  }

  _refreshLeaderboard(screen) {
    ['daily', 'weekly', 'monthly'].forEach((period) => {
      const board = this.leaderboardManager.getBoard(period);
      const countdown = this.leaderboardManager.getCountdown(period);
      screen.updateBoard({ period, board, countdown });
    });
  }

  _refreshMail(screen) {
    const mails = this.mailManager.getMails();
    screen.updateMails(mails);
  }

  _setupAutoMiningUI(home) {
    const status = this.autoMiningManager.getStatus();
    const packages = this.autoMiningManager.getPackages();
    if (status.active) {
      home.showMiningActive(status);
    } else {
      home.showMiningPackages(packages,
        (key) => this.gameDataManager.canAfford(packages.find((p) => p.key === key)?.price || Infinity),
        (key) => {
          const result = this.autoMiningManager.activate(key);
          if (!result.success) { showPopup(result.error, 'error'); this.soundManager.playError(); }
        }
      );
    }
  }

  _refreshAutoMiningUI(home) {
    const status = this.autoMiningManager.getStatus();
    if (!status.active) {
      const packages = this.autoMiningManager.getPackages();
      home.showMiningPackages(packages,
        (key) => this.gameDataManager.canAfford(packages.find((p) => p.key === key)?.price || Infinity),
        (key) => {
          const result = this.autoMiningManager.activate(key);
          if (!result.success) { showPopup(result.error, 'error'); this.soundManager.playError(); }
        }
      );
    }
  }

  _updateProfile(screen) {
    if (!this._account) return;
    screen.update({
      username: this._account.username,
      score: this.scoreManager.getScore(),
      taps: this.scoreManager.getTotalTaps(),
      diamonds: this.gameDataManager.getDiamonds(),
      joinDate: this._account.createdAt,
      playerId: this._account.id,
    });
  }

  getState() {
    return {
      account: this._account,
      score: this.scoreManager.getScore(),
      diamonds: this.gameDataManager.getDiamonds(),
      taps: this.scoreManager.getTotalTaps(),
      rank: this.scoreManager.getRank(),
      autoMining: this.autoMiningManager.getStatus(),
      mails: this.mailManager.getMails().length,
      unreadMails: this.mailManager.getUnreadCount(),
    };
  }

  destroy() {
    this._running = false;
    this.router.destroy();
    this.header?.destroy();
    this.bottomNav?.destroy();
    this.screenManager?.destroy();
    this.autoMiningManager?.destroy();
    this.leaderboardManager?.destroy();
    this.mailManager?.destroy();
    this.soundManager?.destroy();
    this.events.clear();
    Logger.info('Game', 'Game destroyed');
  }
}

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var videojs$1 = _interopDefault(require('video.js'));

var version = "0.0.0";

var IDs = {
  myBlackbird: 'myBlackbird',
  filters: 'bbFilters',
  controls: 'bbControls',
  // size: 'bbSize',
  sendEmail: 'sendEmail',
  copyLog: 'copyLog',
  slider: 'slider',
  buttonBar: 'buttonBar',
  log: 'myBlackbird',
  btnToggleLog: 'btnToggleLog',
  btnToggleSlider: 'btnToggleSlider',
  btnTogglePlayerSettings: 'btnTogglePlayerSettings',
  btnToggleAdSettings: 'btnToggleAdSettings',
  btnTogglePlaybackInfo: 'btnTogglePlaybackInfo',
  btnToggleDebuggerSettings: 'btnToggleDebuggerSettings',
  classesList: 'classesList',
  playerSettings: 'playerSettings',
  playbackInfo: 'playbackInfo',
  debuggerSettings: 'debuggerSettings',
  btnToggleClassList: 'btnToggleClassList',
  // bigPlayButtonStyles: 'bigPlayButtonStyles',
  // posterStyles: 'posterStyles',
  logTable: 'logTable',
  logList: 'logList',
  logJSON: 'logJSON',
  mediaSettings: 'mediaSettings',
  adSettings: 'adSettings'
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

/**
 * @file debugger-pane.js
 */
var dom$1 = videojs$1.dom || videojs$1;

/**
 * Base class to add Panes to the Debugger Window
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends Component
 * @class DebuggerPane
 */

var DebuggerPane = function (_videojs$getComponent) {
  inherits(DebuggerPane, _videojs$getComponent);

  function DebuggerPane(player, options) {
    var _ret;

    classCallCheck(this, DebuggerPane);

    // this.content(this.options_.content);

    var _this = possibleConstructorReturn(this, _videojs$getComponent.call(this, player, options));

    _this.el_ = dom$1.createEl('div', {
      'id': _this.options_.id
    });

    _this.headerEl_ = dom$1.createEl('div', { 'className': 'header' });
    _this.headerEl_.innerHTML = '<h2>' + _this.options_.name + '</h2>';
    _this.el_.appendChild(_this.headerEl_);

    _this.contentEl_ = dom$1.createEl('div', { 'className': 'main' });
    _this.contentEl_.innerHTML = _this.options_.content;
    _this.el_.appendChild(_this.contentEl_);

    _this.footerEl_ = dom$1.createEl('div', { 'className': 'footer' });
    _this.el_.appendChild(_this.footerEl_);
    return _ret = _this, possibleConstructorReturn(_this, _ret);
  }

  DebuggerPane.prototype.content = function content(value) {
    if (typeof value !== 'undefined') {
      this.contentEl_.innerHTML = value;
    }
    return this.contentEl_.innerHTML;
  };

  return DebuggerPane;
}(videojs$1.getComponent('Component'));

videojs$1.registerComponent('DebuggerPane', DebuggerPane);

var _options$2 = void 0;
var logEvents = [];
var cache = [];
var emailArray = [];
var currentEvent$1 = void 0;
var log = void 0;
var logContainer = void 0;
var frogger = void 0;
var outputList = void 0;
var messageTypes = {
  // order of these properties imply render order of filter controls
  player: true,
  loading: true,
  ads: true,
  console: true,
  other: true
};
var _player = void 0;
var timeString = function timeString() {
  var d = new Date();
  var timestamp = d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + (_options$2.logMilliseconds ? ':' + d.getMilliseconds() : '');
  return timestamp;
};

var clickSendEmail = function clickSendEmail(evt) {
  var el = void 0;
  if (!evt) {
    evt = window.event;
  }
  el = evt.target ? evt.target : evt.srcElement;
  window.open('mailto:email@example.com?subject=Brightcove Player Debugger Log&body=' + encodeURIComponent(emailArray.join('\n')));
};
var clickCopyLog = function clickCopyLog(e) {
  // find target element
  var a = document.createElement('input');
  a.value = document.getElementsByClassName('main')[0].innerHTML;
  a.value += document.getElementsByClassName('main')[1].innerHTML;
  a.value += document.getElementsByClassName('main')[2].innerHTML;
  if (document.getElementsByClassName('main')[3]) {
    a.value += document.getElementsByClassName('main')[3].innerHTML;
  }

  // is element selectable?
  if (a) {
    // select text
    var logPane = document.getElementById('myBlackbird');
    logPane.appendChild(a);
    a.select();
    try {
      // copy text
      document.execCommand('copy');
      inp.blur();
    } catch (err) {
      alert('please press Ctrl/Cmd+C to copy');
    }
    a.remove();
  }
};

var hide = function hide() {
  // frogger.style.display = 'none';
  var logPane = document.getElementById('myBlackbird');
  var btnToggleLog = document.getElementById(IDs.btnToggleLog);

  btnToggleLog.classList.toggle('active');
  logPane.classList.toggle('activePane');
};

var scrollToBottom = function scrollToBottom() {
  // scroll list output to the bottom
  outputList.scrollTop = outputList.scrollHeight;
};

var clickFilter = function clickFilter(evt) {
  // show/hide a specific message type
  var entry = void 0,
      span = void 0,
      type = void 0,
      filters = void 0,
      active = void 0,
      oneActiveFilter = void 0,
      i = void 0,
      spanType = void 0,
      disabledTypes = void 0;

  if (!evt) {
    evt = window.event;
  }
  span = evt.target ? evt.target : evt.srcElement;

  if (span && span.tagName == 'SPAN') {

    type = span.getAttributeNode('type').nodeValue;

    if (evt.altKey) {
      filters = document.getElementById(IDs.filters).getElementsByTagName('SPAN');

      active = 0;
      for (entry in messageTypes) {
        if (messageTypes[entry]) active++;
      }
      oneActiveFilter = active == 1 && messageTypes[type];

      for (i = 0; filters[i]; i++) {
        spanType = filters[i].getAttributeNode('type').nodeValue;

        filters[i].className = 'fa ' + spanType + (oneActiveFilter || spanType == type ? '' : ' disabled');
        messageTypes[spanType] = oneActiveFilter || spanType == type;
      }
    } else {
      messageTypes[type] = !messageTypes[type];
      span.className = 'fa ' + type + (messageTypes[type] ? '' : ' disabled');
    }

    // build outputList's class from messageTypes object
    disabledTypes = [];
    for (type in messageTypes) {
      if (!messageTypes[type]) {
        disabledTypes.push(type);
      }
    }
    disabledTypes.push('');
    outputList.className = disabledTypes.join('Hidden ');

    scrollToBottom();
  }
};

var myConsole = function myConsole() {

  var console = window.console;
  var messagestr = '';

  if (!console) return;

  function intercept(method) {
    var original = console[method];

    console[method] = function () {

      var logHTML = void 0;
      var timestr = timeString();

      // capture console messages to log div on page
      if (original.apply) {

        // if the message is an object, concatenate
        if ((typeof arguments === 'undefined' ? 'undefined' : _typeof(arguments)) == 'object') {
          var _message = Array.prototype.slice.apply(arguments).join(' ');
          messagestr = '';
          for (var q = 0; q < arguments.length; q++) {
            if (typeof arguments[q] == 'string') {
              messagestr += arguments[q] + ' ';
            }
          }
          currentEvent$1 = messagestr;
        } else {
          // else just log out the string to the div
          messagestr = message;
        }
        myAddMessage('debug', timestr, 'console', messagestr, '', '');
        // log object to console.log as intended
        original.apply(console, arguments);
      } else {
        // needed for IE since apply does not work there
        var _message2 = Array.prototype.slice.apply(arguments).join(' ');
        original(_message2);
        myAddMessage('debug', timestr, 'console', _message2, '', '');
      }
    };
  }
  var methods = ['log', 'warn', 'error', 'VIDEOJS:'];
  for (var i = 0; i < methods.length; i++) {
    intercept(methods[i]);
  }
};

var myAddMessage = function myAddMessage(level, timeStr, type, eventType, content, playerclasses) {
  // adds a message to the output list
  var innerContent = void 0,
      allContent = void 0,
      newMsg = void 0;
  var fragment = document.createDocumentFragment();

  // push new event array onto log array
  logEvents.push([level, timeStr, type, content]);

  content = content.constructor == Array ? content.join('') : content;

  switch (_options$2.logType) {
    case 'table':
      var row = void 0,
          col1 = void 0,
          col2 = void 0,
          col3 = void 0,
          col4 = void 0,
          col5 = void 0,
          col6 = void 0;
      row = document.createElement('tr');
      row.setAttribute('class', type);
      fragment.appendChild(row);

      col1 = document.createElement('td');
      /* col1.setAttribute('class', 'fa ' +  level);*/
      col1.setAttribute('title', level);
      col1.innerText = level;
      row.appendChild(col1);

      col2 = document.createElement('td');
      col2.setAttribute('class', 'timestamp');
      col2.innerText = timeStr;
      row.appendChild(col2);

      col3 = document.createElement('td');
      col3.setAttribute('class', 'messageType');
      col3.innerText = type;
      row.appendChild(col3);

      col4 = document.createElement('td');
      col4.setAttribute('class', 'eventType');
      col4.innerText = eventType;
      row.appendChild(col4);

      col5 = document.createElement('td');
      col5.setAttribute('class', 'message');
      col5.innerHTML = content;
      row.appendChild(col5);

      if (_options$2.logClasses) {
        col6 = document.createElement('td');
        col6.setAttribute('class', 'playerclasses');
        col6.innerText = playerclasses;
        row.appendChild(col6);
      }
      break;
    case 'list':
      var listItem = document.createElement('li'),
          _innerContent = void 0,
          span = void 0;
      listItem.setAttribute('class', type);
      fragment.appendChild(listItem);

      span = document.createElement('span');
      span.setAttribute('class', 'fa ' + type);
      span.setAttribute('title', level);
      listItem.appendChild(span);

      _innerContent = '[' + level + '] ' + timeStr + ' ' + type + ' ' + eventType;
      if (content) {
        _innerContent += '<br>' + content;
      }

      if (type === 'player' && _options$2.logClasses && playerclasses != '') {
        _innerContent += '<br>[CLASSES] ' + playerclasses;
      }
      listItem.innerHTML += _innerContent;
      break;
  }

  allContent = fragment.innerHTML;

  if (outputList) {
    outputList.appendChild(fragment);
    scrollToBottom();
  } else {
    cache.push(allContent);
  }
  emailArray.push([timeStr, ' ', type, ': ', content].join(''));
};

var getHeaderStr = function getHeaderStr(player) {
  var type = void 0,
      spans = [],
      headerStr = void 0;

  for (type in messageTypes) {
    spans.push(['<span class="fa ', type, '" type="', type, '" title="Hide ', type, ' messages"></span>'].join(''));
  }

  headerStr = ['<div class="left">', '<div id="', IDs.filters, '" class="filters">', spans.join(''), '</div>', '</div>', '<h2>Brightcove Player Debug Log</h2>', '<div class="right">', '<div id="', IDs.controls, '" class="controls">', '<span class="fa fa-clipboard" id="', IDs.copyLog, '" title="Copy log to Clipboard" op="copy"></span>', '<span class="fa email" id="', IDs.sendEmail, '" title="Send log via email" op="email"></span>', '<span id="', IDs.size, '" title="contract" op="resize"></span>', '<span class="fa clear" title="Clear Log Messages" op="clear"></span>', '<span class="fa close" title="Hide Log" op="close"></span>', '</div>', '</div>'].join('');

  return headerStr;
};

var myGenerateMarkup = function myGenerateMarkup(obj) {

  // build markup
  var type = void 0,
      rows = [],
      strInnerHTML = '';

  switch (obj) {
    case 'table':
      var col = '';
      logContainer = 'tbody';
      if (_options$2.logClasses) {
        col = '<th>Player Classes</th>';
      }
      strInnerHTML = ['<table id="', IDs.logTable, '">', '<caption>Brightcove Player Debug Log</caption>', '<thead><tr>', '<th class="hdrLevel">Level</th><th class="hdrTime">TimeStamp</th><th class="hdrType">Type</th><th class="hdrEvent">Event</th><th class="hdrMsg">Message</th>', col, '</tr></thead>', '<tbody>', cache.join(''), '</tbody>', '</table>'].join('');
      break;
    case 'list':
      logContainer = 'ol';
      strInnerHTML = ['<ol id="', IDs.logList, '">', cache.join(''), '</ol>'].join('');
      break;
    case 'json':
      logContainer = 'json';
      strInnerHTML = ['<ol>', cache.join(''), '</ol>'].join('');
      break;
  }
  strInnerHTML += '</div>';

  return strInnerHTML;
};

var getClassesStr$1 = function getClassesStr(obj) {
  if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) == 'object') {
    var logClassesStr = Array.prototype.slice.apply(obj).join(' ');
    return logClassesStr;
  }
};

var logDebug = function logDebug(logLevel, logClass, logEvent, logStr) {
  var logHTML = '',
      logSpan = void 0,
      logJSONObj = void 0;
  var timestr = timeString();
  var entryType = void 0;

  switch (logClass) {
    case 'playerMsg':
      entryType = 'player';
      break;
    case 'adMsg':
      entryType = 'ads';
      break;
    case 'techFlash':
    case 'techHTML':
    case 'techOther':
      entryType = 'loading';
      break;
    case 'sysMsg':
      entryType = 'console';
      break;
    default:
      entryType = 'other';
  }

  logJSONObj = '{' + 'level:' + logLevel + ', timestamp:' + timestr + ', type:' + entryType + ', message:' + logStr + '}';

  if (logStr) {
    logHTML += logStr;
  }

  if (!_options$2.logClasses || entryType === 'console') {
    myAddMessage(logLevel, timestr, entryType, logEvent, logStr, '');
  } else {
    var logClassesStr = getClassesStr$1(_player.el_.classList);
    myAddMessage(logLevel, timestr, entryType, logEvent, logStr, logClassesStr);
  }

  //  if (options.showPlayerClasses) {
  //    showPlayerClasses(player.el_.classList);
  //  }
  // showBigPlayButtonStyles();
};

var clear$1 = function clear() {
  // clear list output
  // outputList.innerHTML = '';
  // let strContent = myGenerateMarkup(options.logType);

  document.getElementById(IDs.logList).innerHTML = '';
};

var clickControl = function clickControl(evt) {
  var el = void 0;

  if (!evt) {
    evt = window.event;
  }
  el = evt.target ? evt.target : evt.srcElement;

  if (el.tagName == 'SPAN') {
    switch (el.getAttributeNode('op').nodeValue) {
      case 'clear':
        clear$1();
        break;
      case 'close':
        hide();
        break;
    }
  }
};



var buildLogPane = function buildLogPane(player, opt) {

  _player = player;
  _options$2 = opt;

  var paneOptions = {
    'id': IDs.log
  };
  log = new DebuggerPane(player, paneOptions);

  log.el_.className = 'activePane';
  // let innerHTML = log.content();

  log.headerEl_.innerHTML = getHeaderStr(player);

  var strContent = myGenerateMarkup(_options$2.logType);

  log.content(strContent);

  frogger = log.el_;
  outputList = frogger.getElementsByTagName(logContainer)[0];

  return log;
};

/* classesListPane */
var dom$2 = videojs.dom || videojs;

var allClassesList = void 0;
var allClasses = ['ima3-loading-spinner', 'not-hover', 'vjs-ad-controls', 'vjs-ad-loading', 'vjs-ad-playing', 'vjs-audio', 'vjs-controls-disabled', 'vjs-controls-enabled', 'vjs-ended', 'vjs-errors', 'vjs-fluid', 'vjs-fullscreen', 'vjs-has-started', 'vjs-ima3-flash', 'vjs-ima3-html5', 'vjs-live', 'vjs-mouse', 'vjs-no-flex', 'vjs-paused', 'vjs-playing', 'vjs-plugins-ready', 'vjs-scrubbing', 'vjs-seeking', 'vjs-touch-enabled', 'vjs-user-active', 'vjs-user-inactive', 'vjs-using-native-controls', 'vjs-waiting', 'vjs-workinghover'];
var thisPlayer = void 0;

var togglePlayerClass = function togglePlayerClass(playerClass) {
  var playerClassList = thisPlayer.el_.classList;
  var listEl = document.getElementById(playerClass);
  playerClassList.toggle(playerClass);
  if (playerClassList.contains(playerClass)) {
    listEl.setAttribute('class', 'active');
  } else {
    listEl.removeAttribute('class');
  }
};

var allPlayerClasses = function allPlayerClasses(player) {
  var listItems = void 0,
      classItem = void 0,
      toggleLink = void 0;
  allClasses.forEach(function (entry, index) {
    if (player.el_.classList.contains(entry)) {
      classItem = dom$2.createEl('li', {
        'className': 'active',
        'id': entry,
        'title': entry + ' active'
      });
    } else {
      classItem = dom$2.createEl('li', {
        'id': entry,
        'title': entry
      });
    }
    toggleLink = dom$2.createEl('a', { 'href': '#' });
    toggleLink.onclick = function () {
      togglePlayerClass(entry);
    };
    toggleLink.innerHTML = entry;
    classItem.appendChild(toggleLink);
    allClassesList.appendChild(classItem);
  });
};

var refreshPlayerClasses = function refreshPlayerClasses(player) {

  var listItems = void 0,
      classItem = void 0,
      toggleLink = void 0;

  allClassesList = document.getElementById('all-classes-list');

  if (allClassesList.hasChildNodes()) {
    while (allClassesList.firstChild) {
      allClassesList.removeChild(allClassesList.firstChild);
    }
  }
  allPlayerClasses(player);
  // showPosterStyles();
  // showBigPlayButtonStyles();
};

var buildClassesListPane = function buildClassesListPane(player) {

  var classesListPane = void 0,
      classesListHeader = void 0,
      classesListFooter = void 0,
      classItem = void 0,
      toggleLink = void 0;

  thisPlayer = player;
  classesListPane = dom$2.createEl('div', { 'id': IDs.classesList });

  classesListHeader = dom$2.createEl('div', {
    'className': 'classListHeader'
  });
  classesListHeader.innerHTML = '<h2>Player Classes</h2><span class="active">active</span><span class="inactive">inactive</span>';
  classesListPane.appendChild(classesListHeader);

  allClassesList = document.createElement('ul');
  allClassesList.setAttribute('id', 'all-classes-list');

  allPlayerClasses(player);

  classesListPane.appendChild(allClassesList);

  classesListPane.appendChild(document.createElement('br'));

  classesListFooter = document.createElement('span');
  classesListFooter.innerHTML = 'Click on a class to toggle its state';
  classesListPane.appendChild(classesListFooter);

  return classesListPane;
};

var priorAdEvents = [];
var adTimer = new Date();
var adReadyTime = void 0;
var readyForPrerollTime = void 0;
var adRequestTime = void 0;
var adStartTime = void 0;
var adSettingsPane$1 = void 0;
var _options$1 = void 0;

var ima3Html5AdEvents = ['ima3-ready', // not standard IMA AdEvent
'ima3-ad-break-ready', 'ima3-ad-error', // not standard IMA HTML5 AdEvent - is adError
'ima3-ad-metadata', 'ima3-ads-manager-loaded', // not standard IMA HMTL5 AdEvent
'ima3-all-ads-completed', 'ima3-click', 'ima3-complete', 'ima3-completed', // not standard IMA HTML5 AdEvent
'ima3-content-pause-requested', 'ima3-content-resume-requested', 'ima3-error', // not standard IMA HTML5 AdEvent
'ima3-first-quartile', 'ima3-impression', 'ima3-linearChanged', 'ima3-loaded', 'ima3-log', 'ima3-midpoint', 'ima3-paused', 'ima3-resumed', 'ima3-skippable-state-changed', 'ima3-skipped', 'ima3-started', 'ima3-third-quartile', 'ima3-user-close', 'ima3-volume-changed', 'ima3-volume-muted', 'ima3-start' // not standard IMA3 HTML5 AdEvent
];
var ima3FlashAdEvents = ['ima3-adbreakready', 'ima3-adMetadata', 'ima3-allAdsCompleted', 'ima3-clicked', 'ima3-completed', 'ima3-contentPauseRequested', 'ima3-contentResumeRequested', 'ima3-durationChanged', 'ima3-adError', // not IMA Standard Flash AdEvent
'ima3-exitFullscreen', 'ima3-expandedChanged', 'ima3-firstQuartile', 'ima3-fullScreen', 'ima3-impression', 'ima3-interaction', 'ima3-linearChanged', 'ima3-loaded', 'ima3-log', 'ima3-midpoint', 'ima3-paused', 'ima3-resumed', 'ima3-sizeChanged', 'ima3-skippableStateChanged', 'ima3-skipped', 'ima3-started', 'ima3-stopped', 'ima3-thirdQuartile', 'ima3-userAcceptedInvitation', 'ima3-userClosed', 'ima3-userMinimized', 'ima3-volumeChanged', 'ima3-volumeMuted'];

var adEvents = ['readyforpreroll', 'adcanplay', 'addurationchange', 'adplay', 'adstart', 'adend', 'adtimeout', 'adserror', 'adscanceled', 'adsready', 'ads-ready', 'preroll?', 'ad-playback', 'content-playback', 'content-resuming', 'ads-adstart', 'ads-ad-started', 'ads-adplay', 'ads-adend', 'ads-ad-ended', 'ads-click', 'ads-first-quartile', 'ads-midpoint', 'ads-third-quartile', 'ads-complete', 'ads-volume-change', 'ads-pause', 'ads-play', 'ads-allpods-completed', 'ads-request', 'ads-load', 'ads-pod-ended', 'ads-pod-started'];

var getElapsedTime = function getElapsedTime(startTime, endTime) {
  var startMsec = startTime.getTime();
  var endMsec = endTime.getTime();
  var elapsedTime = (endMsec - startMsec) / 1000;
  return { startTime: startTime, endTime: endTime, elapsedTime: elapsedTime };
};

var getAdSettingsStr = function getAdSettingsStr(player) {

  var previousStateStr = '',
      contentStr = '',
      adStr = ['<h3>IMA3 Settings</h3>', '<span class="adMsg">IMA3 Plugin Version:</span> ' + player.ima3.version, '<span class="adMsg">sdkurl:</span> ' + player.ima3.settings.sdkurl, '<span class="adMsg">adSwf:</span> ' + player.ima3.settings.adSwf, '<span class="adMsg">adTechOrder:</span> ' + player.ima3.settings.adTechOrder.toString().split(' '), '<span class="adMsg">debug:</span> ' + player.ima3.settings.debug, '<span class="adMsg">loadingSpinner:</span> ' + player.ima3.settings.loadingSpinner, '<span class="adMsg">prerollTimeout:</span> ' + player.ima3.settings.prerollTimeout, '<span class="adMsg">timeout:</span> ' + player.ima3.settings.timeout, '<span class="adMsg">requestMode:</span> ' + player.ima3.settings.requestMode, '<span class="adMsg">serverUrl:</span> ' + player.ima3.settings.serverUrl].join('<br>');

  contentStr = '<span class="adMsg">Ad state:</span> <span id="adstate">' + player.ads.state + '</span><br>';
  contentStr += '<span class="adMsg">Previous Ad state(s): ';
  for (var i = 0; i < priorAdEvents.length; i++) {
    previousStateStr += priorAdEvents[i] + ' -&gt; ';
  }
  contentStr += previousStateStr + '</span><br>';
  contentStr += adStr;
  return contentStr;
};

var getCurrentAdStr = function getCurrentAdStr(player) {
  var currentAdStr = void 0,
      currentAdPodInfo = void 0,
      adTech = void 0;

  if (player.hasClass('vjs-ima3-flash')) {
    adTech = 'Flash';
  } else {
    if (player.hasClass('vjs-ima3-html5')) {
      adTech = 'Html5';
    } else {
      adTech = undefined;
    }
  }

  if (adTech === 'Hls' || adTech === 'Flash') {

    currentAdStr = '<h3>Current Ad:</h3>';
    currentAdStr += ['<span class="adMsg">Ad System:</span> ' + player.ima3.currentAd.adSystem, '<span class="adMsg">Media Url:</span> ' + player.ima3.currentAd.mediaUrl, '<span class="adMsg">Ad Title:</span> ' + player.ima3.currentAd.title, '<span class="adMsg">Description:</span> ' + player.ima3.currentAd.description, '<span class="adMsg">Content type:</span> ' + player.ima3.currentAd.contentType, '<span class="adMsg">Duration:</span> ' + player.ima3.currentAd.duration, '<span class="adMsg">Ad ID:</span> ' + player.ima3.currentAd.id].join('<br');
    currentAdPodInfo = player.ima3.currentAd.adPodInfo;
    if (currentAdPodInfo != undefined) {
      currentAdStr += '<h3>Ad Pod Information:</h3>';
      currentAdStr += ['<span class="adMsg">Position:</span>' + currentAdPodInfo.adPosition, '<span class="adMsg">Max Duration:</span>' + currentAdPodInfo.getMaxDuration, '<span class="adMsg">Pod Index:</span>' + currentAdPodInfo.podIndex, '<span class="adMsg">Time offset:</span>' + currentAdPodInfo.timeOffset, '<span class="adMsg">Total Ads:</span>' + currentAdPodInfo.totalAds].join('<br>');
    }
  } else {
    if (adTech === 'Html5') {
      currentAdStr = '<h3>Current Ad:</h3>';
      currentAdStr += ['<span class="adMsg">Ad System:</span> ' + player.ima3.currentAd.getAdSystem(),
      // '<span class="adMsg">Media Url:</span> ' + player.ima3.currentAd.getMediaUrl(),
      '<span class="adMsg">Ad Title:</span> ' + player.ima3.currentAd.getTitle(), '<span class="adMsg">Description:</span> ' + player.ima3.currentAd.getDescription(), '<span class="adMsg">Content type:</span> ' + player.ima3.currentAd.getContentType(), '<span class="adMsg">Duration:</span> ' + player.ima3.currentAd.getDuration(), '<span class="adMsg">Ad ID:</span> ' + player.ima3.currentAd.getAdId()].join('<br>');
      currentAdPodInfo = player.ima3.currentAd.getAdPodInfo();
      if (currentAdPodInfo != undefined) {
        currentAdStr += '<h3>Ad Pod Information:</h3>';
        currentAdStr += ['<span class="adMsg">Position:</span>' + currentAdPodInfo.getAdPosition(), '<span class="adMsg">Max Duration:</span>' + currentAdPodInfo.getMaxDuration(), '<span class="adMsg">Pod Index:</span>' + currentAdPodInfo.getPodIndex(), '<span class="adMsg">Time offset:</span>' + currentAdPodInfo.getTimeOffset(), '<span class="adMsg">Total Ads:</span>' + currentAdPodInfo.getTotalAds()].join('<br>');
      }
    }
  }
  return currentAdStr;
};

var showAdInfo = function showAdInfo(player) {
  var adSettingsStr = '',
      currentAdStr = '',
      contentStr = void 0;
  if (player.ima3.settings) {
    adSettingsStr = getAdSettingsStr(player);
  }
  if (player.ima3.currentAd !== undefined) {
    currentAdStr = getCurrentAdStr(player);
  }
  contentStr = adSettingsStr + currentAdStr;
  adSettingsPane$1.content(contentStr);
};

var listenForAdEvents = function listenForAdEvents(player) {
  console.log('player.techName_:' + player.techName_);
  if (player.techName_ === 'Html5') {
    (function () {
      var msgStr = '',
          levelStr = void 0;
      for (var i = 0; i < ima3Html5AdEvents.length; i++) {
        player.on(ima3Html5AdEvents[i], function (e) {
          switch (e.type) {
            case 'ima3-ready':
              {
                adReadyTime = new Date();

                var _getElapsedTime = getElapsedTime(adTimer, adReadyTime),
                    elapsedTime = _getElapsedTime.elapsedTime;

                msgStr = ['IMA3 Plugin Version: ' + this.ima3.version, 'sdkurl: ' + this.ima3.settings.sdkurl, 'adSwf: ' + this.ima3.settings.adSwf, 'adTechOrder: ' + this.ima3.settings.adTechOrder.toString().split(' '), 'debug: ' + this.ima3.settings.debug, 'loadingSpinner: ' + this.ima3.settings.loadingSpinner, 'prerollTimeout: ' + this.ima3.settings.prerollTimeout, 'timeout: ' + this.ima3.settings.timeout, 'requestMode ' + this.ima3.settings.requestMode, 'serverUrl: ' + this.ima3.settings.serverUrl, 'Time to ready: ' + elapsedTime].join('<br>');
              }
              break;
            case 'ads-request':
              {
                adRequestTime = new Date();
              }
              break;
            case 'ima3-loaded':
              {
                var _getElapsedTime2 = getElapsedTime(adRequestTime, new Date()),
                    _elapsedTime = _getElapsedTime2.elapsedTime;

                msgStr = 'Time to ima3-loaded: ' + _elapsedTime;
              }
              break;
            case 'ima3-content-pause-requested':
              break;
            case 'ima3-impression':
              break;
            case 'ima3-started':
              break;
            case 'ima3-first-quartile':
              break;
            case 'ima3-midpoint':
              break;
            case 'ima3-third-quartile':
              break;
            case 'ima3-completed':
            case 'ima3-complete':
              break;
            case 'ima3-all-ads-completed':
              break;
            case 'ima3-content-resume-requested':
              break;
            default:
              msgStr = e.type;
              levelStr = 'debug';
          }
          refreshPlayerClasses(player);
          if (_options$1.verbose) {
            logDebug('debug', 'adMsg', e.type, 'IMA3_HTML5_AD_EVENT:' + msgStr);
          } else {
            logDebug('debug', 'adMsg', e.type, '');
          }
          priorAdEvents.push('event:' + e.type);
          priorAdEvents.push('state:' + player.ads.state);
          showAdInfo(player);
          if (e.type == 'IMA3-AD-ERROR') {
            logDebug('error', 'adMsg', e.type, e);
          }
        });
      }
    })();
  } else if (player.techName_ == 'Hls' || player.techName_ == 'Flash') {
    for (var i = 0; i < ima3FlashAdEvents.length; i++) {
      player.on(ima3FlashAdEvents[i], function (e) {
        switch (e.type) {
          case 'ima3-ready':
            msgStr = ['IMA3 Plugin Version: ' + this.ima.version, 'sdkurl: ' + this.ima3.settings.sdkurl, 'adSwf: ' + this.ima3.settings.adSwf, 'adTechOrder: ' + this.ima3.settings.adTechOrder.toString().split(' '), 'debug: ' + this.ima3.settings.debug, 'loadingSpinner: ' + this.ima3.settings.loadingSpinner, 'prerollTimeout: ' + this.ima3.settings.prerollTimeout, 'timeout: ' + this.ima3.settings.timeout, 'requestMode: ' + this.ima3.settings.requestMode, 'serverUrl: ' + this.ima3.settings.serverUrl].join('<br>');
            break;
          case 'ads-request':
            {
              adRequestTime = new Date();
            }
            break;
          default:
            msgStr = '';
            levelStr = 'debug';
        }
        if (_options$1.verbose) {
          logDebug('debug', 'adMsg', e.type, 'IMA3_FLASH_AD_EVENT:' + msgStr);
        } else {
          logDebug('error', 'adMsg', e.type, e);
        }
        priorAdEvents.push('event:' + e.type);
        priorAdEvents.push('state:' + player.ads.state);
        refreshPlayerClasses(player);
        showAdInfo(player);
      });
    }
  }

  var _loop = function _loop(_i) {
    var msgStr = '';
    player.on(adEvents[_i], function (e) {
      switch (e.type) {
        case 'readyforpreroll':
          {
            readyForPrerollTime = new Date();
            if (adRequestTime === undefined) {
              adRequestTime = new Date();
            }

            var _getElapsedTime3 = getElapsedTime(adRequestTime, readyForPrerollTime),
                elapsedTime = _getElapsedTime3.elapsedTime;

            msgStr = 'Time to readyforpreroll: ' + elapsedTime;
          }
          break;
        case 'ads-request':
          {
            adRequestTime = new Date();
          }
          break;
        case 'adstart':
          {
            adStartTime = new Date();
            showAdInfo(player);

            var _getElapsedTime4 = getElapsedTime(adRequestTime, adStartTime),
                _elapsedTime2 = _getElapsedTime4.elapsedTime;

            msgStr = 'Time to ad start: ' + _elapsedTime2;
          }
          refreshPlayerClasses(player);
          break;

      }
      if (_options$1.verbose) {
        logDebug('debug', 'adMsg', e.type, msgStr);
      } else {
        logDebug('debug', 'adMsg', e.type, '');
      }
      priorAdEvents.push('event:' + e.type);
      priorAdEvents.push('state:' + player.ads.state);
      showAdInfo(player);
      refreshPlayerClasses(player);
      // db.updateLogPane(player);
    });
  };

  for (var _i = 0; _i < adEvents.length; _i++) {
    _loop(_i);
  }
};

var buildAdSettingsPane = function buildAdSettingsPane(player, opt) {

  var options = {
    'id': IDs.adSettings,
    'name': 'Ad Settings'
  };

  _options$1 = opt;

  adSettingsPane$1 = new DebuggerPane(player, options);

  return adSettingsPane$1;
};

var imaAdSettings = (Object.freeze || Object)({
	showAdInfo: showAdInfo,
	listenForAdEvents: listenForAdEvents,
	buildAdSettingsPane: buildAdSettingsPane
});

var priorAdEvents$1 = [];
var readyForPrerollTime$1 = void 0;
var adRequestTime$1 = void 0;
var adStartTime$1 = void 0;
var adSettingsPane$2 = void 0;
var _options$3 = void 0;

var ssaiAdEvents = ['onceux-linearad-start', 'onceux-linearad-impression', 'onceux-linearad-firstQuartile', 'onceux-linearad-midpoint', 'onceux-linearad-thirdQuartile', 'onceux-linearad-complete', 'onceux-adroll-start', 'onceux-adroll-complete', 'onceux-ads-complete', 'onceux-linearad-skipped', 'onceux-linearad-mute', 'onceux-linearad-unmute', 'onceux-linearad-pause', 'onceux-linearad-resume', 'onceux-companionad-creativeView'];

var adEvents$1 = ['readyforpreroll', 'adcanplay', 'addurationchange', 'adplay', 'adstart', 'adend', 'adtimeout', 'adserror', 'adscanceled', 'adsready', 'ads-ready', 'preroll?', 'ad-playback', 'content-playback', 'content-resuming', 'ads-adstart', 'ads-ad-started', 'ads-adplay', 'ads-adend', 'ads-ad-ended', 'ads-click', 'ads-first-quartile', 'ads-midpoint', 'ads-third-quartile', 'ads-complete', 'ads-volume-change', 'ads-pause', 'ads-play', 'ads-allpods-completed', 'ads-request', 'ads-load', 'ads-pod-ended', 'ads-pod-started'];

var ppJSON = function ppJSON(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    var cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
};

var getElapsedTime$1 = function getElapsedTime(startTime, endTime) {
  var startMsec = startTime.getTime();
  var endMsec = endTime.getTime();
  var elapsedTime = (endMsec - startMsec) / 1000;
  return { startTime: startTime, endTime: endTime, elapsedTime: elapsedTime };
};

var getAdSettingsStr$1 = function getAdSettingsStr(player) {

  var previousStateStr = '',
      adStr = void 0,
      contentStr = '';
  if (player.onceux.timeline) {
    adStr = ['<h3>Once UX Settings</h3>', '<span>Timeline</span>', '<span class="adMsg">contenturi:</span> ' + player.onceux.timeline.contenturi, '<span class="adMsg">absoluteDuration:</span> ' + player.onceux.timeline.absoluteDuration, '<span class="adMsg">contentDuration:</span> ' + player.onceux.timeline.contentDuration].join('<br>');
  }
  contentStr = '<span class="adMsg">Ad state:</span> <span id="adstate">' + player.ads.state + '</span><br>';
  contentStr += '<span class="adMsg">Previous Ad state(s): ';
  for (var i = 0; i < priorAdEvents$1.length; i++) {
    previousStateStr += priorAdEvents$1[i] + ' -&gt; ';
  }
  contentStr += previousStateStr + '</span><br>';
  contentStr += adStr;
  return contentStr;
};

var getCurrentAdStr$1 = function getCurrentAdStr(player) {
  var currentAdStr = void 0,
      currentAdPodInfo = void 0,
      path = void 0;
  if (player.onceux.currentTime() !== undefined && player.onceux.timeline) {
    path = player.onceux.timeline.pathAtAbsoluteTime(player.onceux.currentTime());
  }if (path) {
    currentAdStr = '<h3>Current TimeLine Snapshot (path):</h3>';
    currentAdStr += ['<br/><span class="adMsg">absoluteTime:</span>' + path.absoluteTime, '<span class="adMsg">contentTime:</span>' + path.contentTime].join('<br>');
    if (path.adRoll) {
      currentAdStr += ['<br/><h3 class="adMsg">adRoll:</h3>', '<span class="adMsg">adRolls:</span> ' + ppJSON(JSON.stringify(player.onceux.timeline.adRolls, undefined, 4)), '<span class="adMsg">adRoll.absoluteBeginTime:</span>' + path.adRoll.absoluteBeginTime, '<span class="adMsg">adRoll.absoluteEndTime:</span>' + path.adRoll.absoluteEndTime, '<span class="adMsg">adRoll.index:</span>' + path.adRoll.index, '<span class="adMsg">adRoll.linearAdCount:</span>' + path.adRoll.linearAdCount, '<span class="adMsg">adRoll.playCount:</span>' + path.adRoll.playCount].join('<br>');
    }
    if (path.linearAd) {
      currentAdStr += ['<br/><h3 class="adMsg">linearAd:</h3>', '<span class="adMsg">linearAd.AdSource:</span>' + ppJSON(JSON.stringify(path.linearAd.AdSource, undefined, 4)), '<span class="adMsg">linearAd.absoluteBeginTime:</span>' + path.linearAd.absoluteBeginTime, '<span class="adMsg">linearAd.absoluteEndTime:</span>' + path.linearAd.absoluteEndTime, '<span class="adMsg">linearAd.breakId:</span>' + path.linearAd.breakId, '<span class="adMsg">linearAd.breakType:</span>' + path.linearAd.breakType, '<span class="adMsg">linearAd.index:</span>' + path.linearAd.index, '<span class="adMsg">linearAd.playCount:</span>' + path.linearAd.playCount, '<span class="adMsg">linearAd.skipoffset:</span>' + path.linearAd.skipoffset, '<span class="adMsg">linearAd.timeOffset:</span>' + path.linearAd.timeOffset, '<h3 class="adMsg">linearAd.companionAd:</h3>' + ppJSON(JSON.stringify(path.linearAd.companionAd, undefined, 4))].join('<br>');
    }
  }
  return currentAdStr;
};

var showAdInfo$1 = function showAdInfo(player) {
  var adSettingsStr = '',
      currentAdStr = '',
      contentStr = void 0;
  if (player.onceux) {
    adSettingsStr = getAdSettingsStr$1(player);
    currentAdStr = getCurrentAdStr$1(player);
  }
  contentStr = adSettingsStr + currentAdStr;
  adSettingsPane$2.content(contentStr);
};

var listenForAdEvents$1 = function listenForAdEvents(player) {
  console.log('player.techName_:' + player.techName_);
  var msgStr = '',
      levelStr = void 0;
  for (var i = 0; i < ssaiAdEvents.length; i++) {
    player.on(ssaiAdEvents[i], function (e) {
      switch (e.type) {
        case 'onceux-linearad-start':
          break;
        case 'onceux-linearad-impression':
          break;
        case 'onceux-linearad-firstQuartile':
          break;
        case 'onceux-linearad-midpoint':
          break;
        case 'onceux-linearad-thirdQuartile':
          break;
        case 'onceux-linearad-complete':
          break;
        case 'ima3-first-quartile':
          break;
        case 'ima3-midpoint':
          break;
        case 'ima3-third-quartile':
          break;
        case 'onceux-adroll-start':
          break;
        case 'onceux-adroll-complete':
          break;
        case 'onceux-ads-complete':
          break;
        case 'onceux-linearad-skipped':
          break;
        case 'onceux-linearad-mute':
          break;
        case 'onceux-linearad-unmute':
          break;
        case 'onceux-linearad-pause':
          break;
        case 'onceux-linearad-resume':
          break;
        case 'onceux-companionad-creativeView':
          break;
        default:
          msgStr = e.type;
          levelStr = 'debug';
      }
      refreshPlayerClasses(player);
      if (_options$3.verbose) {
        logDebug('debug', 'adMsg', e.type, 'OnceUX_AD_EVENT:' + msgStr);
      } else {
        logDebug('debug', 'adMsg', e.type, '');
      }
      priorAdEvents$1.push('event:' + e.type);
      priorAdEvents$1.push('state:' + player.ads.state);
      showAdInfo$1(player);
    });
  }

  var _loop = function _loop(_i) {
    var msgStr = '';
    player.on(adEvents$1[_i], function (e) {
      switch (e.type) {
        case 'readyforpreroll':
          {
            readyForPrerollTime$1 = new Date();
            if (adRequestTime$1 === undefined) {
              adRequestTime$1 = new Date();
            }

            var _getElapsedTime = getElapsedTime$1(adRequestTime$1, readyForPrerollTime$1),
                elapsedTime = _getElapsedTime.elapsedTime;

            msgStr = 'Time to readyforpreroll: ' + elapsedTime;
          }
          break;
        case 'ads-request':
          {
            adRequestTime$1 = new Date();
          }
          break;
        case 'adstart':
          {
            adStartTime$1 = new Date();
            showAdInfo$1(player);

            var _getElapsedTime2 = getElapsedTime$1(adRequestTime$1, adStartTime$1),
                _elapsedTime = _getElapsedTime2.elapsedTime;

            msgStr = 'Time to ad start: ' + _elapsedTime;
          }
          refreshPlayerClasses(player);
          break;

      }
      if (_options$3.verbose) {
        logDebug('debug', 'adMsg', e.type, msgStr);
      } else {
        logDebug('debug', 'adMsg', e.type, '');
      }
      priorAdEvents$1.push('event:' + e.type);
      priorAdEvents$1.push('state:' + player.ads.state);
      showAdInfo$1(player);
      refreshPlayerClasses(player);
      // db.updateLogPane(player);
    });
  };

  for (var _i = 0; _i < adEvents$1.length; _i++) {
    _loop(_i);
  }
};

var buildAdSettingsPane$1 = function buildAdSettingsPane(player, opt) {

  var options = {
    'id': IDs.adSettings,
    'name': 'Ad Settings'
  };

  _options$3 = opt;

  adSettingsPane$2 = new DebuggerPane(player, options);

  return adSettingsPane$2;
};

var ssaiAdSettings = (Object.freeze || Object)({
	showAdInfo: showAdInfo$1,
	listenForAdEvents: listenForAdEvents$1,
	buildAdSettingsPane: buildAdSettingsPane$1
});

var priorAdEvents$2 = [];
var adTimer$2 = new Date();
var adReadyTime$2 = void 0;
var readyForPrerollTime$2 = void 0;
var adRequestTime$2 = void 0;
var adStartTime$2 = void 0;
var adSettingsPane$3 = void 0;
var _options$4 = void 0;

var fwHtml5AdEvents = ['fw-ads-manager-loaded', 'fw-before-ad-request', 'fw_slotCurrentTime', 'quartile', 'first-quartile', 'ads-midpoint', 'thirdQuartile', 'complete', '_pause', '_play', '_mute', '_un-mute', '_collapse', '_expand', '_resume', '_rewind', '_close', '_minimize', 'adEvent', 'IMPRESSION', 'contentVideoPauseRequest', 'contentVideoResumeRequest'];
var adEvents$2 = ['readyforpreroll', 'adcanplay', 'addurationchange', 'adplay', 'adpause', 'admuted', 'adstart', 'adend', 'adtimeout', 'advolumechange', 'adserror', 'adscanceled', 'adsready', 'ads-ready', 'preroll?', 'ad-playback', 'nopreroll', 'nopostroll', 'content-playback', 'content-resuming', 'ads-adstart', 'ads-ad-started', 'ads-adplay', 'ads-adend', 'ads-ad-ended', 'ads-click', 'ads-first-quartile', 'ads-midpoint', 'ads-third-quartile', 'ads-complete', 'ads-volume-change', 'ads-pause', 'ads-play', 'ads-allpods-completed', 'ads-request', 'ads-load', 'ads-pod-ended', 'ads-pod-started'];

var getElapsedTime$2 = function getElapsedTime(startTime, endTime) {
  var startMsec = startTime.getTime();
  var endMsec = endTime.getTime();
  var elapsedTime = (endMsec - startMsec) / 1000;
  return { startTime: startTime, endTime: endTime, elapsedTime: elapsedTime };
};

var getAdSettingsStr$2 = function getAdSettingsStr(player) {

  var previousStateStr = '',
      contentStr = '',
      adStr = ['<h3>Freewheel Settings</h3>', '<span class="adMsg">Freewheel Plugin Version:</span> ' + player.FreeWheelPlugin.getVersion(), '<span class="adMsg">sdkurl:</span> ' + player.FreeWheelPlugin.settings.Flash.sdkurl, '<span class="adMsg">adSwf:</span> ' + player.FreeWheelPlugin.settings.Flash.swfurl, '<span class="adMsg">adTechOrder:</span> ' + player.FreeWheelPlugin.settings.adTechOrder.toString().split(' ')[0], '<span class="adMsg">debug:</span> ' + player.FreeWheelPlugin.settings.debug, '<span class="adMsg">prerollTimeout:</span> ' + player.FreeWheelPlugin.settings.prerollTimeout, '<span class="adMsg">timeout:</span> ' + player.FreeWheelPlugin.settings.timeout, '<span class="adMsg">requestMode:</span> ' + player.FreeWheelPlugin.settings.requestAdsMode, '<span class="adMsg">serverUrl:</span> ' + player.FreeWheelPlugin.settings.Html5.serverUrl, '<span class="adMsg">networkId:</span> ' + player.FreeWheelPlugin.settings.Html5.networkId, '<span class="adMsg">siteSectionCustomId:</span> ' + player.FreeWheelPlugin.settings.Html5.siteSectionCustomId, '<span class="adMsg">serverUrl:</span> ' + player.FreeWheelPlugin.settings.Html5.serverUrl,
  // '<span class="adMsg">capabilities:</span> ' + player.FreeWheelPlugin.settings.Html5.capabilities.toString().split(' ')[0],
  '<span class="adMsg">keyValues:</span> ' + player.FreeWheelPlugin.settings.Html5.keyValues.toString().split(' '), '<span class="adMsg">temporalSlots:</span> ' + player.FreeWheelPlugin.settings.Html5.temporalSlots.toString().split(' ')[0], '<span class="adMsg">videoAssetCustomId:</span> ' + player.FreeWheelPlugin.settings.Html5.videoAssetCustomId, '<span class="adMsg">videoAssetDuration:</span> ' + player.FreeWheelPlugin.settings.Html5.videoAssetDuration].join('<br>');

  contentStr = '<span class="adMsg">Ad state:</span> <span id="adstate">' + player.ads.state + '</span><br>';
  contentStr += '<span class="adMsg">Previous Ad state(s): ';
  for (var i = 0; i < priorAdEvents$2.length; i++) {
    previousStateStr += priorAdEvents$2[i] + ' -&gt; ';
  }
  contentStr += previousStateStr + '</span><br>';
  contentStr += adStr;
  return contentStr;
};

var getCurrentAdStr$2 = function getCurrentAdStr(player) {
  var currentAdStr = void 0,
      currentAdPodInfo = void 0,
      adTech = void 0;

  if (player.hasClass('vjs-fw-flash')) {
    adTech = 'Flash';
  } else {
    if (player.hasClass('vjs-fw-html5')) {
      adTech = 'Html5';
    } else {
      adTech = undefined;
    }
  }

  /*    if ((adTech === 'Hls') || (adTech === 'Flash')) {
         currentAdStr = '<h3>Current Ad:</h3>';
        currentAdStr += [
        '<span class="adMsg">Media Url:</span> ' + player.ima3.currentAd.mediaUrl,
        '<span class="adMsg">Ad Title:</span> ' + player.ima3.currentAd.title,
        '<span class="adMsg">Description:</span> ' + player.ima3.currentAd.description,
        '<span class="adMsg">Content type:</span> ' + player.ima3.currentAd.contentType,
        '<span class="adMsg">Duration:</span> ' + player.ima3.currentAd.duration,
        '<span class="adMsg">Ad ID:</span> ' + player.ima3.currentAd.id
         ].join('<br');
  */
  /* currentAdPodInfo = player.ima3.currentAd.adPodInfo;
  if (currentAdPodInfo != undefined) {
    currentAdStr += '<h3>Ad Pod Information:</h3>';
    currentAdStr += [
    '<span class="adMsg">Position:</span>' + currentAdPodInfo.adPosition,
    '<span class="adMsg">Max Duration:</span>' + currentAdPodInfo.getMaxDuration,
    '<span class="adMsg">Pod Index:</span>' + currentAdPodInfo.podIndex,
    '<span class="adMsg">Time offset:</span>' + currentAdPodInfo.timeOffset,
    '<span class="adMsg">Total Ads:</span>' + currentAdPodInfo.totalAds
    ].join('<br>');
  };*/
  //    } else {
  if (adTech === 'Html5') {

    var asCurrentAdInstance = player.FreeWheelPlugin.Html5._currentSlot.getCurrentAdInstance();
    var asAdId = asCurrentAdInstance._adId;
    var asCurrentRenditionId = asCurrentAdInstance._creativeId;
    var asRenditions = asCurrentAdInstance._creativeRenditions;
    var asSlotCustomId = asCurrentAdInstance._slotCustomId;
    var asPrimaryCreativeRendition = asCurrentAdInstance._primaryCreativeRendition;
    var asPrimaryCreativeRenditionAsset = asPrimaryCreativeRendition.getPrimaryCreativeRenditionAsset();
    var currentRendition;
    var asAdDuration = asPrimaryCreativeRendition.getDuration();
    var asAdWidth = asPrimaryCreativeRendition.getWidth();
    var asAdHeight = asPrimaryCreativeRendition.getHeight();

    currentAdStr = '<h3>Current Ad:</h3>';
    currentAdStr += ['<span class="adMsg">Ad ID:</span> ' + asAdId, '<span class="adMsg">Current Rendition Id:</span> ' + asCurrentRenditionId, '<span class="adMsg">Media Url:</span> ' + asPrimaryCreativeRenditionAsset.getUrl(), '<span class="adMsg">Ad Name:</span> ' + asPrimaryCreativeRenditionAsset.getName(), '<span class="adMsg">Content type:</span> ' + asPrimaryCreativeRenditionAsset.getContentType(), '<span class="adMsg">Slot Custom Id:</span> ' + asSlotCustomId, '<span class="adMsg">Duration:</span> ' + asAdDuration, '<span class="adMsg">Height:</span> ' + asAdHeight, '<span class="adMsg">Width:</span> ' + asAdWidth].join('<br>');
    /* currentAdPodInfo = player.ima3.currentAd.getAdPodInfo();
    if (currentAdPodInfo != undefined) {
      currentAdStr += '<h3>Ad Pod Information:</h3>';
      currentAdStr += [
      '<span class="adMsg">Position:</span>' + currentAdPodInfo.getAdPosition(),
      '<span class="adMsg">Max Duration:</span>' + currentAdPodInfo.getMaxDuration(),
      '<span class="adMsg">Pod Index:</span>' + currentAdPodInfo.getPodIndex(),
      '<span class="adMsg">Time offset:</span>' + currentAdPodInfo.getTimeOffset(),
      '<span class="adMsg">Total Ads:</span>' + currentAdPodInfo.getTotalAds()
     ].join('<br>');
     }           */
  }
  // };
  return currentAdStr;
};

var showAdInfo$2 = function showAdInfo(player) {
  var adSettingsStr = '',
      currentAdStr = '',
      contentStr = '';
  if (player.FreeWheelPlugin.settings) {
    adSettingsStr = getAdSettingsStr$2(player);
  }
  if (player.FreeWheelPlugin.Html5 !== undefined && player.FreeWheelPlugin.Html5._currentSlot && player.FreeWheelPlugin.Html5._currentSlot.getCurrentAdInstance()) {
    currentAdStr = getCurrentAdStr$2(player);
  }
  contentStr = adSettingsStr + currentAdStr;
  adSettingsPane$3.content(contentStr);
};

var listenForAdEvents$2 = function listenForAdEvents(player) {
  console.log('player.techName_:' + player.techName_);
  // if(player.techName_ === "Html5") {
  var msgStr = '',
      levelStr = void 0;
  for (var i = 0; i < fwHtml5AdEvents.length; i++) {
    player.on(fwHtml5AdEvents[i], function (e) {
      switch (e.type) {
        case 'fw-ads-manager-loaded':
          {
            adReadyTime$2 = new Date();

            var _getElapsedTime = getElapsedTime$2(adTimer$2, adReadyTime$2),
                elapsedTime = _getElapsedTime.elapsedTime;

            msgStr = ['Freewheel Plugin Version: ' + this.FreeWheelPlugin.getVersion(), 'sdkurl: ' + this.FreeWheelPlugin.settings.Flash.sdkurl, 'adSwf: ' + this.FreeWheelPlugin.settings.Flash.swfurl, 'adTechOrder: ' + this.FreeWheelPlugin.settings.adTechOrder.toString().split(' '), 'debug: ' + this.FreeWheelPlugin.settings.debug, 'prerollTimeout: ' + this.FreeWheelPlugin.settings.prerollTimeout, 'timeout: ' + this.FreeWheelPlugin.settings.timeout, 'requestMode ' + this.FreeWheelPlugin.settings.requestAdsMode, 'serverUrl: ' + this.FreeWheelPlugin.settings.Html5.serverUrl,
            // 'capabilities: ' + this.FreeWheelPlugin.settings.Html5.capabilities.toString().split(' '),
            'keyValues: ' + this.FreeWheelPlugin.settings.Html5.keyValues.toString().split(' '), 'temporalSlots: ' + this.FreeWheelPlugin.settings.Html5.temporalSlots.toString().split(' '), 'videoAssetCustomId: ' + this.FreeWheelPlugin.settings.Html5.videoAssetCustomId, 'videoAssetDuration: ' + this.FreeWheelPlugin.settings.Html5.videoAssetDuration, 'Time to ready: ' + elapsedTime].join('<br>');
          }
          break;
        case 'fw-before-ad-request':
          {
            adRequestTime$2 = new Date();
          }
          break;
        case 'ima3-loaded':
          {
            var _getElapsedTime2 = getElapsedTime$2(adRequestTime$2, new Date()),
                _elapsedTime = _getElapsedTime2.elapsedTime;

            msgStr = 'Time to ima3-loaded: ' + _elapsedTime;
          }
          break;
        case 'fw_slotCurrentTime':
          break;
        case 'quartile':
          break;
        case 'IMPRESSION':
          break;
        case 'first-quartile':
          break;
        case 'midPoint':
          break;
        case 'third-quartile':
          break;
        case 'completed':
        case 'complete':
          break;
        case 'contentVideoResumeRequest':
          break;
        case 'contentVideoPauseRequest':
          break;
        default:
          msgStr = e.type;
          levelStr = 'debug';
      }
      refreshPlayerClasses(player);
      if (_options$4.verbose) {
        logDebug('debug', 'adMsg', e.type, 'FW_HTML5_AD_EVENT:' + msgStr);
      } else {
        logDebug('debug', 'adMsg', e.type, '');
      }
      priorAdEvents$2.push('event:' + e.type);
      priorAdEvents$2.push('state:' + player.ads.state);
      showAdInfo$2(player);
      if (e.type == 'FW-AD-ERROR') {
        logDebug('error', 'adMsg', e.type, e);
      }
    });
  }
  /* } else if(player.techName_ == "Hls" || player.techName_ == 'Flash' ) {
     for (let i=0; i < fwFlashAdEvents.length; i++) {
       player.on(fwFlashAdEvents[i], function (e) {
         switch(e.type) {
           case 'ima3-ready':
              msgStr = [
               'IMA3 Plugin Version: ' + this.ima.version,
               'sdkurl: ' + this.ima3.settings.sdkurl,
               'adSwf: ' + this.ima3.settings.adSwf,
               'adTechOrder: ' + this.ima3.settings.adTechOrder.toString().split(' '),
               'debug: ' + this.ima3.settings.debug,
               'loadingSpinner: ' + this.ima3.settings.loadingSpinner,
               'prerollTimeout: ' + this.ima3.settings.prerollTimeout,
               'timeout: ' + this.ima3.settings.timeout,
               'requestMode: ' + this.ima3.settings.requestMode,
               'serverUrl: ' + this.ima3.settings.serverUrl
             ].join('<br>');
           break;
           case 'ads-request': {
             adRequestTime = new Date();
           }
           break;
           default:
             msgStr='';
             levelStr = 'debug';
         }
         if (_options.verbose) {
           db.logDebug('debug', 'adMsg', e.type, 'IMA3_FLASH_AD_EVENT:' + msgStr);
         } else {
           db.logDebug('error', 'adMsg', e.type, e);
         }
         priorAdEvents.push('event:' + e.type);
         priorAdEvents.push('state:' + player.ads.state);
         classesList.refreshPlayerClasses(player);
         showAdInfo(player);
       });
     };
   };
  */

  var _loop = function _loop(_i) {
    var msgStr = '';
    player.on(adEvents$2[_i], function (e) {
      switch (e.type) {
        case 'readyforpreroll':
          {
            readyForPrerollTime$2 = new Date();
            if (adRequestTime$2 === undefined) {
              adRequestTime$2 = new Date();
            }

            var _getElapsedTime3 = getElapsedTime$2(adRequestTime$2, readyForPrerollTime$2),
                elapsedTime = _getElapsedTime3.elapsedTime;

            msgStr = 'Time to readyforpreroll: ' + elapsedTime;
          }
          break;
        case 'ads-request':
          {
            adRequestTime$2 = new Date();
          }
          break;
        case 'adstart':
          {
            adStartTime$2 = new Date();
            showAdInfo$2(player);

            var _getElapsedTime4 = getElapsedTime$2(adRequestTime$2, adStartTime$2),
                _elapsedTime2 = _getElapsedTime4.elapsedTime;

            msgStr = 'Time to ad start: ' + _elapsedTime2;
          }
          refreshPlayerClasses(player);
          break;

      }
      if (_options$4.verbose) {
        logDebug('debug', 'adMsg', e.type, msgStr);
      } else {
        logDebug('debug', 'adMsg', e.type, '');
      }
      priorAdEvents$2.push('event:' + e.type);
      priorAdEvents$2.push('state:' + player.ads.state);
      showAdInfo$2(player);
      refreshPlayerClasses(player);
      // db.updateLogPane(player);
    });
  };

  for (var _i = 0; _i < adEvents$2.length; _i++) {
    _loop(_i);
  }
};

var buildAdSettingsPane$2 = function buildAdSettingsPane(player, opt) {

  var paneOptions = {
    'id': IDs.adSettings,
    'name': 'Ad Settings'
  };

  _options$4 = opt;

  adSettingsPane$3 = new DebuggerPane(player, paneOptions);

  return adSettingsPane$3;
};

var fwAdSettings = (Object.freeze || Object)({
	showAdInfo: showAdInfo$2,
	listenForAdEvents: listenForAdEvents$2,
	buildAdSettingsPane: buildAdSettingsPane$2
});

var playerSettingsPane$1 = void 0;

var getPlayerInfo = function getPlayerInfo(player) {
  var playerStr = void 0,
      configUrl = void 0,
      plyrUrl = void 0;
  var plyrID = player.el_.getAttribute('data-player');
  var acct = player.el_.getAttribute('data-account');
  playerStr = '<h3>Player Information:</h3>';
  if (plyrID !== null) {
    playerStr += '<span class="playerMsg">Player ID:</span> ' + plyrID + '<br>';
  }
  if (acct !== null) {
    playerStr += '<span class="playerMsg">Account ID:</span> ' + acct + '<br>';
    configUrl = 'http://players.brightcove.net/' + acct + '/' + plyrID + '_default/config.json';
  }
  playerStr += '<span class="playerMsg">Player Tech:</span> ' + player.techName_ + '<br>';
  playerStr += '<span class="playerMsg">Playback Rate:</span>' + player.playbackRate() + '<br>';
  playerStr += '<span class="playerMsg">preload: </span>' + player.preload() + '<br>';
  playerStr += '<span class="playerMsg">autoplay: </span>' + player.autoplay() + '<br>';
  playerStr += '<span class="playerMsg">loop: </span>' + player.loop() + '<br>';
  playerStr += '<span class="playerMsg">paused: </span>' + player.paused() + '<br>';
  playerStr += '<span class="playerMsg">volume: </span>' + player.volume() + '<br>';
  playerStr += '<span class="playerMsg">muted: </span>' + player.muted() + '<br>';
  playerStr += '<span class="playerMsg">height: </span>' + player.height() + '<br>';
  playerStr += '<span class="playerMsg">width: </span>' + player.width() + '<br>';
  playerStr += '<span class="playerMsg">videoHeight: </span>' + player.videoHeight() + '<br>';
  playerStr += '<span class="playerMsg">videoWidth: </span>' + player.videoWidth() + '<br>';
  if (plyrID !== null || acct !== null) {
    plyrUrl = 'http://players.brightcove.net/' + acct + '/' + plyrID + '_default/index.html';
    playerStr += '<span class="playerMsg">Standalone player:</span> <a style="color: white;" href="' + plyrUrl + '" target="_blank">' + plyrUrl + '</a><br>';
    playerStr += '<span class="playerMsg">Player config.json:</span> <a style="color: white;" href="' + configUrl + '" target="_blank">' + configUrl + '</a><br>';
  }
  return { playerStr: playerStr, configUrl: configUrl, plyrUrl: plyrUrl };
};

var getMediaInfoStr = function getMediaInfoStr(player, mInfo) {
  var mStr = '';
  if (mInfo != undefined) {
    mStr = '<h3>Mediainfo</h3>';
    mStr += ['<span class="playerMsg">Account ID:</span> ' + mInfo.account_id, '<span class="playerMsg">Video ID:</span> ' + mInfo.id, '<span class="playerMsg">Title:</span> ' + mInfo.name, '<span class="playerMsg">Duration:</span> ' + mInfo.duration, '<span class="playerMsg">Description:</span> ' + mInfo.description, '<span class="playerMsg">Long Description:</span> ' + mInfo.long_description, '<span class="playerMsg">Poster:</span> ' + mInfo.poster, '<span class="playerMsg">Thumbnail:</span> ' + mInfo.thumbnail].join('<br>');
    if (mInfo.sources) {
      var sourcesStr = getSourcesStr(mInfo.sources);
      mStr += '<br><span class="playerMsg">Current Source:</span> ' + player.currentSrc();
      if (player.tech_.hls) {
        mStr += '<br><span class="playerMsg">Master:</span>' + player.tech_.hls.source_.src;
      }
      mStr += '<br><span class="playerMsg">Sources:</span> <br>' + sourcesStr;
    } else {
      mStr = '<span class="playerMsg">Current Source:</span> ' + player.src() + '<br>';
    }
  }
  return mStr;
};

var getSourcesStr = function getSourcesStr(mSrcArray) {
  var sourcesStr = '';
  for (var i = 0; i < mSrcArray.length; i++) {
    var httpSrc = mSrcArray[i].src;
    if (httpSrc != undefined) {
      sourcesStr += '[' + i + '] ' + httpSrc + '<br>';
    } else {
      var rtmpSrc = mSrcArray[i].app_name + mSrcArray[i].stream_name;
      if (rtmpSrc != undefined) {
        sourcesStr += '[' + i + '] ' + rtmpSrc + '<br>';
      }
    }
  }
  return sourcesStr;
};

var buildPlayerSettingsPane = function buildPlayerSettingsPane(player) {

  var mediaInfo = '',
      mediaStr = '';

  // Get information about the player to use in main content

  var _getPlayerInfo = getPlayerInfo(player),
      playerStr = _getPlayerInfo.playerStr;

  mediaInfo = player.mediainfo;
  mediaStr = getMediaInfoStr(player, mediaInfo);

  var _options = {
    'id': IDs.playerSettings,
    'name': 'Brightcove Player Settings',
    'content': playerStr + mediaStr || ''
  };

  playerSettingsPane$1 = new DebuggerPane(player, _options);

  return playerSettingsPane$1;
};

var showPlayerSettings = function showPlayerSettings(player) {
  var mediaInfo = void 0,
      mediaStr = void 0,
      adStr = void 0,
      srcArray = void 0,
      contentStr = void 0;

  // Get information about the player to use in main content

  var _getPlayerInfo2 = getPlayerInfo(player),
      playerStr = _getPlayerInfo2.playerStr;

  contentStr = playerStr;

  mediaInfo = player.mediainfo;
  mediaStr = getMediaInfoStr(player, mediaInfo);

  contentStr += mediaStr;

  playerSettingsPane$1.content(contentStr);
};

var playbackInfoPane$1 = void 0;
var player_ = void 0;
var highestMeasuredBitrate = 0;
var lowestMeasuredBitrate = 0;
var highestVideoBitrate = 0;
var lowestVideoBitrate = 0;
var currentSegment = null;
var currentSegmentEnd = null;
var currentSegmentDuration = null;
var previousSegment = null;
var previousSegmentEnd = null;
var previousSegmentDuration = null;

var timeRangesToString = function timeRangesToString(tr) {
  var arr = [];
  for (var i = 0; i < tr.length; i++) {
    arr.push('[' + tr.start(i).toFixed(2) + ', ' + tr.end(i).toFixed(2) + ']');
  }
  return arr;
};

var calcVideoBitrate = function calcVideoBitrate(pl) {
  var vbr = 0;
  if (pl && pl.attributes && pl.attributes.BANDWIDTH) {
    vbr = (pl.attributes.BANDWIDTH / 1024).toFixed(3);
    if (parseFloat(vbr) >= highestVideoBitrate || highestVideoBitrate === 0) {
      highestVideoBitrate = vbr;
    }
    if (parseFloat(vbr) <= lowestVideoBitrate || lowestVideoBitrate === 0) {
      lowestVideoBitrate = vbr;
    }
    return vbr + ' kbps';
  }
};

var calcMeasuredBitrate = function calcMeasuredBitrate(hls) {
  var mbr;
  if (hls.bandwidth) {
    mbr = (hls.bandwidth / 1024).toFixed(3);
    if (parseFloat(mbr) >= highestMeasuredBitrate || highestMeasuredBitrate === 0) {
      highestMeasuredBitrate = mbr;
    }
    if (parseFloat(mbr) <= lowestMeasuredBitrate || lowestMeasuredBitrate === 0) {
      lowestMeasuredBitrate = mbr;
    }
    return mbr + ' kbps';
  }
};

var getCurrentSegmentInfo = function getCurrentSegmentInfo(pl) {
  var currentSegmentStr;
  if (pl.segments.length > 0) {
    var currTime = player_.currentTime();
    var segments = pl.segments;
    var lower;
    var upper;
    for (var i = 0; i < segments.length - 1; i++) {
      if (segments[i].end !== undefined) {
        lower = segments[i].end - segments[i].duration;
      } else {
        lower = 0;
      }
      upper = segments[i].end;
      if (upper === undefined) {
        upper = segments[i].duration;
      }
      if (currTime >= lower && currTime <= upper) {
        // currTime between segment start/end so we are playing this segment
        currentSegmentStr = segments[i].uri;
        if (currentSegment !== currentSegmentStr) {
          previousSegment = currentSegment;
          previousSegmentDuration = currentSegmentDuration;
          previousSegmentEnd = currentSegmentEnd;

          currentSegment = currentSegmentStr;
          currentSegmentEnd = segments[i].end;
          currentSegmentDuration = segments[i].duration;

          var debugMsg = 'Previous segment: ' + previousSegment + '<br>Previous segment start: ' + (previousSegmentEnd - previousSegmentDuration) + ' Previous segment end: ' + previousSegmentEnd + ' Previous segment duration: ' + previousSegmentDuration;

          debugMsg += '<br>Current segment: ' + currentSegment + '<br>Current segment start: ' + (currentSegmentEnd - currentSegmentDuration) + ' Current segment end: ' + currentSegmentEnd + ' Current segment duration: ' + currentSegmentDuration;

          logDebug('debug', 'playerMsg', 'SEGMENT-CHANGE-RECORDED', debugMsg);
        }

        // how to determine when to update previous
        // null until it is set, can it simply be i-1?
        // if (previousSegment !== null && currentSegment !== previousSegment) {
        //  previousSegment = currentSegment;
        //  previousSegmentDuration = currentSegmentDuration;
        //  previousSegmentEnd = currentSegmentEnd;
        // }
        return currentSegmentStr;
      }
    }
  }
};

var loadedSegments = function loadedSegments(m_) {
  var segArr = [];
  if (m_.segments.length > 0) {
    for (var i = 0; i < m_.segments.length; i++) {
      segArr.push('[' + i + '] ' + m_.segments[i].uri + ' end: ' + m_.segments[i].end + '<br>');
    }
    return segArr;
  }
};

var getPlaybackInfo = function getPlaybackInfo(player) {
  var playbackInfoStr = void 0;
  var playlist = void 0;
  var plyrID = player.el_.getAttribute('data-player');
  var acct = player.el_.getAttribute('data-account');

  if (player.tech_.hls) {
    playlist = player.tech_.hls.playlists.media_;
  }
  playbackInfoStr = '<h3>Video Playback Information:</h3>';
  playbackInfoStr += '<span class="playerMsg">TechName: </span> ' + player.techName_;
  playbackInfoStr += '<br><span class="playerMsg">Current Source: </span> ' + player.currentSrc();
  if (player.tech_.hls) {
    if (player.tech_.hls.playlists.media_) {
      playbackInfoStr += '<br><span class="playerMsg">Master: </span>' + player.tech_.hls.playlists.media_.resolvedUri;
      playbackInfoStr += '<br><span class="playerMsg">Current Segment: </span> ' + getCurrentSegmentInfo(playlist);
      playbackInfoStr += '<br><span class="playerMsg">Previous Segment: </span> ' + previousSegment;
    }
  }
  playbackInfoStr += '<br><span class="playerMsg">duration: </span>' + player.duration();
  playbackInfoStr += '<br><span class="playerMsg">currentTime: </span>' + player.currentTime().toFixed(2);
  var bufferedRange = player.buffered();
  if (bufferedRange.length > 0) {
    var bufferedStr = timeRangesToString(bufferedRange);
    playbackInfoStr += '<br><span class="playerMsg">buffered: </span>' + bufferedStr;
  }
  playbackInfoStr += '<br><span class="playerMsg">bufferedEnd: </span>' + player.bufferedEnd();
  var seekableRange = player.seekable();
  if (seekableRange.length > 0) {
    var seekableStr = timeRangesToString(seekableRange);
    playbackInfoStr += '<br><span class="playerMsg">seekable: </span>' + seekableStr;
  }
  playbackInfoStr += '<br><span class="playerMsg">playbackRate: </span>' + player.playbackRate();
  if (playlist !== undefined) {
    playbackInfoStr += '<br><span class="playerMsg">current videoBitrate: </span>' + calcVideoBitrate(playlist) + '<span class="playerMsg"> highest: </span>' + highestVideoBitrate + ' kbps' + '<span class="playerMsg"> lowest: </span>' + lowestVideoBitrate + 'kbps';
  }
  if (player.tech_.hls) {
    playbackInfoStr += '<br><span class="playerMsg">current measuredBitrate: </span>' + calcMeasuredBitrate(player.tech_.hls) + '<span class="playerMsg"> highest: </span>' + highestMeasuredBitrate + '<span class="playerMsg"> lowest: </span>' + lowestMeasuredBitrate;
  }
  if (player.tech_.hls && player.tech_.hls.playlists.media_) {
    playbackInfoStr += '<br><span class="playerMsg">Total Segments:</span>' + player.tech_.hls.playlists.media_.segments.length;
    playbackInfoStr += '<br><span class="playerMsg">Current Segments:</span><br>' + loadedSegments(playlist).join('');
  }
  return playbackInfoStr;
};

/* let getMediaInfoStr = (player, mInfo) => {
  let mStr = '';
  if (mInfo != undefined) {
    mStr = '<h3>Mediainfo</h3>';
    mStr += [
          '<span class="playerMsg">Account ID:</span> ' + mInfo.account_id,
          '<span class="playerMsg">Video ID:</span> ' + mInfo.id,
          '<span class="playerMsg">Title:</span> ' + mInfo.name,
          '<span class="playerMsg">Duration:</span> ' + mInfo.duration,
          '<span class="playerMsg">Description:</span> ' + mInfo.description,
          '<span class="playerMsg">Long Description:</span> ' + mInfo.long_description,
          '<span class="playerMsg">Poster:</span> ' +  mInfo.poster,
          '<span class="playerMsg">Thumbnail:</span> ' + mInfo.thumbnail
        ].join('<br>');
    if (mInfo.sources) {
          let sourcesStr = getSourcesStr(mInfo.sources);
          mStr += '<br><span class="playerMsg">Current Source:</span> ' + player.currentSrc();
          mStr += '<br><span class="playerMsg">Master:</span>' + player.tech_.hls.source_.src;
          mStr += '<br><span class="playerMsg">Sources:</span> <br>' + sourcesStr;
        } else {
          mStr = '<span class="playerMsg">Current Source:</span> ' + player.src() + '<br>';
        }
  }
  return mStr;
}
*/

/* let getSourcesStr = (mSrcArray) => {
  let sourcesStr="";
        for (let i=0; i < mSrcArray.length; i++ ) {
          let httpSrc = mSrcArray[i].src;
          if (httpSrc != undefined) {
            sourcesStr += '[' + i + '] ' + httpSrc + '<br>';
          } else {
            let rtmpSrc = mSrcArray[i].app_name + mSrcArray[i].stream_name;
            if (rtmpSrc != undefined) {
              sourcesStr += '[' + i + '] ' + rtmpSrc + '<br>';
            }
          }
        }
  return sourcesStr;
}
*/

var buildPlaybackInfoPane = function buildPlaybackInfoPane(player) {

  // let mediaInfo='', mediaStr='';
  player_ = player;

  // Get information about the player to use in main content
  var playbackInfoStr = getPlaybackInfo(player);

  // mediaInfo = player.mediainfo;
  // mediaStr = getMediaInfoStr(player, mediaInfo);

  var options = {
    'id': IDs.playbackInfo,
    'name': 'Playback Information',
    'content': playbackInfoStr
  };

  playbackInfoPane$1 = new DebuggerPane(player, options);

  return playbackInfoPane$1;
};

var showPlaybackInfo = function showPlaybackInfo(player) {
  var mediaInfo = void 0,
      mediaStr = void 0,
      adStr = void 0,
      srcArray = void 0,
      contentStr = void 0;

  // Get information about the player to use in main content
  var playbackInfoStr = getPlaybackInfo(player);

  // contentStr = playerStr;

  // mediaInfo = player.mediainfo;
  // mediaStr = getMediaInfoStr(player, mediaInfo);

  // contentStr += mediaStr;

  playbackInfoPane$1.content(playbackInfoStr);
};

/**
 * @file buttonBar-button.js
 */

var Button = videojs$1.getComponent('Button');
/**
 * Root button class for Debugger ButtonBar buttons
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends Component
 * @class ButtonBarButton
 */

var ButtonBarButton = function (_Button) {
  inherits(ButtonBarButton, _Button);

  function ButtonBarButton(player, options) {
    classCallCheck(this, ButtonBarButton);

    var _this = possibleConstructorReturn(this, _Button.call(this, player, options));

    _this.el_.id = _this.options_.id;
    _this.el_.className = _this.options_.className;
    _this.el_.innerHTML = _this.options_.content;

    // this.on(['tap','click'], this.handleClick);

    return _this;
  }

  ButtonBarButton.prototype.content = function content(value) {
    if (typeof value !== 'undefined') {
      this.contentEl_.innerHTML = value;
    }
    return this.contentEl_.innerHTML;
  };

  /**
     * Handle click to toggle between open and closed
     *
     * @method handleClick
     */


  ButtonBarButton.prototype.handleClick = function handleClick(event) {};

  return ButtonBarButton;
}(Button);

videojs$1.registerComponent('ButtonBarButton', ButtonBarButton);

/**
 * @file slider-toggle.js
 */

/**
 * Button to toggle slider open / closed
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends Button
 * @class SliderToggle
 */

var SliderToggle = function (_ButtonBarButton) {
  inherits(SliderToggle, _ButtonBarButton);

  function SliderToggle(player, options) {
    classCallCheck(this, SliderToggle);
    return possibleConstructorReturn(this, _ButtonBarButton.call(this, player, options));
  }

  /**
     * Handle click to toggle between open and closed
     *
     * @method handleClick
     */


  SliderToggle.prototype.handleClick = function handleClick() {

    this.el_.classList.toggle('active');
    slider.classList.toggle('closed');
    // toggle closed on debugger window
    if (slider.classList.contains('closed')) {
      this.handleOpen();
    } else {
      this.handleClose();
    }
    // show/hide siblings
    var btnToggleLog = document.getElementById(IDs.btnToggleLog);
    var btnToggleClassList = document.getElementById(IDs.btnToggleClassList);
    var btnToggleAdSettings = document.getElementById(IDs.btnToggleAdSettings);
    var btnTogglePlayerSettings = document.getElementById(IDs.btnTogglePlayerSettings);
    var btnTogglePlayerInfo = document.getElementById(IDs.btnTogglePlaybackInfo);

    btnToggleLog.classList.toggle('hide');
    btnTogglePlaybackInfo.classList.toggle('hide');
    btnToggleClassList.classList.toggle('hide');
    if (btnToggleAdSettings) {
      btnToggleAdSettings.classList.toggle('hide');
    }
    btnTogglePlayerSettings.classList.toggle('hide');
  };

  SliderToggle.prototype.handleOpen = function handleOpen() {
    this.el_.innerHTML = 'Show Debugger';
  };

  SliderToggle.prototype.handleClose = function handleClose() {
    this.el_.innerHTML = 'Hide Debugger';
  };

  return SliderToggle;
}(ButtonBarButton);

videojs$1.registerComponent('SliderToggle', SliderToggle);

/**
 * @file classList-toggle.js
 */

/**
 * Button to toggle the debugger's classList pane open / closed
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends Button
 * @class ClassListToggle
 */

var ClassListToggle = function (_ButtonBarButton) {
  inherits(ClassListToggle, _ButtonBarButton);

  function ClassListToggle(player, options) {
    classCallCheck(this, ClassListToggle);
    return possibleConstructorReturn(this, _ButtonBarButton.call(this, player, options));
  }

  /**
     * Handle click to toggle between open and closed
     *
     * @method handleClick
     */


  ClassListToggle.prototype.handleClick = function handleClick(event) {

    var classesListPane = document.getElementById('classesList');
    var playerSettingsPane = document.getElementById('playerSettings');
    var adSettingsPane = document.getElementById('adSettings');
    var logPane = document.getElementById('myBlackbird');
    var playbackInfoPane = document.getElementById('playbackInfo');

    this.el_.classList.toggle('active');
    classesListPane.classList.toggle('activePane');
    playerSettingsPane.classList.toggle('classListVisible');
    playbackInfoPane.classList.toggle('classListVisible');
    if (adSettingsPane) {
      adSettingsPane.classList.toggle('classListVisible');
    }
    logPane.classList.toggle('classListVisible');
  };

  return ClassListToggle;
}(ButtonBarButton);

videojs$1.registerComponent('ClassListToggle', ClassListToggle);

/**
 * @file playerSettings-toggle.js
 */

/**
 * Button to toggle the debugger's player settings pane open / closed
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends Button
 * @class PlayerSettingsToggle
 */

var PlayerSettingsToggle = function (_ButtonBarButton) {
  inherits(PlayerSettingsToggle, _ButtonBarButton);

  function PlayerSettingsToggle(player, options) {
    classCallCheck(this, PlayerSettingsToggle);
    return possibleConstructorReturn(this, _ButtonBarButton.call(this, player, options));
  }

  /**
     * Handle click to toggle between open and closed
     *
     * @method handleClick
     */


  PlayerSettingsToggle.prototype.handleClick = function handleClick() {

    var logPane = document.getElementById('myBlackbird');
    var playerSettingsPane = document.getElementById('playerSettings');

    this.el_.classList.toggle('active');
    playerSettingsPane.classList.toggle('activePane');
    logPane.classList.toggle('playerSettingsVisible');
  };

  return PlayerSettingsToggle;
}(ButtonBarButton);

videojs$1.registerComponent('PlayerSettingsToggle', PlayerSettingsToggle);

/**
 * @file playbackInfo-toggle.js
 */

/**
 * Button to toggle the debugger's player settings pane open / closed
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends Button
 * @class PlayerSettingsToggle
 */

var PlaybackInfoToggle = function (_ButtonBarButton) {
  inherits(PlaybackInfoToggle, _ButtonBarButton);

  function PlaybackInfoToggle(player, options) {
    classCallCheck(this, PlaybackInfoToggle);
    return possibleConstructorReturn(this, _ButtonBarButton.call(this, player, options));
  }

  /**
     * Handle click to toggle between open and closed
     *
     * @method handleClick
     */


  PlaybackInfoToggle.prototype.handleClick = function handleClick() {

    var logPane = document.getElementById('myBlackbird');
    var playbackInfoPane = document.getElementById('playbackInfo');

    this.el_.classList.toggle('active');
    playbackInfoPane.classList.toggle('activePane');
    logPane.classList.toggle('playbackInfoVisible');
  };

  return PlaybackInfoToggle;
}(ButtonBarButton);

videojs$1.registerComponent('PlaybackInfoToggle', PlaybackInfoToggle);

/**
 * @file adSettings-toggle.js
 */

/**
 * Button to toggle the debugger's ad settings pane open / closed
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends Button
 * @class AdSettingsToggle
 */

var AdSettingsToggle = function (_ButtonBarButton) {
  inherits(AdSettingsToggle, _ButtonBarButton);

  function AdSettingsToggle(player, options) {
    classCallCheck(this, AdSettingsToggle);
    return possibleConstructorReturn(this, _ButtonBarButton.call(this, player, options));
  }

  /**
     * Handle click to toggle between open and closed
     *
     * @method handleClick
     */


  AdSettingsToggle.prototype.handleClick = function handleClick() {

    var logPane = document.getElementById('myBlackbird');
    var adSettingsPane = document.getElementById('adSettings');

    this.el_.classList.toggle('active');
    adSettingsPane.classList.toggle('activePane');
    logPane.classList.toggle('adSettingsVisible');
  };

  return AdSettingsToggle;
}(ButtonBarButton);

videojs$1.registerComponent('AdSettingsToggle', AdSettingsToggle);

/**
 * @file log-toggle.js
 */
/**
 * Button to toggle the debugger's ad settings pane open / closed
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends Button
 * @class DebugLogToggle
 */

var DebugLogToggle = function (_ButtonBarButton) {
  inherits(DebugLogToggle, _ButtonBarButton);

  function DebugLogToggle(player, options) {
    classCallCheck(this, DebugLogToggle);
    return possibleConstructorReturn(this, _ButtonBarButton.call(this, player, options));
  }
  /**
     * Handle click to toggle between open and closed
     *
     * @method handleClick
     */


  DebugLogToggle.prototype.handleClick = function handleClick() {

    var logPane = document.getElementById('myBlackbird');

    this.el_.classList.toggle('active');
    logPane.classList.toggle('activePane');
  };

  return DebugLogToggle;
}(ButtonBarButton);

videojs$1.registerComponent('DebugLogToggle', DebugLogToggle);

// import * as debuggerSettings from './js/debuggerSettings.js';
// Default options for the plugin.
var defaults = {
  verbose: false,
  useLineNums: true,
  logClasses: false,
  logType: 'list',
  logMilliseconds: false,
  showProgress: false,
  showMediaInfo: true,
  showPosterStyles: false,
  showBigPlayButtonStyles: false,
  captureConsole: true,
  startMinimized: false
};

// Cross-compatibility for Video.js 5 and 6.
var registerPlugin = videojs$1.registerPlugin || videojs$1.plugin;
var dom = videojs$1.dom || videojs$1;

var slider$1 = void 0;
var buttonBar = void 0;
var btnToggleLog = void 0;
var btnToggleSlider = void 0;
var adSettings = void 0;
var adSettingsPane = void 0;
var classesListPane = void 0;
var initialDuration = 0;
var previousDuration = 0;
var initialSource = '';
var previousSource = '';
var previousMedia = '';
var currentDuration = void 0;
var currentSource = void 0;
var currentMedia = void 0;
var player = void 0;
var playerTech = '';
var playbackInfoPane = void 0;
var playerSettingsPane = void 0;
var btnToggleClassList = void 0;
var btnTogglePlaybackInfo$1 = void 0;
var btnToggleAdSettings = void 0;
var btnTogglePlayerSettings = void 0;
var logPane = void 0;
// Array of events I came up with by watching debugger window and using documentation
var playerEvents = ['ready', // vidojs_component
'durationchange', // videojs_player, videojs_swf, videojs_contrib_hls
'ended', // videojs_contrib_ads, videojs_player, videojs_swf, videojs_qos
'error', // videojs_player
'firstplay', // videojs_player
'fullscreenchange', // videojs_qos, videojs_player
'loadedalldata', 'loadeddata', // videojs_player, videojs_swf
'loadedmetadata', // videojs_qos, videojs_player, videojs_contrib_hls, videojs_swf
'loadstart', // videojs_qos, videojs_player, videojs_swf
'pause', // videojs_qos, videojs_player, videojs_swf
'play', // videojs_qos, videojs_player, videojs_swf
'player_load', // videojs_bc_analytics
'contentupdate', // videojs_contrib_ads
'seeking', // videojs_player, videojs_swf
'seeked', // videojs_player, videojs_swf
'progress', // videojs_contrib_hls, videojs_player (videojs_swf?)
'catalog_request', // videojs_catalog
'catalog_response', // videojs_catalog
'playing', // videojs_qos, videojs_player, videojs_swf
'waiting', // videojs_player, videojs_swf
'video_view', // videojs_bc_analytics
'video_impression', // videojs_bc_analytics
'video_engagement', // videojs_bc_analytics
'play_request', // videojs_bc_analytics
'canplay', // videojs_player, videojs_swf
'canplaythrough', // videojs_player, videojs_swf
'timeupdate'];
var toggleSlider = function toggleSlider() {
  slider$1.classList.toggle('closed');
  btnToggleSlider.classList.toggle('active');

  btnToggleLog.classList.toggle('hide');
  btnTogglePlaybackInfo$1.classList.toggle('hide');
  btnToggleClassList.classList.toggle('hide');
  btnTogglePlayerSettings.classList.toggle('hide');
  if (_options.debugAds === true) {
    btnToggleAdSettings.classList.toggle('hide');
  }
  if (slider$1.classList.contains('closed')) {
    btnToggleSlider.innerHTML = 'Show Debugger';
  } else {
    btnToggleSlider.innerHTML = 'Hide Debugger';
  }
};

var listenForPlayerEvents = function listenForPlayerEvents(player, options) {

  player.one('durationchange', function (e) {
    currentDuration = player.duration();
    var msgStr = 'currentDuration: ' + currentDuration + '<br>previousDuration: ' + previousDuration;
    logDebug('media', 'playerMsg', 'one: ' + e.type, msgStr);
  });

  var playCounter = 0;
  var msgStr = void 0,
      currentTime = void 0,
      previousTime = void 0,
      levelStr = 'debug';
  for (var _i2 = 0; _i2 < playerEvents.length; _i2++) {
    player.on(playerEvents[_i2], function (e) {
      switch (e.type) {
        case 'error':
          msgStr = [player.error().type, '-', player.error().message, console.trace()].join(' ');
          break;
        case 'firstplay':
          initialDuration = player.duration();
          currentDuration = initialDuration;
          initialSource = player.currentSrc();
          previousSource = initialSource;
          currentTime = player.currentTime();
          msgStr = ['Initial source:' + initialSource, 'Current time: ' + currentTime].join('<br>');
          break;
        case 'play':
          playCounter++;
          msgStr = ['Plays: ' + playCounter, 'Current source: ' + player.currentSrc(), 'Playing from: ' + player.currentTime()].join('<br>');
          break;
        case 'loadedmetadata':
          if (options.showMediaInfo) {
            var mInfo = '';
            mInfo = player.mediainfo;
            if (mInfo != undefined) {
              msgStr = ['Account ID: ' + mInfo.account_id, 'Video ID: ' + mInfo.id, 'Title: ' + mInfo.name, 'Duration: ' + mInfo.duration].join('<br>');
            }
            showPlayerSettings(player);
            showPlaybackInfo(player);
          }
          levelStr = 'media';
          break;
        case 'pause':
          currentTime = player.currentTime();
          msgStr = 'Paused at: ' + currentTime;
          break;
        case 'progress':
          currentTime = player.currentTime();
          msgStr = ['currentTime:', currentTime].join(' ');
          previousTime = currentTime;
          // playbackInfo.showPlaybackInfo(player);
          break;
        case 'contentupdate':
          msgStr = ['oldValue: ' + e.oldValue, 'newValue:' + e.newValue].join('<br>');
          levelStr = 'media';
          break;
        case 'seeking':
          currentTime = player.currentTime();
          msgStr = ['seeking from:' + previousTime, 'to:' + currentTime].join('<br>');
          previousTime = currentTime;
          showPlaybackInfo(player);
          break;
        case 'canplaythrough':
          msgStr = 'currentTime: ' + player.currentTime();
          break;
        case 'timeupdate':
          //   msgStr = 'currentTime: ' + player.currentTime();
          showPlaybackInfo(player);
          showPlayerSettings(player);
          break;
        case 'seeked':
          msgStr = 'currentTime: ' + player.currentTime();
          break;
        case 'catalog_response':
          msgStr = 'url: ' + e.url;
          levelStr = 'media';
          break;
        case 'durationchange':
          {
            var srcStr = void 0,
                mediaStr = void 0,
                assetid = void 0;
            currentDuration = player.duration();
            currentSource = player.currentSrc();

            if (currentDuration !== previousDuration) {
              msgStr = 'currentDuration: ' + currentDuration + ',<br>previousDuration: ' + previousDuration;
              previousDuration = currentDuration;
            } else {
              msgStr = 'Duration remained the same - currentDuration: ' + currentDuration;
            }
            if (playerTech == 'Hls') {
              currentMedia = player.hls.playlists.media_.uri;
              assetid = currentMedia.substring(currentMedia.search('assetId=') + 8, 92);
              if (currentSource !== previousSource) {
                srcStr = '<br>Source changed: currentSource: ' + currentSource + ', <br>previousSource: ' + previousSource;
                previousSource = currentSource;
              } else {
                srcStr = '<br>Source remained same: ' + currentSource;
              }
              if (currentMedia !== previousMedia) {
                mediaStr = '<br>Media (Rendition) changed: currentMedia ' + currentMedia + ', previousMedia: ' + previousMedia;
                previousMedia = currentMedia;
              } else {
                mediaStr = '<br>Media (Rendition) remained same: currentMedia: ' + currentMedia;
              }
              mediaStr += '<br>Bandwidth: ' + player.hls.bandwidth + 'bps';
              mediaStr += '<br>Segment Download time: ' + player.hls.segmentXhrTime + 'ms';
              msgStr = [msgStr, srcStr, mediaStr].join(' ');
              levelStr = 'media';
            }
          }
          break;
        default:
          msgStr = '';
          levelStr = 'debug';
      }
      if (e.type != 'progress' && !options.showProgress && e.type != 'timeupdate') {

        if (options.verbose) {
          logDebug(levelStr, 'playerMsg', e.type, msgStr);
        } else {
          logDebug(levelStr, 'playerMsg', e.type, '');
        }
        msgStr = '';
      }
      if (options.debugAds === true) {
        adSettings.showAdInfo(player);
      }
      refreshPlayerClasses(player);
      // db.updateLogPane(player);
    });
  }
};

// event management (thanks John Resig)
var addEvent = function addEvent(obj1, type, fn) {
  var obj = obj1.constructor === String ? document.getElementById(obj1) : obj1;
  if (obj.attachEvent) {
    obj['e' + type + fn] = fn;
    obj[type + fn] = function () {
      obj['e' + type + fn](window.event);
    };
    obj.attachEvent('on' + type, obj[type + fn]);
  } else {
    obj.addEventListener(type, fn, false);
  }
};

var buildDebugger = function buildDebugger(player, options) {
  slider$1 = dom.createEl('div', { 'id': IDs.slider });
  document.body.appendChild(slider$1);

  buttonBar = buildButtonBar(slider$1, player, options);

  logPane = buildLogPane(player, options);
  if (options.captureConsole) {
    myConsole();
  }
  slider$1.appendChild(logPane.el_);

  // debuggerSettingsPane = debuggerSettings.buildDebuggerSettingsPane(player);
  // slider.insertBefore(debuggerSettingsPane.el_, logPane.el_);

  //  events = (events || player.debuggerWindow.events)(db.toggleVisibility);

  // TypeError cannot reade property 'constructor' of undefined in AdEvent...
  addEvent(IDs.sendEmail, 'click', clickSendEmail);
  addEvent(IDs.copyLog, 'click', clickCopyLog);
  addEvent(IDs.filters, 'click', clickFilter);
  addEvent(IDs.controls, 'click', clickControl);

  classesListPane = buildClassesListPane(player);
  slider$1.insertBefore(classesListPane, logPane.el_);
  playbackInfoPane = buildPlaybackInfoPane(player);
  slider$1.insertBefore(playbackInfoPane.el_, logPane.el_);
  playerSettingsPane = buildPlayerSettingsPane(player);
  slider$1.insertBefore(playerSettingsPane.el_, logPane.el_);

  if (options.debugAds == true) {
    if (player.ima3) {
      console.log('Using IMA3 Ad Plugin');
      adSettings = imaAdSettings;
    } else if (player.FreeWheelPlugin) {
      console.log('Using Freewheel Ad Plugin');
      adSettings = fwAdSettings;
    } else if (player.onceux) {
      console.log('Using OnceUX Ad Plugin');
      adSettings = ssaiAdSettings;
    }
    adSettingsPane = adSettings.buildAdSettingsPane(player, options);
    slider$1.insertBefore(adSettingsPane.el_, playerSettingsPane.el_);
  }
};

var buildButtonBar = function buildButtonBar(slider, player, options) {

  buttonBar = dom.createEl('div', { 'id': IDs.buttonBar });

  slider.appendChild(buttonBar);

  var _options = {
    'id': IDs.btnToggleSlider,
    'className': 'myButton active',
    'content': 'Hide Debugger'
  };

  btnToggleSlider = new SliderToggle(player, _options);

  _options = {
    'id': IDs.btnToggleLog,
    'className': 'myButton active',
    'content': 'Log'
  };

  btnToggleLog = new DebugLogToggle(player, _options);

  _options = {
    'id': IDs.btnTogglePlaybackInfo,
    'className': 'myButton',
    'content': 'Playback Info'
  };

  btnTogglePlaybackInfo$1 = new PlaybackInfoToggle(player, _options);

  _options = {
    'id': IDs.btnToggleClassList,
    'className': 'myButton',
    'content': 'Classes'
  };

  btnToggleClassList = new ClassListToggle(player, _options);
  if (options.debugAds === true) {
    _options = {
      'id': IDs.btnTogglePlayerSettings,
      'className': 'myButton',
      'content': 'Player Settings',
      'debugAds': true
    };
  } else {
    _options = {
      'id': IDs.btnTogglePlayerSettings,
      'className': 'myButton',
      'content': 'Player Settings'
    };
  }

  btnTogglePlayerSettings = new PlayerSettingsToggle(player, _options);

  if (options.debugAds == true) {
    _options = {
      'id': IDs.btnToggleAdSettings,
      'className': 'myButton',
      'content': 'Ad Settings'
    };

    btnToggleAdSettings = new AdSettingsToggle(player, _options);
  }

  /* options = {
    "id": IDs.btnToggleDebuggerSettings,
    "className" : "myButton",
    "content" : "Debugger Settings"
  };
   btnToggleDebuggerSettings = new DebuggerSettingsToggle(player, options);
  */

  buttonBar.appendChild(btnToggleSlider.el_);
  buttonBar.appendChild(btnToggleLog.el_);
  buttonBar.appendChild(btnTogglePlaybackInfo$1.el_);
  buttonBar.appendChild(btnToggleClassList.el_);
  buttonBar.appendChild(btnTogglePlayerSettings.el_);
  if (options.debugAds === true) {
    buttonBar.appendChild(btnToggleAdSettings.el_);
  }
  //    buttonBar.appendChild(btnToggleDebuggerSettings.el_);

  return buttonBar;
};

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player object.
 *
 * @param    {Object} [options={}]
 *           A plain object containing options for the plugin.
 */
var onPlayerReady = function onPlayerReady(player, options) {
  player.addClass('vjs-player-debugger');
  console.log('Brightcove Player Debugger loaded');

  var fontawesome = document.createElement('link');
  fontawesome.rel = 'stylesheet';
  fontawesome.href = '//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css';
  document.body.appendChild(fontawesome);
  if (player.ima3 || player.FreeWheelPlugin || player.onceux) {
    options.debugAds = true;
  }
  if (options.showBigPlayButtonStyles === true) {
    var _bigPlayButtonStyles = document.createElement('div');
    _bigPlayButtonStyles.setAttribute('id', IDs.bigPlayButtonStyles);
    logPane.appendChild(_bigPlayButtonStyles);
  }

  if (options.showPosterStyles === true) {
    var _posterStyles = document.createElement('div');
    _posterStyles.setAttribute('id', IDs.posterStyles);
    logPane.appendChild(_posterStyles);
  }

  if (options.startMinimized) {
    toggleSlider();
  }
  buildDebugger(player, options);
  listenForPlayerEvents(player, options);
  if (options.debugAds === true) {
    adSettings.listenForAdEvents(player);
  }
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function playerDebugger
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
var playerDebugger = function playerDebugger(options) {
  var _this = this;

  this.ready(function () {
    onPlayerReady(_this, videojs$1.mergeOptions(defaults, options));
  });
};

// Register the plugin with video.js.
registerPlugin('playerDebugger', playerDebugger);

// Include the version number.
playerDebugger.VERSION = version;

module.exports = playerDebugger;

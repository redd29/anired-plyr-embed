var player;
function plyrSetup() {
  (document.getElementById('videocontainer').style.display = 'block'),
    window.addEventListener('orientationchange', function () {
      Math.abs(window.orientation) > 45 && Math.abs(window.orientation) < 135
        ? player.fullscreen.enter()
        : player.fullscreen.exit();
    }),
    player.on('seeking', (e) => {
      window.innerWidth < 935 && seekFast();
    }),
    void 0 !== screen.orientation &&
      (player.on('enterfullscreen', (e) => {
        screen.orientation.lock('landscape');
      }),
      player.on('exitfullscreen', (e) => {
        screen.orientation.unlock();
      })),
    player.on('error', (e) => {
      var t = document.getElementsByTagName('video')[0];
      console.log('Error occured, reloading video...'), t.load();
    }),
    document.addEventListener(
      'keyup',
      (e) => {
        e.shiftKey && 'ArrowRight' === e.key && player.forward(80);
      },
      !1
    ),
    player.on('playing', (e) => {
      if (playfirsttime && 'undefined' != typeof Storage) {
        let e = localStorage.getItem(
          'playback-' + window.location.href.split('?')[1]
        );
        null !== e && (player.currentTime = parseFloat(e)),
          (playfirsttime = !1);
      }
    }),
    timeMonitor();
}
document.addEventListener('DOMContentLoaded', () => {
  const e = document.querySelector('video');
  var t = window.location.href.split('?')[1];
  if (!1 === (t = dec64(t))) return void shownotif('URL Invalid');
  if (window.innerWidth > 935 && !('ontouchstart' in window))
    var n = { controls: !0, seek: !0 },
      r = [
        'play-large',
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'settings',
        'pip',
        'airplay',
        'fullscreen',
      ];
  else
    (n = { controls: !1, seek: !0 }),
      (r = [
        'play-large',
        'rewind',
        'play',
        'fast-forward',
        'progress',
        'current-time',
        'duration',
        'settings',
        'pip',
        'airplay',
        'fullscreen',
      ]);
  const o = {
    i18n: {
      play: 'Play (K)',
      pause: 'Pause (K)',
      mute: 'Mute (M)',
      unmute: 'Unmute (M)',
      enterFullscreen: 'Enter fullscreen (F)',
      exitFullscreen: 'Exit fullscreen (F)',
    },
    controls: r,
    tooltips: n,
    seekTime: 5,
    keyboard: { focused: !0, global: !0 },
    fullscreen: { iosNative: !0 },
  };
  if (
    (setTimeout(() => {
      document.getElementById('videocontainer').style.display = 'block';
    }, 5e3),
    Hls.isSupported() && t.includes('.m3u8'))
  ) {
    checkvideo(t);
    const n = new Hls();
    n.loadSource(t),
      n.on(Hls.Events.MANIFEST_PARSED, function (t, r) {
        const i = n.levels.map((e) => e.height).reverse();
        (o.quality = {
          default: i[0],
          options: i,
          forced: !0,
          onChange: (e) => {
            return (
              (t = e),
              void window.hls.levels.forEach((e, n) => {
                e.height === t && (window.hls.currentLevel = n);
              })
            );
            var t;
          },
        }),
          (player = new Plyr(e, o)),
          plyrSetup(),
          (window.hls.currentLevel = -1);
      }),
      n.attachMedia(e),
      (window.hls = n);
  } else
    (player = new Plyr(e, o)),
      plyrSetup(),
      (player.source = { type: 'video', sources: [{ src: t }] });
});
var monitorInterval,
  playfirsttime = !0;
function timeMonitor() {
  'undefined' != typeof Storage &&
    (monitorInterval = setInterval(() => {
      !playfirsttime &&
        player.playing &&
        localStorage.setItem(
          'playback-' + window.location.href.split('html?')[1],
          player.currentTime
        );
    }, 2e3));
}

var seekLastTime,
  seeking = !1;

function seekFast() {
  seeking &&
    seekLastTime < player.currentTime &&
    (player.forward(75), (seeking = !1)),
    (seeking = !0),
    (seekLastTime = player.currentTime),
    setTimeout(() => {
      seeking = !1;
    }, 500);
}
function checkvideo(e) {
  var t = new XMLHttpRequest();
  t.open('GET', e),
    (t.timeout = 5e3),
    (t.onload = function () {
      this.status !== 200 &&
        shownotif('Video expired.<br>Please use another stream', 2e5);
    }),
    (t.onerror = function () {
      shownotif('Video expired.<br>Please use another stream', 2e5);
    }),
    t.send();
}
function shownotif(e, t = 4e5) {
  var n = document.getElementById('notif');
  (n.innerHTML = e),
    (n.style.display = 'block'),
    setTimeout(function () {
      n.style.display = 'none';
    }, t);
}
function dec64(e) {
  if (void 0 === e || '' === e.trim()) return !1;
  try {
    // console.log(atob(e));
    return atob(e);
  } catch (e) {
    return !1;
  }
}

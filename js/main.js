chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('Release.html', {id: 'BSS','width': 1024,'height': 768});
});

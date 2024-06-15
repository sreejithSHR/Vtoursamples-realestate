(function(){
    var script = {
 "mouseWheelEnabled": true,
 "contentOpaque": false,
 "scripts": {
  "keepComponentVisibility": function(component, keep){  var key = 'keepVisibility_' + component.get('id'); var value = this.getKey(key); if(value == undefined && keep) { this.registerKey(key, keep); } else if(value != undefined && !keep) { this.unregisterKey(key); } },
  "startPanoramaWithCamera": function(media, camera){  if(window.currentPanoramasWithCameraChanged != undefined && window.currentPanoramasWithCameraChanged.indexOf(media) != -1){ return; } var playLists = this.getByClassName('PlayList'); if(playLists.length == 0) return; var restoreItems = []; for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media && (item.get('class') == 'PanoramaPlayListItem' || item.get('class') == 'Video360PlayListItem')){ restoreItems.push({camera: item.get('camera'), item: item}); item.set('camera', camera); } } } if(restoreItems.length > 0) { if(window.currentPanoramasWithCameraChanged == undefined) { window.currentPanoramasWithCameraChanged = [media]; } else { window.currentPanoramasWithCameraChanged.push(media); } var restoreCameraOnStop = function(){ var index = window.currentPanoramasWithCameraChanged.indexOf(media); if(index != -1) { window.currentPanoramasWithCameraChanged.splice(index, 1); } for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.set('camera', restoreItems[i].camera); restoreItems[i].item.unbind('stop', restoreCameraOnStop, this); } }; for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.bind('stop', restoreCameraOnStop, this); } } },
  "setCameraSameSpotAsMedia": function(camera, media){  var player = this.getCurrentPlayerWithMedia(media); if(player != undefined) { var position = camera.get('initialPosition'); position.set('yaw', player.get('yaw')); position.set('pitch', player.get('pitch')); position.set('hfov', player.get('hfov')); } },
  "setOverlayBehaviour": function(overlay, media, action){  var executeFunc = function() { switch(action){ case 'triggerClick': this.triggerOverlay(overlay, 'click'); break; case 'stop': case 'play': case 'pause': overlay[action](); break; case 'togglePlayPause': case 'togglePlayStop': if(overlay.get('state') == 'playing') overlay[action == 'togglePlayPause' ? 'pause' : 'stop'](); else overlay.play(); break; } if(window.overlaysDispatched == undefined) window.overlaysDispatched = {}; var id = overlay.get('id'); window.overlaysDispatched[id] = true; setTimeout(function(){ delete window.overlaysDispatched[id]; }, 2000); }; if(window.overlaysDispatched != undefined && overlay.get('id') in window.overlaysDispatched) return; var playList = this.getPlayListWithMedia(media, true); if(playList != undefined){ var item = this.getPlayListItemByMedia(playList, media); if(playList.get('items').indexOf(item) != playList.get('selectedIndex')){ var beginFunc = function(e){ item.unbind('begin', beginFunc, this); executeFunc.call(this); }; item.bind('begin', beginFunc, this); return; } } executeFunc.call(this); },
  "shareFacebook": function(url){  window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank'); },
  "showPopupPanoramaVideoOverlay": function(popupPanoramaOverlay, closeButtonProperties, stopAudios){  var self = this; var showEndFunction = function() { popupPanoramaOverlay.unbind('showEnd', showEndFunction); closeButton.bind('click', hideFunction, this); setCloseButtonPosition(); closeButton.set('visible', true); }; var endFunction = function() { if(!popupPanoramaOverlay.get('loop')) hideFunction(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); popupPanoramaOverlay.set('visible', false); closeButton.set('visible', false); closeButton.unbind('click', hideFunction, self); popupPanoramaOverlay.unbind('end', endFunction, self); popupPanoramaOverlay.unbind('hideEnd', hideFunction, self, true); self.resumePlayers(playersPaused, true); if(stopAudios) { self.resumeGlobalAudios(); } }; var setCloseButtonPosition = function() { var right = 10; var top = 10; closeButton.set('right', right); closeButton.set('top', top); }; this.MainViewer.set('toolTipEnabled', false); var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(true); if(stopAudios) { this.pauseGlobalAudios(); } popupPanoramaOverlay.bind('end', endFunction, this, true); popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); popupPanoramaOverlay.bind('hideEnd', hideFunction, this, true); popupPanoramaOverlay.set('visible', true); },
  "triggerOverlay": function(overlay, eventName){  if(overlay.get('areas') != undefined) { var areas = overlay.get('areas'); for(var i = 0; i<areas.length; ++i) { areas[i].trigger(eventName); } } else { overlay.trigger(eventName); } },
  "initGA": function(){  var sendFunc = function(category, event, label) { ga('send', 'event', category, event, label); }; var media = this.getByClassName('Panorama'); media = media.concat(this.getByClassName('Video360')); media = media.concat(this.getByClassName('Map')); for(var i = 0, countI = media.length; i<countI; ++i){ var m = media[i]; var mediaLabel = m.get('label'); var overlays = this.getOverlays(m); for(var j = 0, countJ = overlays.length; j<countJ; ++j){ var overlay = overlays[j]; var overlayLabel = overlay.get('data') != undefined ? mediaLabel + ' - ' + overlay.get('data')['label'] : mediaLabel; switch(overlay.get('class')) { case 'HotspotPanoramaOverlay': case 'HotspotMapOverlay': var areas = overlay.get('areas'); for (var z = 0; z<areas.length; ++z) { areas[z].bind('click', sendFunc.bind(this, 'Hotspot', 'click', overlayLabel), this); } break; case 'CeilingCapPanoramaOverlay': case 'TripodCapPanoramaOverlay': overlay.bind('click', sendFunc.bind(this, 'Cap', 'click', overlayLabel), this); break; } } } var components = this.getByClassName('Button'); components = components.concat(this.getByClassName('IconButton')); for(var i = 0, countI = components.length; i<countI; ++i){ var c = components[i]; var componentLabel = c.get('data')['name']; c.bind('click', sendFunc.bind(this, 'Skin', 'click', componentLabel), this); } var items = this.getByClassName('PlayListItem'); var media2Item = {}; for(var i = 0, countI = items.length; i<countI; ++i) { var item = items[i]; var media = item.get('media'); if(!(media.get('id') in media2Item)) { item.bind('begin', sendFunc.bind(this, 'Media', 'play', media.get('label')), this); media2Item[media.get('id')] = item; } } },
  "getMediaByName": function(name){  var list = this.getByClassName('Media'); for(var i = 0, count = list.length; i<count; ++i){ var media = list[i]; if((media.get('class') == 'Audio' && media.get('data').label == name) || media.get('label') == name){ return media; } } return undefined; },
  "getCurrentPlayers": function(){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); return players; },
  "existsKey": function(key){  return key in window; },
  "unregisterKey": function(key){  delete window[key]; },
  "playAudioList": function(audios){  if(audios.length == 0) return; var currentAudioCount = -1; var currentAudio; var playGlobalAudioFunction = this.playGlobalAudio; var playNext = function(){ if(++currentAudioCount >= audios.length) currentAudioCount = 0; currentAudio = audios[currentAudioCount]; playGlobalAudioFunction(currentAudio, playNext); }; playNext(); },
  "setStartTimeVideoSync": function(video, player){  this.setStartTimeVideo(video, player.get('currentTime')); },
  "pauseGlobalAudiosWhilePlayItem": function(playList, index, exclude){  var self = this; var item = playList.get('items')[index]; var media = item.get('media'); var player = item.get('player'); var caller = media.get('id'); var endFunc = function(){ if(playList.get('selectedIndex') != index) { if(hasState){ player.unbind('stateChange', stateChangeFunc, self); } self.resumeGlobalAudios(caller); } }; var stateChangeFunc = function(event){ var state = event.data.state; if(state == 'stopped'){ this.resumeGlobalAudios(caller); } else if(state == 'playing'){ this.pauseGlobalAudios(caller, exclude); } }; var mediaClass = media.get('class'); var hasState = mediaClass == 'Video360' || mediaClass == 'Video'; if(hasState){ player.bind('stateChange', stateChangeFunc, this); } this.pauseGlobalAudios(caller, exclude); this.executeFunctionWhenChange(playList, index, endFunc, endFunc); },
  "updateMediaLabelFromPlayList": function(playList, htmlText, playListItemStopToDispose){  var changeFunction = function(){ var index = playList.get('selectedIndex'); if(index >= 0){ var beginFunction = function(){ playListItem.unbind('begin', beginFunction); setMediaLabel(index); }; var setMediaLabel = function(index){ var media = playListItem.get('media'); var text = media.get('data'); if(!text) text = media.get('label'); setHtml(text); }; var setHtml = function(text){ if(text !== undefined) { htmlText.set('html', '<div style=\"text-align:left\"><SPAN STYLE=\"color:#FFFFFF;font-size:12px;font-family:Verdana\"><span color=\"white\" font-family=\"Verdana\" font-size=\"12px\">' + text + '</SPAN></div>'); } else { htmlText.set('html', ''); } }; var playListItem = playList.get('items')[index]; if(htmlText.get('html')){ setHtml('Loading...'); playListItem.bind('begin', beginFunction); } else{ setMediaLabel(index); } } }; var disposeFunction = function(){ htmlText.set('html', undefined); playList.unbind('change', changeFunction, this); playListItemStopToDispose.unbind('stop', disposeFunction, this); }; if(playListItemStopToDispose){ playListItemStopToDispose.bind('stop', disposeFunction, this); } playList.bind('change', changeFunction, this); changeFunction(); },
  "changePlayListWithSameSpot": function(playList, newIndex){  var currentIndex = playList.get('selectedIndex'); if (currentIndex >= 0 && newIndex >= 0 && currentIndex != newIndex) { var currentItem = playList.get('items')[currentIndex]; var newItem = playList.get('items')[newIndex]; var currentPlayer = currentItem.get('player'); var newPlayer = newItem.get('player'); if ((currentPlayer.get('class') == 'PanoramaPlayer' || currentPlayer.get('class') == 'Video360Player') && (newPlayer.get('class') == 'PanoramaPlayer' || newPlayer.get('class') == 'Video360Player')) { var newCamera = this.cloneCamera(newItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, currentItem.get('media')); this.startPanoramaWithCamera(newItem.get('media'), newCamera); } } },
  "showComponentsWhileMouseOver": function(parentComponent, components, durationVisibleWhileOut){  var setVisibility = function(visible){ for(var i = 0, length = components.length; i<length; i++){ var component = components[i]; if(component.get('class') == 'HTMLText' && (component.get('html') == '' || component.get('html') == undefined)) { continue; } component.set('visible', visible); } }; if (this.rootPlayer.get('touchDevice') == true){ setVisibility(true); } else { var timeoutID = -1; var rollOverFunction = function(){ setVisibility(true); if(timeoutID >= 0) clearTimeout(timeoutID); parentComponent.unbind('rollOver', rollOverFunction, this); parentComponent.bind('rollOut', rollOutFunction, this); }; var rollOutFunction = function(){ var timeoutFunction = function(){ setVisibility(false); parentComponent.unbind('rollOver', rollOverFunction, this); }; parentComponent.unbind('rollOut', rollOutFunction, this); parentComponent.bind('rollOver', rollOverFunction, this); timeoutID = setTimeout(timeoutFunction, durationVisibleWhileOut); }; parentComponent.bind('rollOver', rollOverFunction, this); } },
  "setMainMediaByIndex": function(index){  var item = undefined; if(index >= 0 && index < this.mainPlayList.get('items').length){ this.mainPlayList.set('selectedIndex', index); item = this.mainPlayList.get('items')[index]; } return item; },
  "playGlobalAudioWhilePlay": function(playList, index, audio, endCallback){  var changeFunction = function(event){ if(event.data.previousSelectedIndex == index){ this.stopGlobalAudio(audio); if(isPanorama) { var media = playListItem.get('media'); var audios = media.get('audios'); audios.splice(audios.indexOf(audio), 1); media.set('audios', audios); } playList.unbind('change', changeFunction, this); if(endCallback) endCallback(); } }; var audios = window.currentGlobalAudios; if(audios && audio.get('id') in audios){ audio = audios[audio.get('id')]; if(audio.get('state') != 'playing'){ audio.play(); } return audio; } playList.bind('change', changeFunction, this); var playListItem = playList.get('items')[index]; var isPanorama = playListItem.get('class') == 'PanoramaPlayListItem'; if(isPanorama) { var media = playListItem.get('media'); var audios = (media.get('audios') || []).slice(); if(audio.get('class') == 'MediaAudio') { var panoramaAudio = this.rootPlayer.createInstance('PanoramaAudio'); panoramaAudio.set('autoplay', false); panoramaAudio.set('audio', audio.get('audio')); panoramaAudio.set('loop', audio.get('loop')); panoramaAudio.set('id', audio.get('id')); var stateChangeFunctions = audio.getBindings('stateChange'); for(var i = 0; i<stateChangeFunctions.length; ++i){ var f = stateChangeFunctions[i]; if(typeof f == 'string') f = new Function('event', f); panoramaAudio.bind('stateChange', f, this); } audio = panoramaAudio; } audios.push(audio); media.set('audios', audios); } return this.playGlobalAudio(audio, endCallback); },
  "stopAndGoCamera": function(camera, ms){  var sequence = camera.get('initialSequence'); sequence.pause(); var timeoutFunction = function(){ sequence.play(); }; setTimeout(timeoutFunction, ms); },
  "setPanoramaCameraWithCurrentSpot": function(playListItem){  var currentPlayer = this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer == undefined){ return; } var playerClass = currentPlayer.get('class'); if(playerClass != 'PanoramaPlayer' && playerClass != 'Video360Player'){ return; } var fromMedia = currentPlayer.get('panorama'); if(fromMedia == undefined) { fromMedia = currentPlayer.get('video'); } var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, fromMedia); this.startPanoramaWithCamera(panorama, newCamera); },
  "getActivePlayerWithViewer": function(viewerArea){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); players = players.concat(this.getByClassName('MapPlayer')); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('viewerArea') == viewerArea) { var playerClass = player.get('class'); if(playerClass == 'PanoramaPlayer' && (player.get('panorama') != undefined || player.get('video') != undefined)) return player; else if((playerClass == 'VideoPlayer' || playerClass == 'Video360Player') && player.get('video') != undefined) return player; else if(playerClass == 'PhotoAlbumPlayer' && player.get('photoAlbum') != undefined) return player; else if(playerClass == 'MapPlayer' && player.get('map') != undefined) return player; } } return undefined; },
  "setEndToItemIndex": function(playList, fromIndex, toIndex){  var endFunction = function(){ if(playList.get('selectedIndex') == fromIndex) playList.set('selectedIndex', toIndex); }; this.executeFunctionWhenChange(playList, fromIndex, endFunction); },
  "autotriggerAtStart": function(playList, callback, once){  var onChange = function(event){ callback(); if(once == true) playList.unbind('change', onChange, this); }; playList.bind('change', onChange, this); },
  "showWindow": function(w, autoCloseMilliSeconds, containsAudio){  if(w.get('visible') == true){ return; } var closeFunction = function(){ clearAutoClose(); this.resumePlayers(playersPaused, !containsAudio); w.unbind('close', closeFunction, this); }; var clearAutoClose = function(){ w.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ w.hide(); }; w.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } var playersPaused = this.pauseCurrentPlayers(!containsAudio); w.bind('close', closeFunction, this); w.show(this, true); },
  "historyGoForward": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.forward(); } },
  "shareTwitter": function(url){  window.open('https://twitter.com/intent/tweet?source=webclient&url=' + url, '_blank'); },
  "getMediaWidth": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxW=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('width') > maxW) maxW = r.get('width'); } return maxW; }else{ return r.get('width') } default: return media.get('width'); } },
  "setMainMediaByName": function(name){  var items = this.mainPlayList.get('items'); for(var i = 0; i<items.length; ++i){ var item = items[i]; if(item.get('media').get('label') == name) { this.mainPlayList.set('selectedIndex', i); return item; } } },
  "historyGoBack": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.back(); } },
  "loadFromCurrentMediaPlayList": function(playList, delta){  var currentIndex = playList.get('selectedIndex'); var totalItems = playList.get('items').length; var newIndex = (currentIndex + delta) % totalItems; while(newIndex < 0){ newIndex = totalItems + newIndex; }; if(currentIndex != newIndex){ playList.set('selectedIndex', newIndex); } },
  "showPopupImage": function(image, toggleImage, customWidth, customHeight, showEffect, hideEffect, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedCallback, hideCallback){  var self = this; var closed = false; var playerClickFunction = function() { zoomImage.unbind('loaded', loadedFunction, self); hideFunction(); }; var clearAutoClose = function(){ zoomImage.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var resizeFunction = function(){ setTimeout(setCloseButtonPosition, 0); }; var loadedFunction = function(){ self.unbind('click', playerClickFunction, self); veil.set('visible', true); setCloseButtonPosition(); closeButton.set('visible', true); zoomImage.unbind('loaded', loadedFunction, this); zoomImage.bind('userInteractionStart', userInteractionStartFunction, this); zoomImage.bind('userInteractionEnd', userInteractionEndFunction, this); zoomImage.bind('resize', resizeFunction, this); timeoutID = setTimeout(timeoutFunction, 200); }; var timeoutFunction = function(){ timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ hideFunction(); }; zoomImage.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } zoomImage.bind('backgroundClick', hideFunction, this); if(toggleImage) { zoomImage.bind('click', toggleFunction, this); zoomImage.set('imageCursor', 'hand'); } closeButton.bind('click', hideFunction, this); if(loadedCallback) loadedCallback(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); closed = true; if(timeoutID) clearTimeout(timeoutID); if (timeoutUserInteractionID) clearTimeout(timeoutUserInteractionID); if(autoCloseMilliSeconds) clearAutoClose(); if(hideCallback) hideCallback(); zoomImage.set('visible', false); if(hideEffect && hideEffect.get('duration') > 0){ hideEffect.bind('end', endEffectFunction, this); } else{ zoomImage.set('image', null); } closeButton.set('visible', false); veil.set('visible', false); self.unbind('click', playerClickFunction, self); zoomImage.unbind('backgroundClick', hideFunction, this); zoomImage.unbind('userInteractionStart', userInteractionStartFunction, this); zoomImage.unbind('userInteractionEnd', userInteractionEndFunction, this, true); zoomImage.unbind('resize', resizeFunction, this); if(toggleImage) { zoomImage.unbind('click', toggleFunction, this); zoomImage.set('cursor', 'default'); } closeButton.unbind('click', hideFunction, this); self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } }; var endEffectFunction = function() { zoomImage.set('image', null); hideEffect.unbind('end', endEffectFunction, this); }; var toggleFunction = function() { zoomImage.set('image', isToggleVisible() ? image : toggleImage); }; var isToggleVisible = function() { return zoomImage.get('image') == toggleImage; }; var setCloseButtonPosition = function() { var right = zoomImage.get('actualWidth') - zoomImage.get('imageLeft') - zoomImage.get('imageWidth') + 10; var top = zoomImage.get('imageTop') + 10; if(right < 10) right = 10; if(top < 10) top = 10; closeButton.set('right', right); closeButton.set('top', top); }; var userInteractionStartFunction = function() { if(timeoutUserInteractionID){ clearTimeout(timeoutUserInteractionID); timeoutUserInteractionID = undefined; } else{ closeButton.set('visible', false); } }; var userInteractionEndFunction = function() { if(!closed){ timeoutUserInteractionID = setTimeout(userInteractionTimeoutFunction, 300); } }; var userInteractionTimeoutFunction = function() { timeoutUserInteractionID = undefined; closeButton.set('visible', true); setCloseButtonPosition(); }; this.MainViewer.set('toolTipEnabled', false); var veil = this.veilPopupPanorama; var zoomImage = this.zoomImagePopupPanorama; var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } var timeoutID = undefined; var timeoutUserInteractionID = undefined; zoomImage.bind('loaded', loadedFunction, this); setTimeout(function(){ self.bind('click', playerClickFunction, self, false); }, 0); zoomImage.set('image', image); zoomImage.set('customWidth', customWidth); zoomImage.set('customHeight', customHeight); zoomImage.set('showEffect', showEffect); zoomImage.set('hideEffect', hideEffect); zoomImage.set('visible', true); return zoomImage; },
  "getPixels": function(value){  var result = new RegExp('((\\+|\\-)?\\d+(\\.\\d*)?)(px|vw|vh|vmin|vmax)?', 'i').exec(value); if (result == undefined) { return 0; } var num = parseFloat(result[1]); var unit = result[4]; var vw = this.rootPlayer.get('actualWidth') / 100; var vh = this.rootPlayer.get('actualHeight') / 100; switch(unit) { case 'vw': return num * vw; case 'vh': return num * vh; case 'vmin': return num * Math.min(vw, vh); case 'vmax': return num * Math.max(vw, vh); default: return num; } },
  "getGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios != undefined && audio.get('id') in audios){ audio = audios[audio.get('id')]; } return audio; },
  "getPlayListWithMedia": function(media, onlySelected){  var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(onlySelected && playList.get('selectedIndex') == -1) continue; if(this.getPlayListItemByMedia(playList, media) != undefined) return playList; } return undefined; },
  "init": function(){  if(!Object.hasOwnProperty('values')) { Object.values = function(o){ return Object.keys(o).map(function(e) { return o[e]; }); }; } var history = this.get('data')['history']; var playListChangeFunc = function(e){ var playList = e.source; var index = playList.get('selectedIndex'); if(index < 0) return; var id = playList.get('id'); if(!history.hasOwnProperty(id)) history[id] = new HistoryData(playList); history[id].add(index); }; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i) { var playList = playLists[i]; playList.bind('change', playListChangeFunc, this); } },
  "stopGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; if(audio){ delete audios[audio.get('id')]; if(Object.keys(audios).length == 0){ window.currentGlobalAudios = undefined; } } } if(audio) audio.stop(); },
  "fixTogglePlayPauseButton": function(player){  var state = player.get('state'); var buttons = player.get('buttonPlayPause'); if(typeof buttons !== 'undefined' && player.get('state') == 'playing'){ if(!Array.isArray(buttons)) buttons = [buttons]; for(var i = 0; i<buttons.length; ++i) buttons[i].set('pressed', true); } },
  "pauseGlobalAudios": function(caller, exclude){  if (window.pauseGlobalAudiosState == undefined) window.pauseGlobalAudiosState = {}; if (window.pauseGlobalAudiosList == undefined) window.pauseGlobalAudiosList = []; if (caller in window.pauseGlobalAudiosState) { return; } var audios = this.getByClassName('Audio').concat(this.getByClassName('VideoPanoramaOverlay')); if (window.currentGlobalAudios != undefined) audios = audios.concat(Object.values(window.currentGlobalAudios)); var audiosPaused = []; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = 0; j<objAudios.length; ++j) { var a = objAudios[j]; if(audiosPaused.indexOf(a) == -1) audiosPaused.push(a); } } window.pauseGlobalAudiosState[caller] = audiosPaused; for (var i = 0, count = audios.length; i < count; ++i) { var a = audios[i]; if (a.get('state') == 'playing' && (exclude == undefined || exclude.indexOf(a) == -1)) { a.pause(); audiosPaused.push(a); } } },
  "resumeGlobalAudios": function(caller){  if (window.pauseGlobalAudiosState == undefined || !(caller in window.pauseGlobalAudiosState)) return; var audiosPaused = window.pauseGlobalAudiosState[caller]; delete window.pauseGlobalAudiosState[caller]; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = audiosPaused.length-1; j>=0; --j) { var a = audiosPaused[j]; if(objAudios.indexOf(a) != -1) audiosPaused.splice(j, 1); } } for (var i = 0, count = audiosPaused.length; i<count; ++i) { var a = audiosPaused[i]; if (a.get('state') == 'paused') a.play(); } },
  "loopAlbum": function(playList, index){  var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var loopFunction = function(){ player.play(); }; this.executeFunctionWhenChange(playList, index, loopFunction); },
  "cloneCamera": function(camera){  var newCamera = this.rootPlayer.createInstance(camera.get('class')); newCamera.set('id', camera.get('id') + '_copy'); newCamera.set('idleSequence', camera.get('initialSequence')); return newCamera; },
  "showPopupPanoramaOverlay": function(popupPanoramaOverlay, closeButtonProperties, imageHD, toggleImage, toggleImageHD, autoCloseMilliSeconds, audio, stopBackgroundAudio){  var self = this; this.MainViewer.set('toolTipEnabled', false); var cardboardEnabled = this.isCardboardViewMode(); if(!cardboardEnabled) { var zoomImage = this.zoomImagePopupPanorama; var showDuration = popupPanoramaOverlay.get('showDuration'); var hideDuration = popupPanoramaOverlay.get('hideDuration'); var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); var popupMaxWidthBackup = popupPanoramaOverlay.get('popupMaxWidth'); var popupMaxHeightBackup = popupPanoramaOverlay.get('popupMaxHeight'); var showEndFunction = function() { var loadedFunction = function(){ if(!self.isCardboardViewMode()) popupPanoramaOverlay.set('visible', false); }; popupPanoramaOverlay.unbind('showEnd', showEndFunction, self); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', 1); self.showPopupImage(imageHD, toggleImageHD, popupPanoramaOverlay.get('popupMaxWidth'), popupPanoramaOverlay.get('popupMaxHeight'), null, null, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedFunction, hideFunction); }; var hideFunction = function() { var restoreShowDurationFunction = function(){ popupPanoramaOverlay.unbind('showEnd', restoreShowDurationFunction, self); popupPanoramaOverlay.set('visible', false); popupPanoramaOverlay.set('showDuration', showDuration); popupPanoramaOverlay.set('popupMaxWidth', popupMaxWidthBackup); popupPanoramaOverlay.set('popupMaxHeight', popupMaxHeightBackup); }; self.resumePlayers(playersPaused, audio == null || !stopBackgroundAudio); var currentWidth = zoomImage.get('imageWidth'); var currentHeight = zoomImage.get('imageHeight'); popupPanoramaOverlay.bind('showEnd', restoreShowDurationFunction, self, true); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', hideDuration); popupPanoramaOverlay.set('popupMaxWidth', currentWidth); popupPanoramaOverlay.set('popupMaxHeight', currentHeight); if(popupPanoramaOverlay.get('visible')) restoreShowDurationFunction(); else popupPanoramaOverlay.set('visible', true); self.MainViewer.set('toolTipEnabled', true); }; if(!imageHD){ imageHD = popupPanoramaOverlay.get('image'); } if(!toggleImageHD && toggleImage){ toggleImageHD = toggleImage; } popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); } else { var hideEndFunction = function() { self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } popupPanoramaOverlay.unbind('hideEnd', hideEndFunction, self); self.MainViewer.set('toolTipEnabled', true); }; var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } popupPanoramaOverlay.bind('hideEnd', hideEndFunction, this, true); } popupPanoramaOverlay.set('visible', true); },
  "getMediaFromPlayer": function(player){  switch(player.get('class')){ case 'PanoramaPlayer': return player.get('panorama') || player.get('video'); case 'VideoPlayer': case 'Video360Player': return player.get('video'); case 'PhotoAlbumPlayer': return player.get('photoAlbum'); case 'MapPlayer': return player.get('map'); } },
  "changeBackgroundWhilePlay": function(playList, index, color){  var stopFunction = function(event){ playListItem.unbind('stop', stopFunction, this); if((color == viewerArea.get('backgroundColor')) && (colorRatios == viewerArea.get('backgroundColorRatios'))){ viewerArea.set('backgroundColor', backgroundColorBackup); viewerArea.set('backgroundColorRatios', backgroundColorRatiosBackup); } }; var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var viewerArea = player.get('viewerArea'); var backgroundColorBackup = viewerArea.get('backgroundColor'); var backgroundColorRatiosBackup = viewerArea.get('backgroundColorRatios'); var colorRatios = [0]; if((color != backgroundColorBackup) || (colorRatios != backgroundColorRatiosBackup)){ viewerArea.set('backgroundColor', color); viewerArea.set('backgroundColorRatios', colorRatios); playListItem.bind('stop', stopFunction, this); } },
  "showPopupMedia": function(w, media, playList, popupMaxWidth, popupMaxHeight, autoCloseWhenFinished, stopAudios){  var self = this; var closeFunction = function(){ playList.set('selectedIndex', -1); self.MainViewer.set('toolTipEnabled', true); if(stopAudios) { self.resumeGlobalAudios(); } this.resumePlayers(playersPaused, !stopAudios); if(isVideo) { this.unbind('resize', resizeFunction, this); } w.unbind('close', closeFunction, this); }; var endFunction = function(){ w.hide(); }; var resizeFunction = function(){ var getWinValue = function(property){ return w.get(property) || 0; }; var parentWidth = self.get('actualWidth'); var parentHeight = self.get('actualHeight'); var mediaWidth = self.getMediaWidth(media); var mediaHeight = self.getMediaHeight(media); var popupMaxWidthNumber = parseFloat(popupMaxWidth) / 100; var popupMaxHeightNumber = parseFloat(popupMaxHeight) / 100; var windowWidth = popupMaxWidthNumber * parentWidth; var windowHeight = popupMaxHeightNumber * parentHeight; var footerHeight = getWinValue('footerHeight'); var headerHeight = getWinValue('headerHeight'); if(!headerHeight) { var closeButtonHeight = getWinValue('closeButtonIconHeight') + getWinValue('closeButtonPaddingTop') + getWinValue('closeButtonPaddingBottom'); var titleHeight = self.getPixels(getWinValue('titleFontSize')) + getWinValue('titlePaddingTop') + getWinValue('titlePaddingBottom'); headerHeight = closeButtonHeight > titleHeight ? closeButtonHeight : titleHeight; headerHeight += getWinValue('headerPaddingTop') + getWinValue('headerPaddingBottom'); } var contentWindowWidth = windowWidth - getWinValue('bodyPaddingLeft') - getWinValue('bodyPaddingRight') - getWinValue('paddingLeft') - getWinValue('paddingRight'); var contentWindowHeight = windowHeight - headerHeight - footerHeight - getWinValue('bodyPaddingTop') - getWinValue('bodyPaddingBottom') - getWinValue('paddingTop') - getWinValue('paddingBottom'); var parentAspectRatio = contentWindowWidth / contentWindowHeight; var mediaAspectRatio = mediaWidth / mediaHeight; if(parentAspectRatio > mediaAspectRatio) { windowWidth = contentWindowHeight * mediaAspectRatio + getWinValue('bodyPaddingLeft') + getWinValue('bodyPaddingRight') + getWinValue('paddingLeft') + getWinValue('paddingRight'); } else { windowHeight = contentWindowWidth / mediaAspectRatio + headerHeight + footerHeight + getWinValue('bodyPaddingTop') + getWinValue('bodyPaddingBottom') + getWinValue('paddingTop') + getWinValue('paddingBottom'); } if(windowWidth > parentWidth * popupMaxWidthNumber) { windowWidth = parentWidth * popupMaxWidthNumber; } if(windowHeight > parentHeight * popupMaxHeightNumber) { windowHeight = parentHeight * popupMaxHeightNumber; } w.set('width', windowWidth); w.set('height', windowHeight); w.set('x', (parentWidth - getWinValue('actualWidth')) * 0.5); w.set('y', (parentHeight - getWinValue('actualHeight')) * 0.5); }; if(autoCloseWhenFinished){ this.executeFunctionWhenChange(playList, 0, endFunction); } var mediaClass = media.get('class'); var isVideo = mediaClass == 'Video' || mediaClass == 'Video360'; playList.set('selectedIndex', 0); if(isVideo){ this.bind('resize', resizeFunction, this); resizeFunction(); playList.get('items')[0].get('player').play(); } else { w.set('width', popupMaxWidth); w.set('height', popupMaxHeight); } this.MainViewer.set('toolTipEnabled', false); if(stopAudios) { this.pauseGlobalAudios(); } var playersPaused = this.pauseCurrentPlayers(!stopAudios); w.bind('close', closeFunction, this); w.show(this, true); },
  "executeFunctionWhenChange": function(playList, index, endFunction, changeFunction){  var endObject = undefined; var changePlayListFunction = function(event){ if(event.data.previousSelectedIndex == index){ if(changeFunction) changeFunction.call(this); if(endFunction && endObject) endObject.unbind('end', endFunction, this); playList.unbind('change', changePlayListFunction, this); } }; if(endFunction){ var playListItem = playList.get('items')[index]; if(playListItem.get('class') == 'PanoramaPlayListItem'){ var camera = playListItem.get('camera'); if(camera != undefined) endObject = camera.get('initialSequence'); if(endObject == undefined) endObject = camera.get('idleSequence'); } else{ endObject = playListItem.get('media'); } if(endObject){ endObject.bind('end', endFunction, this); } } playList.bind('change', changePlayListFunction, this); },
  "updateVideoCues": function(playList, index){  var playListItem = playList.get('items')[index]; var video = playListItem.get('media'); if(video.get('cues').length == 0) return; var player = playListItem.get('player'); var cues = []; var changeFunction = function(){ if(playList.get('selectedIndex') != index){ video.unbind('cueChange', cueChangeFunction, this); playList.unbind('change', changeFunction, this); } }; var cueChangeFunction = function(event){ var activeCues = event.data.activeCues; for(var i = 0, count = cues.length; i<count; ++i){ var cue = cues[i]; if(activeCues.indexOf(cue) == -1 && (cue.get('startTime') > player.get('currentTime') || cue.get('endTime') < player.get('currentTime')+0.5)){ cue.trigger('end'); } } cues = activeCues; }; video.bind('cueChange', cueChangeFunction, this); playList.bind('change', changeFunction, this); },
  "visibleComponentsIfPlayerFlagEnabled": function(components, playerFlag){  var enabled = this.get(playerFlag); for(var i in components){ components[i].set('visible', enabled); } },
  "registerKey": function(key, value){  window[key] = value; },
  "isCardboardViewMode": function(){  var players = this.getByClassName('PanoramaPlayer'); return players.length > 0 && players[0].get('viewMode') == 'cardboard'; },
  "getPlayListItems": function(media, player){  var itemClass = (function() { switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': return 'PanoramaPlayListItem'; case 'Video360': return 'Video360PlayListItem'; case 'PhotoAlbum': return 'PhotoAlbumPlayListItem'; case 'Map': return 'MapPlayListItem'; case 'Video': return 'VideoPlayListItem'; } })(); if (itemClass != undefined) { var items = this.getByClassName(itemClass); for (var i = items.length-1; i>=0; --i) { var item = items[i]; if(item.get('media') != media || (player != undefined && item.get('player') != player)) { items.splice(i, 1); } } return items; } else { return []; } },
  "pauseCurrentPlayers": function(onlyPauseCameraIfPanorama){  var players = this.getCurrentPlayers(); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('state') == 'playing') { if(onlyPauseCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.pauseCamera(); } else { player.pause(); } } else { players.splice(i, 1); } } return players; },
  "getKey": function(key){  return window[key]; },
  "getCurrentPlayerWithMedia": function(media){  var playerClass = undefined; var mediaPropertyName = undefined; switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'panorama'; break; case 'Video360': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'video'; break; case 'PhotoAlbum': playerClass = 'PhotoAlbumPlayer'; mediaPropertyName = 'photoAlbum'; break; case 'Map': playerClass = 'MapPlayer'; mediaPropertyName = 'map'; break; case 'Video': playerClass = 'VideoPlayer'; mediaPropertyName = 'video'; break; }; if(playerClass != undefined) { var players = this.getByClassName(playerClass); for(var i = 0; i<players.length; ++i){ var player = players[i]; if(player.get(mediaPropertyName) == media) { return player; } } } else { return undefined; } },
  "playGlobalAudio": function(audio, endCallback){  var endFunction = function(){ audio.unbind('end', endFunction, this); this.stopGlobalAudio(audio); if(endCallback) endCallback(); }; audio = this.getGlobalAudio(audio); var audios = window.currentGlobalAudios; if(!audios){ audios = window.currentGlobalAudios = {}; } audios[audio.get('id')] = audio; if(audio.get('state') == 'playing'){ return audio; } if(!audio.get('loop')){ audio.bind('end', endFunction, this); } audio.play(); return audio; },
  "setMapLocation": function(panoramaPlayListItem, mapPlayer){  var resetFunction = function(){ panoramaPlayListItem.unbind('stop', resetFunction, this); player.set('mapPlayer', null); }; panoramaPlayListItem.bind('stop', resetFunction, this); var player = panoramaPlayListItem.get('player'); player.set('mapPlayer', mapPlayer); },
  "setPanoramaCameraWithSpot": function(playListItem, yaw, pitch){  var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); var initialPosition = newCamera.get('initialPosition'); initialPosition.set('yaw', yaw); initialPosition.set('pitch', pitch); this.startPanoramaWithCamera(panorama, newCamera); },
  "getOverlays": function(media){  switch(media.get('class')){ case 'Panorama': var overlays = media.get('overlays').concat() || []; var frames = media.get('frames'); for(var j = 0; j<frames.length; ++j){ overlays = overlays.concat(frames[j].get('overlays') || []); } return overlays; case 'Video360': case 'Map': return media.get('overlays') || []; default: return []; } },
  "getComponentByName": function(name){  var list = this.getByClassName('UIComponent'); for(var i = 0, count = list.length; i<count; ++i){ var component = list[i]; var data = component.get('data'); if(data != undefined && data.name == name){ return component; } } return undefined; },
  "resumePlayers": function(players, onlyResumeCameraIfPanorama){  for(var i = 0; i<players.length; ++i){ var player = players[i]; if(onlyResumeCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.resumeCamera(); } else{ player.play(); } } },
  "shareWhatsapp": function(url){  window.open('https://api.whatsapp.com/send/?text=' + encodeURIComponent(url), '_blank'); },
  "getMediaHeight": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxH=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('height') > maxH) maxH = r.get('height'); } return maxH; }else{ return r.get('height') } default: return media.get('height'); } },
  "setMediaBehaviour": function(playList, index, mediaDispatcher){  var self = this; var stateChangeFunction = function(event){ if(event.data.state == 'stopped'){ dispose.call(this, true); } }; var onBeginFunction = function() { item.unbind('begin', onBeginFunction, self); var media = item.get('media'); if(media.get('class') != 'Panorama' || (media.get('camera') != undefined && media.get('camera').get('initialSequence') != undefined)){ player.bind('stateChange', stateChangeFunction, self); } }; var changeFunction = function(){ var index = playListDispatcher.get('selectedIndex'); if(index != -1){ indexDispatcher = index; dispose.call(this, false); } }; var disposeCallback = function(){ dispose.call(this, false); }; var dispose = function(forceDispose){ if(!playListDispatcher) return; var media = item.get('media'); if((media.get('class') == 'Video360' || media.get('class') == 'Video') && media.get('loop') == true && !forceDispose) return; playList.set('selectedIndex', -1); if(panoramaSequence && panoramaSequenceIndex != -1){ if(panoramaSequence) { if(panoramaSequenceIndex > 0 && panoramaSequence.get('movements')[panoramaSequenceIndex-1].get('class') == 'TargetPanoramaCameraMovement'){ var initialPosition = camera.get('initialPosition'); var oldYaw = initialPosition.get('yaw'); var oldPitch = initialPosition.get('pitch'); var oldHfov = initialPosition.get('hfov'); var previousMovement = panoramaSequence.get('movements')[panoramaSequenceIndex-1]; initialPosition.set('yaw', previousMovement.get('targetYaw')); initialPosition.set('pitch', previousMovement.get('targetPitch')); initialPosition.set('hfov', previousMovement.get('targetHfov')); var restoreInitialPositionFunction = function(event){ initialPosition.set('yaw', oldYaw); initialPosition.set('pitch', oldPitch); initialPosition.set('hfov', oldHfov); itemDispatcher.unbind('end', restoreInitialPositionFunction, this); }; itemDispatcher.bind('end', restoreInitialPositionFunction, this); } panoramaSequence.set('movementIndex', panoramaSequenceIndex); } } if(player){ item.unbind('begin', onBeginFunction, this); player.unbind('stateChange', stateChangeFunction, this); for(var i = 0; i<buttons.length; ++i) { buttons[i].unbind('click', disposeCallback, this); } } if(sameViewerArea){ var currentMedia = this.getMediaFromPlayer(player); if(currentMedia == undefined || currentMedia == item.get('media')){ playListDispatcher.set('selectedIndex', indexDispatcher); } if(playList != playListDispatcher) playListDispatcher.unbind('change', changeFunction, this); } else{ viewerArea.set('visible', viewerVisibility); } playListDispatcher = undefined; }; var mediaDispatcherByParam = mediaDispatcher != undefined; if(!mediaDispatcher){ var currentIndex = playList.get('selectedIndex'); var currentPlayer = (currentIndex != -1) ? playList.get('items')[playList.get('selectedIndex')].get('player') : this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer) { mediaDispatcher = this.getMediaFromPlayer(currentPlayer); } } var playListDispatcher = mediaDispatcher ? this.getPlayListWithMedia(mediaDispatcher, true) : undefined; if(!playListDispatcher){ playList.set('selectedIndex', index); return; } var indexDispatcher = playListDispatcher.get('selectedIndex'); if(playList.get('selectedIndex') == index || indexDispatcher == -1){ return; } var item = playList.get('items')[index]; var itemDispatcher = playListDispatcher.get('items')[indexDispatcher]; var player = item.get('player'); var viewerArea = player.get('viewerArea'); var viewerVisibility = viewerArea.get('visible'); var sameViewerArea = viewerArea == itemDispatcher.get('player').get('viewerArea'); if(sameViewerArea){ if(playList != playListDispatcher){ playListDispatcher.set('selectedIndex', -1); playListDispatcher.bind('change', changeFunction, this); } } else{ viewerArea.set('visible', true); } var panoramaSequenceIndex = -1; var panoramaSequence = undefined; var camera = itemDispatcher.get('camera'); if(camera){ panoramaSequence = camera.get('initialSequence'); if(panoramaSequence) { panoramaSequenceIndex = panoramaSequence.get('movementIndex'); } } playList.set('selectedIndex', index); var buttons = []; var addButtons = function(property){ var value = player.get(property); if(value == undefined) return; if(Array.isArray(value)) buttons = buttons.concat(value); else buttons.push(value); }; addButtons('buttonStop'); for(var i = 0; i<buttons.length; ++i) { buttons[i].bind('click', disposeCallback, this); } if(player != itemDispatcher.get('player') || !mediaDispatcherByParam){ item.bind('begin', onBeginFunction, self); } this.executeFunctionWhenChange(playList, index, disposeCallback); },
  "getPlayListItemByMedia": function(playList, media){  var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media) return item; } return undefined; },
  "setStartTimeVideo": function(video, time){  var items = this.getPlayListItems(video); var startTimeBackup = []; var restoreStartTimeFunc = function() { for(var i = 0; i<items.length; ++i){ var item = items[i]; item.set('startTime', startTimeBackup[i]); item.unbind('stop', restoreStartTimeFunc, this); } }; for(var i = 0; i<items.length; ++i) { var item = items[i]; var player = item.get('player'); if(player.get('video') == video && player.get('state') == 'playing') { player.seek(time); } else { startTimeBackup.push(item.get('startTime')); item.set('startTime', time); item.bind('stop', restoreStartTimeFunc, this); } } },
  "getPanoramaOverlayByName": function(panorama, name){  var overlays = this.getOverlays(panorama); for(var i = 0, count = overlays.length; i<count; ++i){ var overlay = overlays[i]; var data = overlay.get('data'); if(data != undefined && data.label == name){ return overlay; } } return undefined; },
  "pauseGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; } if(audio.get('state') == 'playing') audio.pause(); },
  "setComponentVisibility": function(component, visible, applyAt, effect, propertyEffect, ignoreClearTimeout){  var keepVisibility = this.getKey('keepVisibility_' + component.get('id')); if(keepVisibility) return; this.unregisterKey('visibility_'+component.get('id')); var changeVisibility = function(){ if(effect && propertyEffect){ component.set(propertyEffect, effect); } component.set('visible', visible); if(component.get('class') == 'ViewerArea'){ try{ if(visible) component.restart(); else if(component.get('playbackState') == 'playing') component.pause(); } catch(e){}; } }; var effectTimeoutName = 'effectTimeout_'+component.get('id'); if(!ignoreClearTimeout && window.hasOwnProperty(effectTimeoutName)){ var effectTimeout = window[effectTimeoutName]; if(effectTimeout instanceof Array){ for(var i=0; i<effectTimeout.length; i++){ clearTimeout(effectTimeout[i]) } }else{ clearTimeout(effectTimeout); } delete window[effectTimeoutName]; } else if(visible == component.get('visible') && !ignoreClearTimeout) return; if(applyAt && applyAt > 0){ var effectTimeout = setTimeout(function(){ if(window[effectTimeoutName] instanceof Array) { var arrayTimeoutVal = window[effectTimeoutName]; var index = arrayTimeoutVal.indexOf(effectTimeout); arrayTimeoutVal.splice(index, 1); if(arrayTimeoutVal.length == 0){ delete window[effectTimeoutName]; } }else{ delete window[effectTimeoutName]; } changeVisibility(); }, applyAt); if(window.hasOwnProperty(effectTimeoutName)){ window[effectTimeoutName] = [window[effectTimeoutName], effectTimeout]; }else{ window[effectTimeoutName] = effectTimeout; } } else{ changeVisibility(); } },
  "openLink": function(url, name){  if(url == location.href) { return; } var isElectron = (window && window.process && window.process.versions && window.process.versions['electron']) || (navigator && navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0); if (name == '_blank' && isElectron) { if (url.startsWith('/')) { var r = window.location.href.split('/'); r.pop(); url = r.join('/') + url; } var extension = url.split('.').pop().toLowerCase(); if(extension != 'pdf' || url.startsWith('file://')) { var shell = window.require('electron').shell; shell.openExternal(url); } else { window.open(url, name); } } else if(isElectron && (name == '_top' || name == '_self')) { window.location = url; } else { var newWindow = window.open(url, name); newWindow.focus(); } },
  "syncPlaylists": function(playLists){  var changeToMedia = function(media, playListDispatched){ for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(playList != playListDispatched){ var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ if(items[j].get('media') == media){ if(playList.get('selectedIndex') != j){ playList.set('selectedIndex', j); } break; } } } } }; var changeFunction = function(event){ var playListDispatched = event.source; var selectedIndex = playListDispatched.get('selectedIndex'); if(selectedIndex < 0) return; var media = playListDispatched.get('items')[selectedIndex].get('media'); changeToMedia(media, playListDispatched); }; var mapPlayerChangeFunction = function(event){ var panoramaMapLocation = event.source.get('panoramaMapLocation'); if(panoramaMapLocation){ var map = panoramaMapLocation.get('map'); changeToMedia(map); } }; for(var i = 0, count = playLists.length; i<count; ++i){ playLists[i].bind('change', changeFunction, this); } var mapPlayers = this.getByClassName('MapPlayer'); for(var i = 0, count = mapPlayers.length; i<count; ++i){ mapPlayers[i].bind('panoramaMapLocation_change', mapPlayerChangeFunction, this); } }
 },
 "children": [
  "this.MainViewer",
  "this.Container_EF8F8BD8_E386_8E03_41E3_4CF7CC1F4D8E",
  "this.Container_0DD1BF09_1744_0507_41B3_29434E440055",
  "this.Container_1B9AAD00_16C4_0505_41B5_6F4AE0747E48",
  "this.Container_062AB830_1140_E215_41AF_6C9D65345420",
  "this.Container_23F0F7B8_0C0A_629D_418A_F171085EFBF8",
  "this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15",
  "this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7",
  "this.Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41",
  "this.Container_2820BA13_0D5D_5B97_4192_AABC38F6F169",
  "this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E",
  "this.Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC",
  "this.Button_0408AE45_1C2C_7291_41BA_71E65C0F7A61"
 ],
 "id": "rootPlayer",
 "buttonToggleFullscreen": "this.IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0",
 "horizontalAlign": "left",
 "defaultVRPointer": "laser",
 "start": "this.init(); this.visibleComponentsIfPlayerFlagEnabled([this.IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A], 'gyroscopeAvailable'); this.syncPlaylists([this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist,this.mainPlayList]); if(!this.get('fullscreenAvailable')) { [this.IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0].forEach(function(component) { component.set('visible', false); }) }",
 "downloadEnabled": false,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 20,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "borderSize": 0,
 "propagateClick": true,
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "desktopMipmappingEnabled": false,
 "height": "100%",
 "minWidth": 20,
 "definitions": [{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 172.05,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_138D9391_1D01_4E77_4163_E70B52DD215F",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 179.11,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_0C7082F5_1D01_4FBF_41BB_0BDC28B18422",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "vfov": 180,
 "label": "0001",
 "id": "panorama_0B271272_00C5_2E12_4158_4711DBF5BF59",
 "thumbnailUrl": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8",
   "yaw": -0.3,
   "distance": 1,
   "backwardYaw": -171.21,
   "class": "AdjacentPanorama"
  }
 ],
 "overlays": [
  "this.overlay_0CA3DDFE_0347_3A12_417A_10FE1EF12F24"
 ],
 "class": "Panorama",
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "vfov": 180,
 "label": "0007",
 "id": "panorama_0BDB6B46_00C7_1E72_4168_07B013644602",
 "thumbnailUrl": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A",
   "class": "AdjacentPanorama"
  }
 ],
 "overlays": [
  "this.overlay_0C7EE17A_1C34_3173_4195_79771B64807D",
  "this.overlay_13D297EC_1C34_7197_4182_D88CD64823EB"
 ],
 "class": "Panorama",
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BDB6B46_00C7_1E72_4168_07B013644602_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "vfov": 180,
 "label": "0013",
 "id": "panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A",
 "thumbnailUrl": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_0BDAA661_00C7_162E_4165_40895C4E611D",
   "yaw": 166.24,
   "distance": 1,
   "backwardYaw": -129.44,
   "class": "AdjacentPanorama"
  }
 ],
 "overlays": [
  "this.overlay_083A7365_1C54_3291_41B4_A2A647A00558"
 ],
 "class": "Panorama",
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "duration": 5000,
 "class": "Photo",
 "label": "7",
 "id": "album_0513B074_1C54_2F76_41B3_F0FF6AC90635_5",
 "thumbnailUrl": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_5_t.jpg",
 "width": 4096,
 "image": {
  "levels": [
   {
    "url": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_5.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 2160
},
{
 "items": [
  {
   "media": "this.panorama_0B271272_00C5_2E12_4158_4711DBF5BF59",
   "camera": "this.panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8",
   "camera": "this.panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 1, 2)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0",
   "camera": "this.panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 2, 3)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0",
   "camera": "this.panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 3, 4)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00",
   "camera": "this.panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 4, 5)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50",
   "camera": "this.panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 5, 6)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDB6B46_00C7_1E72_4168_07B013644602",
   "camera": "this.panorama_0BDB6B46_00C7_1E72_4168_07B013644602_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 6, 7)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9",
   "camera": "this.panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 7, 8)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A",
   "camera": "this.panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 8, 9)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674",
   "camera": "this.panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 9, 10)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDAA661_00C7_162E_4165_40895C4E611D",
   "camera": "this.panorama_0BDAA661_00C7_162E_4165_40895C4E611D_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 10, 11)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2",
   "camera": "this.panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 11, 12)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A",
   "camera": "this.panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 12, 13)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3",
   "camera": "this.panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 13, 14)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BD9C176_00C7_6A13_4164_A846E95E0684",
   "camera": "this.panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 14, 15)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BD8C86C_00C7_1A37_4165_B14A52607475",
   "camera": "this.panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 15, 16)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDBEEF5_00C7_1616_4160_C1381D525209",
   "camera": "this.panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 16, 17)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDDA633_00C7_3612_414A_51361A0A976F",
   "camera": "this.panorama_0BDDA633_00C7_3612_414A_51361A0A976F_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 17, 18)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC",
   "camera": "this.panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 18, 19)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A",
   "camera": "this.panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 19, 20)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A",
   "camera": "this.panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 20, 21)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.album_0513B074_1C54_2F76_41B3_F0FF6AC90635",
   "class": "PhotoAlbumPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 21, 0)",
   "player": "this.MainViewerPhotoAlbumPlayer",
   "end": "this.trigger('tourEnded')"
  }
 ],
 "id": "mainPlayList",
 "class": "PlayList"
},
{
 "vfov": 180,
 "label": "0004",
 "id": "panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0",
 "thumbnailUrl": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00",
   "yaw": -100.88,
   "distance": 1,
   "backwardYaw": -162.86,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0",
   "yaw": 154.6,
   "distance": 1,
   "backwardYaw": 56.68,
   "class": "AdjacentPanorama"
  }
 ],
 "overlays": [
  "this.overlay_10268E5E_00CB_1612_417E_795BC8EFD394",
  "this.overlay_10C68AC4_00CD_3E77_4182_197FDBEC7082",
  "this.overlay_0612F2F1_1CD4_738E_41B6_CBB96D011F93"
 ],
 "class": "Panorama",
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "vfov": 180,
 "label": "0012",
 "id": "panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2",
 "thumbnailUrl": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_0BDAA661_00C7_162E_4165_40895C4E611D",
   "yaw": -179.54,
   "distance": 1,
   "backwardYaw": -7.95,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3",
   "yaw": 105.3,
   "distance": 1,
   "backwardYaw": -132.06,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BD9C176_00C7_6A13_4164_A846E95E0684",
   "yaw": -127.22,
   "distance": 1,
   "backwardYaw": 124.64,
   "class": "AdjacentPanorama"
  }
 ],
 "overlays": [
  "this.overlay_0FF63F8B_1C5B_D191_419D_782626717850",
  "this.overlay_0A57D5D9_1C5C_51B1_41B2_E078427A44AA",
  "this.overlay_095C2A2D_1C5C_7291_41A9_68D4207ED3BB"
 ],
 "class": "Panorama",
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "viewerArea": "this.MainViewer",
 "buttonToggleGyroscope": "this.IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A",
 "class": "PanoramaPlayer",
 "displayPlaybackBar": true,
 "buttonToggleHotspots": "this.IconButton_EEEB3760_E38B_8603_41D6_FE6B11A3DA96",
 "buttonCardboardView": [
  "this.IconButton_EF7806FA_E38F_8606_41E5_5C4557EBCACB",
  "this.IconButton_1B9ADD00_16C4_0505_41B4_B043CA1AA270"
 ],
 "id": "MainViewerPanoramaPlayer",
 "mouseControlMode": "drag_acceleration",
 "touchControlMode": "drag_rotation",
 "gyroscopeVerticalDraggingEnabled": true
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 173.55,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_0C4692D0_1D01_4FF4_41A0_A263634A67B1",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "duration": 5000,
 "class": "Photo",
 "label": "9",
 "id": "album_0513B074_1C54_2F76_41B3_F0FF6AC90635_7",
 "thumbnailUrl": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_7_t.jpg",
 "width": 4096,
 "image": {
  "levels": [
   {
    "url": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_7.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 2160
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 50.56,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_0DEF3286_1D01_4E5D_41A3_C5B8B5713DF0",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "duration": 5000,
 "class": "Photo",
 "label": "6",
 "id": "album_0513B074_1C54_2F76_41B3_F0FF6AC90635_4",
 "thumbnailUrl": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_4_t.jpg",
 "width": 4096,
 "image": {
  "levels": [
   {
    "url": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_4.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 2160
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -74.7,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_0C60F2E9_1D01_4FD7_4197_296EFB0E6C22",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "vfov": 180,
 "label": "0003",
 "id": "panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0",
 "thumbnailUrl": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_0BDBEEF5_00C7_1616_4160_C1381D525209",
   "yaw": -45.61,
   "distance": 1,
   "backwardYaw": -179.49,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8",
   "yaw": -159.11,
   "distance": 1,
   "backwardYaw": -1.15,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0",
   "yaw": 56.68,
   "distance": 1,
   "backwardYaw": 154.6,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00",
   "yaw": 18.06,
   "distance": 1,
   "backwardYaw": -89.47,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50",
   "yaw": -18.19,
   "distance": 1,
   "backwardYaw": -160.51,
   "class": "AdjacentPanorama"
  }
 ],
 "overlays": [
  "this.overlay_0DEDB29F_035F_2E12_4169_28E3E74E5CB8",
  "this.overlay_0DD4AFD3_035F_1612_413F_B99BBA8F788C",
  "this.overlay_0DCC207B_035D_2A12_414B_54B9921E48FF",
  "this.overlay_12BC8774_00CD_1616_4155_B216B5C88D98",
  "this.overlay_128D872C_00CB_1636_4160_E81611659A04",
  "this.overlay_126FEB20_00C5_1E2E_416B_751BA0F65A98",
  "this.overlay_13C99439_00C7_2A1E_4180_734EA8CE2272",
  "this.overlay_13274EC0_00C5_166E_417E_C954A493C808",
  "this.overlay_095A45AD_1C54_3191_4196_05BB038C5C0E"
 ],
 "class": "Panorama",
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0.51,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_0DF92293_1D01_4E7B_41AA_80E3A962646D",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "items": [
  {
   "media": "this.panorama_0B271272_00C5_2E12_4158_4711DBF5BF59",
   "camera": "this.panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8",
   "camera": "this.panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 1, 2)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0",
   "camera": "this.panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 2, 3)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0",
   "camera": "this.panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 3, 4)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00",
   "camera": "this.panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 4, 5)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50",
   "camera": "this.panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 5, 6)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDB6B46_00C7_1E72_4168_07B013644602",
   "camera": "this.panorama_0BDB6B46_00C7_1E72_4168_07B013644602_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 6, 7)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9",
   "camera": "this.panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 7, 8)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A",
   "camera": "this.panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 8, 9)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674",
   "camera": "this.panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 9, 10)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDAA661_00C7_162E_4165_40895C4E611D",
   "camera": "this.panorama_0BDAA661_00C7_162E_4165_40895C4E611D_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 10, 11)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2",
   "camera": "this.panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 11, 12)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A",
   "camera": "this.panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 12, 13)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3",
   "camera": "this.panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 13, 14)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BD9C176_00C7_6A13_4164_A846E95E0684",
   "camera": "this.panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 14, 15)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BD8C86C_00C7_1A37_4165_B14A52607475",
   "camera": "this.panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 15, 16)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDBEEF5_00C7_1616_4160_C1381D525209",
   "camera": "this.panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 16, 17)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDDA633_00C7_3612_414A_51361A0A976F",
   "camera": "this.panorama_0BDDA633_00C7_3612_414A_51361A0A976F_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 17, 18)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC",
   "camera": "this.panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 18, 19)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A",
   "camera": "this.panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 19, 20)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A",
   "camera": "this.panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 20, 21)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 21, 0)",
   "media": "this.album_0513B074_1C54_2F76_41B3_F0FF6AC90635",
   "player": "this.MainViewerPhotoAlbumPlayer",
   "class": "PhotoAlbumPlayListItem"
  }
 ],
 "id": "ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist",
 "class": "PlayList"
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 161.81,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_137A3379_1D01_4EB7_41B4_5B53081A5289",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "vfov": 180,
 "label": "0002",
 "id": "panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8",
 "thumbnailUrl": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_0B271272_00C5_2E12_4158_4711DBF5BF59",
   "yaw": -171.21,
   "distance": 1,
   "backwardYaw": -0.3,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0",
   "yaw": -1.15,
   "distance": 1,
   "backwardYaw": -159.11,
   "class": "AdjacentPanorama"
  }
 ],
 "overlays": [
  "this.overlay_128D9D12_0345_1A13_414D_4B74B165CABE",
  "this.overlay_0C422B8E_035B_1EF2_417B_EAE2F42B69B8"
 ],
 "class": "Panorama",
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "vfov": 180,
 "label": "0005",
 "id": "panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00",
 "thumbnailUrl": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0",
   "yaw": -162.86,
   "distance": 1,
   "backwardYaw": -100.88,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0",
   "yaw": -89.47,
   "distance": 1,
   "backwardYaw": 18.06,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50",
   "yaw": -43.48,
   "distance": 1,
   "backwardYaw": 24.69,
   "class": "AdjacentPanorama"
  }
 ],
 "overlays": [
  "this.overlay_1015080D_00CF_39F6_4171_43BEB2C9B43E",
  "this.overlay_10AEC42C_00CF_2A36_4168_CCF2A8814324",
  "this.overlay_0D5B4126_1C3C_EE93_41A1_8544EAC0DB36"
 ],
 "class": "Panorama",
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "duration": 5000,
 "class": "Photo",
 "label": "8",
 "id": "album_0513B074_1C54_2F76_41B3_F0FF6AC90635_6",
 "thumbnailUrl": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_6_t.jpg",
 "width": 4096,
 "image": {
  "levels": [
   {
    "url": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_6.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 2160
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "duration": 5000,
 "class": "Photo",
 "label": "2",
 "id": "album_0513B074_1C54_2F76_41B3_F0FF6AC90635_0",
 "thumbnailUrl": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_0_t.jpg",
 "width": 4096,
 "image": {
  "levels": [
   {
    "url": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_0.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 2160
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 134.39,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_0DDF0279_1D01_4EB7_41B1_18633DB6F627",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "vfov": 180,
 "label": "0011",
 "id": "panorama_0BDAA661_00C7_162E_4165_40895C4E611D",
 "thumbnailUrl": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674",
   "yaw": 164.33,
   "distance": 1,
   "backwardYaw": -0.89,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2",
   "yaw": -7.95,
   "distance": 1,
   "backwardYaw": -179.54,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A",
   "yaw": -129.44,
   "distance": 1,
   "backwardYaw": 166.24,
   "class": "AdjacentPanorama"
  }
 ],
 "overlays": [
  "this.overlay_0FD68FC4_1C55_F196_41A4_ABC8807F06D0",
  "this.overlay_0FBA7F9A_1C55_D1B2_41A7_08F0310CB6CC",
  "this.overlay_0FCB44C2_1C54_5792_4184_5103825C3E1C"
 ],
 "class": "Panorama",
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "vfov": 180,
 "label": "0015",
 "id": "panorama_0BD9C176_00C7_6A13_4164_A846E95E0684",
 "thumbnailUrl": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2",
   "yaw": 124.64,
   "distance": 1,
   "backwardYaw": -127.22,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A",
   "yaw": -6.45,
   "distance": 1,
   "backwardYaw": 165.55,
   "class": "AdjacentPanorama"
  }
 ],
 "overlays": [
  "this.overlay_0979CB1B_1C6C_32B2_41A2_147F93A1E824",
  "this.overlay_0B25CBC9_1C34_319E_4193_A395DF67434C"
 ],
 "class": "Panorama",
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BDDA633_00C7_3612_414A_51361A0A976F_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -155.31,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_13C223CF_1D01_4DEC_41AE_0FA88655E73F",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 90.53,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_0C2482B7_1D01_4FBB_4190_B94ABC9669F9",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -123.32,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_1366035F_1D01_4EEB_41AD_0BE0CC50061C",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_t.jpg"
  }
 ],
 "vfov": 180,
 "class": "Panorama",
 "label": "0008",
 "id": "panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9",
 "thumbnailUrl": "media/panorama_0BE6022A_00C7_2E33_4150_1B6725AAA9C9_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 52.78,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_13C8F3DB_1D01_4DF4_41B4_355880E9CE5B",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 179.7,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_0DBDC25A_1D01_4EF5_41B7_5400CF9B1CE9",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -15.67,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_0C5692DD_1D01_4FEC_41B0_C598C64B6F4C",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 136.52,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_136CF36C_1D01_4EAD_41A8_DCF6F0EDED40",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "duration": 5000,
 "class": "Photo",
 "label": "3 (1)",
 "id": "album_0513B074_1C54_2F76_41B3_F0FF6AC90635_1",
 "thumbnailUrl": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_1_t.jpg",
 "width": 4096,
 "image": {
  "levels": [
   {
    "url": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_1.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 2160
},
{
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_t.jpg"
  }
 ],
 "vfov": 180,
 "class": "Panorama",
 "label": "0021",
 "id": "panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A",
 "thumbnailUrl": "media/panorama_0BDACC33_00C7_1A12_415E_486AEF077A1A_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 19.49,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_0C3462C4_1D01_4FDC_41B5_00F3F1364C78",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0.46,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_13518338_1D01_4EB5_4186_C57440568E18",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "vfov": 180,
 "label": "0017",
 "id": "panorama_0BDBEEF5_00C7_1616_4160_C1381D525209",
 "thumbnailUrl": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674",
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BDDA633_00C7_3612_414A_51361A0A976F",
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0",
   "yaw": -179.49,
   "distance": 1,
   "backwardYaw": -45.61,
   "class": "AdjacentPanorama"
  }
 ],
 "overlays": [
  "this.overlay_0A67FA4E_1C6D_D293_41B5_C54E1E2AFD04",
  "this.overlay_09BB093D_1C6C_5EF6_41B6_8A2CC85951F7",
  "this.overlay_0910C987_1C6C_3191_41B8_38278F9BF36C"
 ],
 "class": "Panorama",
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "duration": 5000,
 "class": "Photo",
 "label": "5",
 "id": "album_0513B074_1C54_2F76_41B3_F0FF6AC90635_3",
 "thumbnailUrl": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_3_t.jpg",
 "width": 4096,
 "image": {
  "levels": [
   {
    "url": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_3.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 2160
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 17.14,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_135FA352_1D01_4EF5_41A8_176550FC88B0",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "vfov": 180,
 "label": "0014",
 "id": "panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3",
 "thumbnailUrl": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2",
   "yaw": -132.06,
   "distance": 1,
   "backwardYaw": 105.3,
   "class": "AdjacentPanorama"
  }
 ],
 "overlays": [
  "this.overlay_0A7CC3E0_1C6C_F18F_41B5_370AE2CFC59E"
 ],
 "class": "Panorama",
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BDAA661_00C7_162E_4165_40895C4E611D_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_t.jpg"
  }
 ],
 "vfov": 180,
 "class": "Panorama",
 "label": "0020",
 "id": "panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC",
 "thumbnailUrl": "media/panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 79.12,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_13AF93B6_1D01_4DBD_41B3_2042E0274037",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "duration": 5000,
 "class": "Photo",
 "label": "10",
 "id": "album_0513B074_1C54_2F76_41B3_F0FF6AC90635_8",
 "thumbnailUrl": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_8_t.jpg",
 "width": 4096,
 "image": {
  "levels": [
   {
    "url": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_8.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 2160
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 47.94,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_139B639D_1D01_4E6F_41B4_7750D3BA1A4A",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "vfov": 180,
 "label": "0006",
 "id": "panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50",
 "thumbnailUrl": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674",
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00",
   "yaw": 24.69,
   "distance": 1,
   "backwardYaw": -43.48,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0",
   "yaw": -160.51,
   "distance": 1,
   "backwardYaw": -18.19,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BDB6B46_00C7_1E72_4168_07B013644602",
   "class": "AdjacentPanorama"
  }
 ],
 "overlays": [
  "this.overlay_135A9227_1C2D_D291_41BA_788D155A4F3A",
  "this.overlay_132824E5_1C2C_7796_41B9_E4461BCDB9B8",
  "this.overlay_137B9952_1C2C_5EB3_41A1_E3A5503294D5",
  "this.overlay_1380A56F_1C35_F692_4188_1C24DE02A3AA"
 ],
 "class": "Panorama",
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "duration": 5000,
 "class": "Photo",
 "label": "4",
 "id": "album_0513B074_1C54_2F76_41B3_F0FF6AC90635_2",
 "thumbnailUrl": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_2_t.jpg",
 "width": 4096,
 "image": {
  "levels": [
   {
    "url": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_2.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 2160
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -161.94,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_13B443C2_1D01_4DD5_41B1_C115F2F9FCE9",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "viewerArea": "this.MainViewer",
 "buttonPrevious": [
  "this.IconButton_23F7E7B7_0C0A_6293_419F_D3D84EB3AFBD",
  "this.IconButton_2BE71718_0D55_6990_41A5_73D31D902E1D",
  "this.IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482"
 ],
 "id": "MainViewerPhotoAlbumPlayer",
 "buttonNext": [
  "this.IconButton_23F037B7_0C0A_6293_41A2_C1707EE666E4",
  "this.IconButton_28BF3E40_0D4B_DBF0_41A3_D5D2941E6E14",
  "this.IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510"
 ],
 "class": "PhotoAlbumPlayer"
},
{
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_t.jpg"
  }
 ],
 "vfov": 180,
 "class": "Panorama",
 "label": "0016",
 "id": "panorama_0BD8C86C_00C7_1A37_4165_B14A52607475",
 "thumbnailUrl": "media/panorama_0BD8C86C_00C7_1A37_4165_B14A52607475_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "vfov": 180,
 "label": "0010",
 "id": "panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674",
 "thumbnailUrl": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A",
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BDAA661_00C7_162E_4165_40895C4E611D",
   "yaw": -0.89,
   "distance": 1,
   "backwardYaw": 164.33,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_0BD8C86C_00C7_1A37_4165_B14A52607475",
   "class": "AdjacentPanorama"
  }
 ],
 "overlays": [
  "this.overlay_0E6CCE08_1C34_D29E_41B0_FA18359C5226",
  "this.overlay_0E674997_1C2C_31B2_41B2_9B8870CE8152",
  "this.overlay_0E0EF05C_1C2C_2EB6_419B_2F7AF51569C7",
  "this.overlay_0EECD268_1C2C_D29F_41A9_9AEC074AB013"
 ],
 "class": "Panorama",
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 20.89,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_0DCD726A_1D01_4EAA_4197_3970B84BDABB",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 178.85,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_0C0AB29F_1D01_4E6B_41B1_18988E91AD12",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "vfov": 180,
 "label": "0022",
 "id": "panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A",
 "thumbnailUrl": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_0BD9C176_00C7_6A13_4164_A846E95E0684",
   "yaw": 165.55,
   "distance": 1,
   "backwardYaw": -6.45,
   "class": "AdjacentPanorama"
  }
 ],
 "overlays": [
  "this.overlay_0462F4BB_1C34_57F2_4198_B56084CFF99F"
 ],
 "class": "Panorama",
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -25.4,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_0C1A42AB_1D01_4FAB_41A9_443B1A8E6B36",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 8.79,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_1380C385_1D01_4E5F_41A7_51978B0CC4AF",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -55.36,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_13A023AA_1D01_4E55_4181_4C8B2610ACB8",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PhotoAlbum",
 "label": "Photo Album 2",
 "id": "album_0513B074_1C54_2F76_41B3_F0FF6AC90635",
 "thumbnailUrl": "media/album_0513B074_1C54_2F76_41B3_F0FF6AC90635_t.png",
 "playList": "this.album_0513B074_1C54_2F76_41B3_F0FF6AC90635_AlbumPlayList"
},
{
 "vfov": 180,
 "label": "0018",
 "id": "panorama_0BDDA633_00C7_3612_414A_51361A0A976F",
 "thumbnailUrl": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_0BDBC522_00C7_2A32_4166_8025D45EAFFC",
   "class": "AdjacentPanorama"
  }
 ],
 "overlays": [
  "this.overlay_0AE3118A_1C2D_D192_419F_B1D7A859F67C",
  "this.overlay_0A0F4689_1C2F_D39E_41BB_1D9A4EEEB88F"
 ],
 "class": "Panorama",
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -13.76,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_13554345_1D01_4EDF_41B6_CA74215BE08C",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -14.45,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_13D413E7_1D01_4DDC_41A8_DBF2788DF503",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_t.jpg"
  }
 ],
 "vfov": 180,
 "class": "Panorama",
 "label": "0009",
 "id": "panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A",
 "thumbnailUrl": "media/panorama_0BDBB8AD_00C7_3A36_4156_8FD9E650BD2A_t.jpg",
 "hfovMin": "150%",
 "pitch": 0,
 "hfov": 360,
 "hfovMax": 130,
 "partial": false
},
{
 "paddingTop": 0,
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "id": "MainViewer",
 "left": 0,
 "playbackBarRight": 0,
 "playbackBarProgressBorderSize": 0,
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderSize": 6,
 "progressBarBorderRadius": 0,
 "width": "100%",
 "playbackBarBorderRadius": 0,
 "toolTipShadowOpacity": 0,
 "minHeight": 50,
 "playbackBarProgressBorderColor": "#000000",
 "toolTipFontStyle": "normal",
 "paddingRight": 0,
 "toolTipFontFamily": "Georgia",
 "progressLeft": 0,
 "propagateClick": true,
 "toolTipTextShadowOpacity": 0,
 "playbackBarHeadBorderRadius": 0,
 "height": "100%",
 "paddingBottom": 0,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 1,
 "minWidth": 100,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "toolTipBackgroundColor": "#000000",
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "progressBarBackgroundColorDirection": "vertical",
 "toolTipFontColor": "#FFFFFF",
 "vrPointerSelectionTime": 2000,
 "playbackBarHeadShadowVerticalLength": 0,
 "progressHeight": 6,
 "playbackBarHeadShadow": true,
 "progressBottom": 55,
 "shadow": false,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowHorizontalLength": 0,
 "playbackBarHeadShadowOpacity": 0.7,
 "vrPointerColor": "#FFFFFF",
 "toolTipPaddingRight": 10,
 "toolTipBorderSize": 1,
 "progressBarOpacity": 1,
 "toolTipPaddingLeft": 10,
 "toolTipPaddingTop": 7,
 "toolTipDisplayTime": 600,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBorderSize": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderRadius": 0,
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "transitionMode": "blending",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "borderSize": 0,
 "progressBackgroundColorRatios": [
  0.01
 ],
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "top": 0,
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBarBorderColor": "#0066FF",
 "playbackBarHeadHeight": 15,
 "progressBarBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorDirection": "vertical",
 "transitionDuration": 500,
 "playbackBarHeadOpacity": 1,
 "playbackBarBottom": 5,
 "progressBorderColor": "#FFFFFF",
 "playbackBarLeft": 0,
 "toolTipBorderColor": "#767676",
 "toolTipShadowBlurRadius": 3,
 "toolTipTextShadowColor": "#000000",
 "toolTipOpacity": 0.5,
 "toolTipShadowSpread": 0,
 "class": "ViewerArea",
 "toolTipFontSize": 13,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipPaddingBottom": 7,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "Main Viewer"
 },
 "toolTipShadowColor": "#333333",
 "playbackBarHeight": 10,
 "toolTipTextShadowBlurRadius": 3,
 "paddingLeft": 0,
 "playbackBarHeadWidth": 6
},
{
 "contentOpaque": false,
 "children": [
  "this.Container_EF8F8BD8_E386_8E02_41E5_FC5C5513733A",
  "this.Container_EF8F8BD8_E386_8E02_41E5_90850B5F0BBE"
 ],
 "id": "Container_EF8F8BD8_E386_8E03_41E3_4CF7CC1F4D8E",
 "horizontalAlign": "left",
 "width": 115.05,
 "right": "0%",
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "top": "0%",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "height": 641,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "--SETTINGS"
 },
 "layout": "absolute"
},
{
 "contentOpaque": false,
 "id": "Container_0DD1BF09_1744_0507_41B3_29434E440055",
 "left": 30,
 "horizontalAlign": "left",
 "width": 573,
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "borderSize": 0,
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "top": 15,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "height": 133,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "--STICKER"
 },
 "layout": "absolute"
},
{
 "contentOpaque": false,
 "children": [
  "this.Image_1B99DD00_16C4_0505_41B3_51F09727447A",
  "this.Container_1B99BD00_16C4_0505_41A4_A3C2452B0288",
  "this.IconButton_1B9ADD00_16C4_0505_41B4_B043CA1AA270",
  "this.Button_04A2AE30_1C2C_728F_41B1_C2109416FF76"
 ],
 "id": "Container_1B9AAD00_16C4_0505_41B5_6F4AE0747E48",
 "left": "0%",
 "horizontalAlign": "left",
 "backgroundImageUrl": "skin/Container_1B9AAD00_16C4_0505_41B5_6F4AE0747E48.png",
 "right": "0%",
 "backgroundOpacity": 0.64,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "bottom": 0,
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "height": 118,
 "paddingBottom": 0,
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "--MENU"
 },
 "layout": "absolute"
},
{
 "creationPolicy": "inAdvance",
 "contentOpaque": false,
 "children": [
  "this.Container_062A782F_1140_E20B_41AF_B3E5DE341773",
  "this.Container_062A9830_1140_E215_41A7_5F2BBE5C20E4"
 ],
 "id": "Container_062AB830_1140_E215_41AF_6C9D65345420",
 "left": "0%",
 "horizontalAlign": "left",
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "bottom": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_062AB830_1140_E215_41AF_6C9D65345420, false, 0, null, null, false)",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "visible": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "--INFO photo"
 },
 "layout": "absolute"
},
{
 "creationPolicy": "inAdvance",
 "contentOpaque": false,
 "children": [
  "this.Container_23F7B7B7_0C0A_6293_4197_F931EEC6FA48",
  "this.Container_23F097B8_0C0A_629D_4176_D87C90BA32B6"
 ],
 "id": "Container_23F0F7B8_0C0A_629D_418A_F171085EFBF8",
 "left": "0%",
 "horizontalAlign": "left",
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "bottom": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_23F0F7B8_0C0A_629D_418A_F171085EFBF8, false, 0, null, null, false)",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "visible": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "--INFO photoalbum"
 },
 "layout": "absolute"
},
{
 "creationPolicy": "inAdvance",
 "contentOpaque": false,
 "children": [
  "this.Container_39A197B1_0C06_62AF_419A_D15E4DDD2528"
 ],
 "id": "Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15",
 "left": "0%",
 "horizontalAlign": "left",
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "bottom": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15, false, 0, null, null, false)",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "visible": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "--PANORAMA LIST"
 },
 "layout": "absolute"
},
{
 "creationPolicy": "inAdvance",
 "contentOpaque": false,
 "children": [
  "this.Container_221C1648_0C06_E5FD_4180_8A2E8B66315E",
  "this.Container_221B3648_0C06_E5FD_4199_FCE031AE003B"
 ],
 "id": "Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7",
 "left": "0%",
 "horizontalAlign": "left",
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "bottom": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7, false, 0, null, null, false)",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "visible": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "--LOCATION"
 },
 "layout": "absolute"
},
{
 "creationPolicy": "inAdvance",
 "contentOpaque": false,
 "children": [
  "this.Container_2F8A6686_0D4F_6B71_4174_A02FE43588D3"
 ],
 "id": "Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41",
 "left": "0%",
 "horizontalAlign": "left",
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "bottom": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41, false, 0, null, null, false)",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "visible": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "--FLOORPLAN"
 },
 "layout": "absolute"
},
{
 "creationPolicy": "inAdvance",
 "contentOpaque": false,
 "children": [
  "this.Container_28215A13_0D5D_5B97_4198_A7CA735E9E0A"
 ],
 "id": "Container_2820BA13_0D5D_5B97_4192_AABC38F6F169",
 "left": "0%",
 "horizontalAlign": "left",
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "bottom": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_2820BA13_0D5D_5B97_4192_AABC38F6F169, true, 0, null, null, false)",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "visible": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "--PHOTOALBUM + text"
 },
 "layout": "absolute"
},
{
 "creationPolicy": "inAdvance",
 "contentOpaque": false,
 "children": [
  "this.Container_2A193C4C_0D3B_DFF0_4161_A2CD128EF536"
 ],
 "id": "Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E",
 "left": "0%",
 "horizontalAlign": "left",
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "bottom": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E, false, 0, null, null, false)",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "visible": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "--PHOTOALBUM"
 },
 "layout": "absolute"
},
{
 "creationPolicy": "inAdvance",
 "contentOpaque": false,
 "children": [
  "this.Container_06C5DBA5_1140_A63F_41AD_1D83A33F1255",
  "this.Container_06C43BA5_1140_A63F_41A1_96DC8F4CAD2F"
 ],
 "id": "Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC",
 "left": "0%",
 "horizontalAlign": "left",
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#04A3E1",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "bottom": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC, false, 0, null, null, false)",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "visible": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "--REALTOR"
 },
 "layout": "absolute"
},
{
 "textDecoration": "none",
 "cursor": "hand",
 "fontFamily": "Netron",
 "fontColor": "#FFFFFF",
 "iconBeforeLabel": true,
 "pressedBackgroundOpacity": 1,
 "shadowBlurRadius": 15,
 "id": "Button_0408AE45_1C2C_7291_41BA_71E65C0F7A61",
 "left": "1.77%",
 "horizontalAlign": "center",
 "width": 388,
 "rollOverBackgroundColor": [
  "#04A3E1"
 ],
 "shadowColor": "#000000",
 "rollOverShadow": false,
 "backgroundOpacity": 0,
 "shadowSpread": 1,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "iconHeight": 0,
 "rollOverBackgroundOpacity": 0.8,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "bottom": "14.52%",
 "pressedBackgroundColorRatios": [
  0
 ],
 "rollOverBackgroundColorRatios": [
  0.01
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": true,
 "height": 50.5,
 "paddingBottom": 0,
 "label": "ENVIDOX SOLUTIONS",
 "borderSize": 0,
 "backgroundColor": [
  "#000000"
 ],
 "minWidth": 1,
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_062AB830_1140_E215_41AF_6C9D65345420, true, 0, null, null, false)",
 "fontStyle": "normal",
 "mode": "push",
 "gap": 5,
 "class": "Button",
 "fontSize": "31px",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "fontWeight": "bold",
 "iconWidth": 0,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Button house info"
 },
 "layout": "horizontal"
},
{
 "cursor": "hand",
 "maxWidth": 58,
 "id": "IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0",
 "maxHeight": 58,
 "width": 58,
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": true,
 "propagateClick": true,
 "height": 58,
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0_pressed.png",
 "minWidth": 1,
 "verticalAlign": "middle",
 "mode": "toggle",
 "iconURL": "skin/IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0.png",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton FULLSCREEN"
 }
},
{
 "cursor": "hand",
 "maxWidth": 58,
 "id": "IconButton_EED073D3_E38A_9E06_41E1_6CCC9722545D",
 "maxHeight": 58,
 "width": 58,
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": true,
 "propagateClick": true,
 "height": 58,
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_EED073D3_E38A_9E06_41E1_6CCC9722545D_pressed.png",
 "minWidth": 1,
 "verticalAlign": "middle",
 "mode": "toggle",
 "iconURL": "skin/IconButton_EED073D3_E38A_9E06_41E1_6CCC9722545D.png",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton MUTE"
 }
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8, this.camera_1380C385_1D01_4E5F_41A7_51978B0CC4AF); this.mainPlayList.set('selectedIndex', 1)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": -0.3,
   "hfov": 6.11,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_1_HS_0_0_0_map.gif",
      "width": 23,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -5.42,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0B271272_00C5_2E12_4158_4711DBF5BF59_1_HS_0_0.png",
      "width": 69,
      "height": 47,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -0.3,
   "hfov": 6.11,
   "pitch": -5.42
  }
 ],
 "id": "overlay_0CA3DDFE_0347_3A12_417A_10FE1EF12F24",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 8)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c Left-Up"
 },
 "maps": [
  {
   "yaw": -28.86,
   "hfov": 24.49,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0_HS_0_0_0_map.gif",
      "width": 44,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -31.85,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D7D8206_1D01_4E5D_41B2_236A0DB17DF9",
   "hfov": 24.49,
   "pitch": -31.85,
   "yaw": -28.86,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "id": "overlay_0C7EE17A_1C34_3173_4195_79771B64807D",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0_HS_1_0.png",
      "width": 132,
      "height": 113,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -22.23,
   "hfov": 11.59,
   "pitch": 4.15
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": -22.23,
   "hfov": 11.59,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0_HS_1_0_0_map.gif",
      "width": 18,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 4.15,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_13D297EC_1C34_7197_4182_D88CD64823EB",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDAA661_00C7_162E_4165_40895C4E611D, this.camera_0DEF3286_1D01_4E5D_41A3_C5B8B5713DF0); this.mainPlayList.set('selectedIndex', 10)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c Right-Up"
 },
 "maps": [
  {
   "yaw": 166.24,
   "hfov": 15.38,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0_HS_0_0_0_map.gif",
      "width": 44,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -51.62,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D81A209_1D01_4E57_41B7_A739EAB86B4F",
   "hfov": 15.38,
   "pitch": -51.62,
   "yaw": 166.24,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "id": "overlay_083A7365_1C54_3291_41B4_A2A647A00558",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0, this.camera_1366035F_1D01_4EEB_41AD_0BE0CC50061C); this.mainPlayList.set('selectedIndex', 2)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": 154.6,
   "hfov": 10.17,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0_HS_0_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 8.99,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0_HS_0_0.png",
      "width": 117,
      "height": 117,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": 154.6,
   "hfov": 10.17,
   "pitch": 8.99
  }
 ],
 "id": "overlay_10268E5E_00CB_1612_417E_795BC8EFD394",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00, this.camera_135FA352_1D01_4EF5_41A8_176550FC88B0); this.mainPlayList.set('selectedIndex', 4)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": -100.88,
   "hfov": 13.27,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0_HS_1_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -1.22,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0_HS_1_0.png",
      "width": 151,
      "height": 151,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -100.88,
   "hfov": 13.27,
   "pitch": -1.22
  }
 ],
 "id": "overlay_10C68AC4_00CD_3E77_4182_197FDBEC7082",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0_HS_2_0.png",
      "width": 206,
      "height": 166,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -34.1,
   "hfov": 17.61,
   "pitch": 14.31
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": -34.1,
   "hfov": 17.61,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0_0_HS_2_0_0_map.gif",
      "width": 19,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 14.31,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_0612F2F1_1CD4_738E_41B6_CBB96D011F93",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3, this.camera_139B639D_1D01_4E6F_41B4_7750D3BA1A4A); this.mainPlayList.set('selectedIndex', 13)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c"
 },
 "maps": [
  {
   "yaw": 105.3,
   "hfov": 20.67,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0_HS_0_0_0_map.gif",
      "width": 34,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -23.06,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D824208_1D01_4E55_41A4_1F12B4559582",
   "hfov": 20.67,
   "pitch": -23.06,
   "yaw": 105.3,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_0FF63F8B_1C5B_D191_419D_782626717850",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BD9C176_00C7_6A13_4164_A846E95E0684, this.camera_13A023AA_1D01_4E55_4181_4C8B2610ACB8); this.mainPlayList.set('selectedIndex', 14)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c Right-Up"
 },
 "maps": [
  {
   "yaw": -127.22,
   "hfov": 25.77,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0_HS_1_0_0_map.gif",
      "width": 44,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -26.63,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D82F208_1D01_4E55_41B3_DB4D10900300",
   "hfov": 25.77,
   "pitch": -26.63,
   "yaw": -127.22,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "id": "overlay_0A57D5D9_1C5C_51B1_41B2_E078427A44AA",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDAA661_00C7_162E_4165_40895C4E611D, this.camera_138D9391_1D01_4E77_4163_E70B52DD215F); this.mainPlayList.set('selectedIndex', 10)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c"
 },
 "maps": [
  {
   "yaw": -179.54,
   "hfov": 18.84,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0_HS_2_0_0_map.gif",
      "width": 34,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -33.02,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D810208_1D01_4E55_41B9_0682A0E79D44",
   "hfov": 18.84,
   "pitch": -33.02,
   "yaw": -179.54,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_095C2A2D_1C5C_7291_41A9_68D4207ED3BB",
 "rollOverDisplay": false
},
{
 "cursor": "hand",
 "maxWidth": 58,
 "id": "IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A",
 "maxHeight": 58,
 "width": 58,
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": true,
 "propagateClick": true,
 "height": 58,
 "paddingBottom": 0,
 "minWidth": 1,
 "verticalAlign": "middle",
 "pressedIconURL": "skin/IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A_pressed.png",
 "mode": "toggle",
 "iconURL": "skin/IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A.png",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton GYRO"
 }
},
{
 "cursor": "hand",
 "maxWidth": 58,
 "id": "IconButton_EEEB3760_E38B_8603_41D6_FE6B11A3DA96",
 "maxHeight": 58,
 "width": 58,
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": true,
 "propagateClick": true,
 "height": 58,
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_EEEB3760_E38B_8603_41D6_FE6B11A3DA96_pressed.png",
 "minWidth": 1,
 "verticalAlign": "middle",
 "mode": "toggle",
 "iconURL": "skin/IconButton_EEEB3760_E38B_8603_41D6_FE6B11A3DA96.png",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton HS "
 }
},
{
 "cursor": "hand",
 "maxWidth": 58,
 "id": "IconButton_EF7806FA_E38F_8606_41E5_5C4557EBCACB",
 "maxHeight": 58,
 "width": 58,
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": true,
 "propagateClick": true,
 "height": 58,
 "rollOverIconURL": "skin/IconButton_EF7806FA_E38F_8606_41E5_5C4557EBCACB_rollover.png",
 "paddingBottom": 0,
 "minWidth": 1,
 "verticalAlign": "middle",
 "mode": "push",
 "iconURL": "skin/IconButton_EF7806FA_E38F_8606_41E5_5C4557EBCACB.png",
 "class": "IconButton",
 "shadow": false,
 "visible": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton VR"
 }
},
{
 "cursor": "hand",
 "maxWidth": 49,
 "id": "IconButton_1B9ADD00_16C4_0505_41B4_B043CA1AA270",
 "maxHeight": 37,
 "width": 100,
 "horizontalAlign": "center",
 "right": 30,
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "bottom": 8,
 "transparencyActive": true,
 "propagateClick": true,
 "height": 75,
 "rollOverIconURL": "skin/IconButton_1B9ADD00_16C4_0505_41B4_B043CA1AA270_rollover.png",
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_1B9ADD00_16C4_0505_41B4_B043CA1AA270_pressed.png",
 "borderSize": 0,
 "minWidth": 1,
 "verticalAlign": "middle",
 "mode": "push",
 "iconURL": "skin/IconButton_1B9ADD00_16C4_0505_41B4_B043CA1AA270.png",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton VR"
 }
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00, this.camera_0C2482B7_1D01_4FBB_4190_B94ABC9669F9); this.mainPlayList.set('selectedIndex', 4)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": 18.06,
   "hfov": 13.24,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_1_HS_0_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -3.69,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_1_HS_0_0.png",
      "width": 150,
      "height": 151,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": 18.06,
   "hfov": 13.24,
   "pitch": -3.69
  }
 ],
 "id": "overlay_0DEDB29F_035F_2E12_4169_28E3E74E5CB8",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "items": [
  {
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_1_HS_1_0.png",
      "width": 132,
      "height": 57,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -0.91,
   "yaw": -51.61,
   "hfov": 11.61,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Stairs"
 },
 "maps": [
  {
   "yaw": -51.61,
   "hfov": 11.61,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_1_HS_1_0_map.gif",
      "width": 37,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -0.91,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_0DD4AFD3_035F_1612_413F_B99BBA8F788C",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50, this.camera_0C3462C4_1D01_4FDC_41B5_00F3F1364C78); this.mainPlayList.set('selectedIndex', 5)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": -18.19,
   "hfov": 13.24,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_1_HS_2_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -3.96,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_1_HS_2_0.png",
      "width": 150,
      "height": 151,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -18.19,
   "hfov": 13.24,
   "pitch": -3.96
  }
 ],
 "id": "overlay_0DCC207B_035D_2A12_414B_54B9921E48FF",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "items": [
  {
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_1_HS_3_0.png",
      "width": 286,
      "height": 55,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 2.49,
   "yaw": 56.9,
   "hfov": 25.12,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Common Area"
 },
 "maps": [
  {
   "yaw": 56.9,
   "hfov": 25.12,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_1_HS_3_0_map.gif",
      "width": 83,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 2.49,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_12BC8774_00CD_1616_4155_B216B5C88D98",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "items": [
  {
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_1_HS_5_0.png",
      "width": 166,
      "height": 58,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 3.19,
   "yaw": -17.92,
   "hfov": 14.61,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Corridor"
 },
 "maps": [
  {
   "yaw": -17.92,
   "hfov": 14.61,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_1_HS_5_0_map.gif",
      "width": 45,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 3.19,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_128D872C_00CB_1636_4160_E81611659A04",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8, this.camera_0C0AB29F_1D01_4E6B_41B1_18988E91AD12); this.mainPlayList.set('selectedIndex', 1)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": -159.11,
   "hfov": 10.02,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_1_HS_6_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -0.76,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_1_HS_6_0.png",
      "width": 114,
      "height": 114,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -159.11,
   "hfov": 10.02,
   "pitch": -0.76
  }
 ],
 "id": "overlay_126FEB20_00C5_1E2E_416B_751BA0F65A98",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0, this.camera_0C1A42AB_1D01_4FAB_41A9_443B1A8E6B36); this.mainPlayList.set('selectedIndex', 3)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": 56.68,
   "hfov": 13.23,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_1_HS_7_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -4.61,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_1_HS_7_0.png",
      "width": 150,
      "height": 151,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": 56.68,
   "hfov": 13.23,
   "pitch": -4.61
  }
 ],
 "id": "overlay_13C99439_00C7_2A1E_4180_734EA8CE2272",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "items": [
  {
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_1_HS_8_0.png",
      "width": 236,
      "height": 55,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 3.62,
   "yaw": 18.21,
   "hfov": 20.7,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Study Room"
 },
 "maps": [
  {
   "yaw": 18.21,
   "hfov": 20.7,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_1_HS_8_0_map.gif",
      "width": 68,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 3.62,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_13274EC0_00C5_166E_417E_C954A493C808",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDBEEF5_00C7_1616_4160_C1381D525209, this.camera_0DF92293_1D01_4E7B_41AA_80E3A962646D); this.mainPlayList.set('selectedIndex', 16)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c Left-Up"
 },
 "maps": [
  {
   "yaw": -45.61,
   "hfov": 17.92,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0_HS_9_0_0_map.gif",
      "width": 44,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -12.98,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D7891FF_1D01_4DAB_41A9_5B0E3BDB4FB1",
   "hfov": 17.92,
   "pitch": -12.98,
   "yaw": -45.61,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "id": "overlay_095A45AD_1C54_3191_4196_05BB038C5C0E",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0, this.camera_0DCD726A_1D01_4EAA_4197_3970B84BDABB); this.mainPlayList.set('selectedIndex', 2)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": -1.15,
   "hfov": 13.26,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_1_HS_0_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 2.28,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_1_HS_0_0.png",
      "width": 151,
      "height": 151,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -1.15,
   "hfov": 13.26,
   "pitch": 2.28
  }
 ],
 "id": "overlay_128D9D12_0345_1A13_414D_4B74B165CABE",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0B271272_00C5_2E12_4158_4711DBF5BF59, this.camera_0DBDC25A_1D01_4EF5_41B7_5400CF9B1CE9); this.mainPlayList.set('selectedIndex', 0)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": -171.21,
   "hfov": 10.27,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_1_HS_1_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 3.84,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BD9CA16_00C5_1E12_4168_56B9A9039AD8_1_HS_1_0.png",
      "width": 117,
      "height": 117,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -171.21,
   "hfov": 10.27,
   "pitch": 3.84
  }
 ],
 "id": "overlay_0C422B8E_035B_1EF2_417B_EAE2F42B69B8",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDAA759_00C6_F61E_4159_D0ACA5EEADF0, this.camera_13AF93B6_1D01_4DBD_41B3_2042E0274037); this.mainPlayList.set('selectedIndex', 3)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": -162.86,
   "hfov": 13.19,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0_HS_0_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 6.4,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0_HS_0_0.png",
      "width": 151,
      "height": 151,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -162.86,
   "hfov": 13.19,
   "pitch": 6.4
  }
 ],
 "id": "overlay_1015080D_00CF_39F6_4171_43BEB2C9B43E",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0, this.camera_13B443C2_1D01_4DD5_41B1_C115F2F9FCE9); this.mainPlayList.set('selectedIndex', 2)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": -89.47,
   "hfov": 10.24,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0_HS_1_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 6.17,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0_HS_1_0.png",
      "width": 117,
      "height": 117,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -89.47,
   "hfov": 10.24,
   "pitch": 6.17
  }
 ],
 "id": "overlay_10AEC42C_00CF_2A36_4168_CCF2A8814324",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50, this.camera_13C223CF_1D01_4DEC_41AE_0FA88655E73F); this.mainPlayList.set('selectedIndex', 5)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": -43.48,
   "hfov": 10.27,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0_HS_2_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 3.77,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00_0_HS_2_0.png",
      "width": 117,
      "height": 117,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -43.48,
   "hfov": 10.27,
   "pitch": 3.77
  }
 ],
 "id": "overlay_0D5B4126_1C3C_EE93_41A1_8544EAC0DB36",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A, this.camera_13554345_1D01_4EDF_41B6_CA74215BE08C); this.mainPlayList.set('selectedIndex', 12)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c"
 },
 "maps": [
  {
   "yaw": -129.44,
   "hfov": 18.61,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0_HS_0_0_0_map.gif",
      "width": 34,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -34.05,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D834207_1D01_4E5B_41B8_99743AFA245D",
   "hfov": 18.61,
   "pitch": -34.05,
   "yaw": -129.44,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_0FD68FC4_1C55_F196_41A4_ABC8807F06D0",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2, this.camera_13518338_1D01_4EB5_4186_C57440568E18); this.mainPlayList.set('selectedIndex', 11)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c"
 },
 "maps": [
  {
   "yaw": -7.95,
   "hfov": 19.67,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0_HS_1_0_0_map.gif",
      "width": 34,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -28.9,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D83E207_1D01_4E5B_41B4_B1F702DC76FD",
   "hfov": 19.67,
   "pitch": -28.9,
   "yaw": -7.95,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_0FBA7F9A_1C55_D1B2_41A7_08F0310CB6CC",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674, this.camera_0C7082F5_1D01_4FBF_41BB_0BDC28B18422); this.mainPlayList.set('selectedIndex', 9)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c"
 },
 "maps": [
  {
   "yaw": 164.33,
   "hfov": 16.8,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0_HS_2_0_0_map.gif",
      "width": 34,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -41.6,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D820208_1D01_4E55_41AA_E609AD56707C",
   "hfov": 16.8,
   "pitch": -41.6,
   "yaw": 164.33,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_0FCB44C2_1C54_5792_4184_5103825C3E1C",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2, this.camera_13C8F3DB_1D01_4DF4_41B4_355880E9CE5B); this.mainPlayList.set('selectedIndex', 11)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c"
 },
 "maps": [
  {
   "yaw": 124.64,
   "hfov": 20.68,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0_HS_0_0_0_map.gif",
      "width": 34,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -33.98,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D806209_1D01_4E57_41B3_180A48D0ADC1",
   "hfov": 20.68,
   "pitch": -33.98,
   "yaw": 124.64,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_0979CB1B_1C6C_32B2_41A2_147F93A1E824",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A, this.camera_13D413E7_1D01_4DDC_41A8_DBF2788DF503); this.mainPlayList.set('selectedIndex', 20)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": -6.45,
   "hfov": 5.42,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0_HS_1_0_0_map.gif",
      "width": 16,
      "height": 17,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -1.21,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0_HS_1_0.png",
      "width": 61,
      "height": 67,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -6.45,
   "hfov": 5.42,
   "pitch": -1.21
  }
 ],
 "id": "overlay_0B25CBC9_1C34_319E_4193_A395DF67434C",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0, this.camera_0DDF0279_1D01_4EB7_41B1_18633DB6F627); this.mainPlayList.set('selectedIndex', 2)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c"
 },
 "maps": [
  {
   "yaw": -179.49,
   "hfov": 13.95,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0_HS_0_0_0_map.gif",
      "width": 34,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -51.62,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D80C209_1D01_4E57_419A_0FE5ACF82DA1",
   "hfov": 13.95,
   "pitch": -51.62,
   "yaw": -179.49,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_0A67FA4E_1C6D_D293_41B5_C54E1E2AFD04",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 9)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": -24.9,
   "hfov": 14.63,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0_HS_1_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 2.9,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0_HS_1_0.png",
      "width": 166,
      "height": 169,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -24.9,
   "hfov": 14.63,
   "pitch": 2.9
  }
 ],
 "id": "overlay_09BB093D_1C6C_5EF6_41B6_8A2CC85951F7",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 17)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": 33.37,
   "hfov": 16.52,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0_HS_2_0_0_map.gif",
      "width": 17,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 4.14,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0_HS_2_0.png",
      "width": 188,
      "height": 172,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": 33.37,
   "hfov": 16.52,
   "pitch": 4.14
  }
 ],
 "id": "overlay_0910C987_1C6C_3191_41B8_38278F9BF36C",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2, this.camera_0C60F2E9_1D01_4FD7_4197_296EFB0E6C22); this.mainPlayList.set('selectedIndex', 11)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c"
 },
 "maps": [
  {
   "yaw": -132.06,
   "hfov": 19.15,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0_HS_0_0_0_map.gif",
      "width": 34,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -39.81,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D81C209_1D01_4E57_41A8_967E72435B3E",
   "hfov": 19.15,
   "pitch": -39.81,
   "yaw": -132.06,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_0A7CC3E0_1C6C_F18F_41B5_370AE2CFC59E",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 9)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c"
 },
 "maps": [
  {
   "yaw": -104.73,
   "hfov": 26.21,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0_HS_0_0_0_map.gif",
      "width": 34,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -28.69,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D7E5205_1D01_4E5F_4158_97BF3D43F108",
   "hfov": 26.21,
   "pitch": -28.69,
   "yaw": -104.73,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_135A9227_1C2D_D291_41BA_788D155A4F3A",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 6)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c"
 },
 "maps": [
  {
   "yaw": -1.78,
   "hfov": 27.46,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0_HS_1_0_0_map.gif",
      "width": 34,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -23.2,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D7E9206_1D01_4E5D_4190_8090205E35F8",
   "hfov": 27.46,
   "pitch": -23.2,
   "yaw": -1.78,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_132824E5_1C2C_7796_41B9_E4461BCDB9B8",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDA6DCA_00C6_FA72_4166_D44426E4EE00, this.camera_136CF36C_1D01_4EAD_41A8_DCF6F0EDED40); this.mainPlayList.set('selectedIndex', 4)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": 24.69,
   "hfov": 16.23,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0_HS_2_0_0_map.gif",
      "width": 17,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 11.62,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0_HS_2_0.png",
      "width": 188,
      "height": 172,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": 24.69,
   "hfov": 16.23,
   "pitch": 11.62
  }
 ],
 "id": "overlay_137B9952_1C2C_5EB3_41A1_E3A5503294D5",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0, this.camera_137A3379_1D01_4EB7_41B4_5B53081A5289); this.mainPlayList.set('selectedIndex', 2)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": -160.51,
   "hfov": 10.19,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0_HS_3_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 8.37,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0_HS_3_0.png",
      "width": 117,
      "height": 117,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -160.51,
   "hfov": 10.19,
   "pitch": 8.37
  }
 ],
 "id": "overlay_1380A56F_1C35_F692_4188_1C24DE02A3AA",
 "rollOverDisplay": false
},
{
 "cursor": "hand",
 "maxWidth": 150,
 "id": "IconButton_23F7E7B7_0C0A_6293_419F_D3D84EB3AFBD",
 "maxHeight": 150,
 "width": "12%",
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "minHeight": 70,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": true,
 "propagateClick": false,
 "height": "8%",
 "rollOverIconURL": "skin/IconButton_23F7E7B7_0C0A_6293_419F_D3D84EB3AFBD_rollover.png",
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_23F7E7B7_0C0A_6293_419F_D3D84EB3AFBD_pressed.png",
 "minWidth": 70,
 "verticalAlign": "middle",
 "mode": "push",
 "iconURL": "skin/IconButton_23F7E7B7_0C0A_6293_419F_D3D84EB3AFBD.png",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton <"
 }
},
{
 "cursor": "hand",
 "maxWidth": 60,
 "id": "IconButton_2BE71718_0D55_6990_41A5_73D31D902E1D",
 "left": 10,
 "maxHeight": 60,
 "width": "14.22%",
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "bottom": "20%",
 "transparencyActive": false,
 "propagateClick": false,
 "top": "20%",
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_2BE71718_0D55_6990_41A5_73D31D902E1D_pressed.png",
 "borderSize": 0,
 "minWidth": 50,
 "rollOverIconURL": "skin/IconButton_2BE71718_0D55_6990_41A5_73D31D902E1D_rollover.png",
 "verticalAlign": "middle",
 "mode": "push",
 "iconURL": "skin/IconButton_2BE71718_0D55_6990_41A5_73D31D902E1D.png",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton <"
 }
},
{
 "cursor": "hand",
 "maxWidth": 60,
 "id": "IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482",
 "left": 10,
 "maxHeight": 60,
 "width": "14.22%",
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "bottom": "20%",
 "transparencyActive": false,
 "propagateClick": false,
 "top": "20%",
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482_pressed.png",
 "borderSize": 0,
 "minWidth": 50,
 "rollOverIconURL": "skin/IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482_rollover.png",
 "verticalAlign": "middle",
 "mode": "push",
 "iconURL": "skin/IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482.png",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton <"
 }
},
{
 "cursor": "hand",
 "maxWidth": 150,
 "id": "IconButton_23F037B7_0C0A_6293_41A2_C1707EE666E4",
 "maxHeight": 150,
 "width": "12%",
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "minHeight": 70,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": true,
 "propagateClick": false,
 "height": "8%",
 "rollOverIconURL": "skin/IconButton_23F037B7_0C0A_6293_41A2_C1707EE666E4_rollover.png",
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_23F037B7_0C0A_6293_41A2_C1707EE666E4_pressed.png",
 "minWidth": 70,
 "verticalAlign": "middle",
 "mode": "push",
 "iconURL": "skin/IconButton_23F037B7_0C0A_6293_41A2_C1707EE666E4.png",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton >"
 }
},
{
 "cursor": "hand",
 "maxWidth": 60,
 "id": "IconButton_28BF3E40_0D4B_DBF0_41A3_D5D2941E6E14",
 "maxHeight": 60,
 "width": "14.22%",
 "horizontalAlign": "center",
 "right": 10,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "bottom": "20%",
 "transparencyActive": false,
 "propagateClick": false,
 "top": "20%",
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_28BF3E40_0D4B_DBF0_41A3_D5D2941E6E14_pressed.png",
 "borderSize": 0,
 "minWidth": 50,
 "rollOverIconURL": "skin/IconButton_28BF3E40_0D4B_DBF0_41A3_D5D2941E6E14_rollover.png",
 "verticalAlign": "middle",
 "mode": "push",
 "iconURL": "skin/IconButton_28BF3E40_0D4B_DBF0_41A3_D5D2941E6E14.png",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton >"
 }
},
{
 "cursor": "hand",
 "maxWidth": 60,
 "id": "IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510",
 "maxHeight": 60,
 "width": "14.22%",
 "horizontalAlign": "center",
 "right": 10,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "bottom": "20%",
 "transparencyActive": false,
 "propagateClick": false,
 "top": "20%",
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510_pressed.png",
 "borderSize": 0,
 "minWidth": 50,
 "rollOverIconURL": "skin/IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510_rollover.png",
 "verticalAlign": "middle",
 "mode": "push",
 "iconURL": "skin/IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510.png",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton >"
 }
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 8)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c"
 },
 "maps": [
  {
   "yaw": 179.97,
   "hfov": 16.16,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0_HS_0_0_0_map.gif",
      "width": 34,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -12.29,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D7C0206_1D01_4E5D_41AB_4E7A8ABA3F7C",
   "hfov": 16.16,
   "pitch": -12.29,
   "yaw": 179.97,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_0E6CCE08_1C34_D29E_41B0_FA18359C5226",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BDAA661_00C7_162E_4165_40895C4E611D, this.camera_0C5692DD_1D01_4FEC_41B0_C598C64B6F4C); this.mainPlayList.set('selectedIndex', 10)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c"
 },
 "maps": [
  {
   "yaw": -0.89,
   "hfov": 15.03,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0_HS_1_0_0_map.gif",
      "width": 34,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -24.65,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D7C5207_1D01_4E5B_41AB_C3CF7EFA2717",
   "hfov": 15.03,
   "pitch": -24.65,
   "yaw": -0.89,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_0E674997_1C2C_31B2_41B2_9B8870CE8152",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 15)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": -134.93,
   "hfov": 18.61,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0_HS_2_0_0_map.gif",
      "width": 18,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 12.1,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0_HS_2_0.png",
      "width": 216,
      "height": 191,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -134.93,
   "hfov": 18.61,
   "pitch": 12.1
  }
 ],
 "id": "overlay_0E0EF05C_1C2C_2EB6_419B_2F7AF51569C7",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D833207_1D01_4E5B_41A5_1090D2DA8E40",
   "hfov": 25.6,
   "pitch": -32.06,
   "yaw": -54.46,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "data": {
  "label": "Arrow 05c Left-Up"
 },
 "maps": [
  {
   "yaw": -54.46,
   "hfov": 25.6,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0_HS_3_0_0_map.gif",
      "width": 44,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -32.06,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_0EECD268_1C2C_D29F_41A9_9AEC074AB013",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_0BD9C176_00C7_6A13_4164_A846E95E0684, this.camera_0C4692D0_1D01_4FF4_41A0_A263634A67B1); this.mainPlayList.set('selectedIndex', 14)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": 165.55,
   "hfov": 14.16,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0_HS_0_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -9.25,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BD98436_00C7_EA12_4167_C54DA89BD21A_0_HS_0_0.png",
      "width": 163,
      "height": 172,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": 165.55,
   "hfov": 14.16,
   "pitch": -9.25
  }
 ],
 "id": "overlay_0462F4BB_1C34_57F2_4198_B56084CFF99F",
 "rollOverDisplay": false
},
{
 "items": [
  {
   "media": "this.album_0513B074_1C54_2F76_41B3_F0FF6AC90635_0",
   "camera": {
    "duration": 5000,
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "zoomFactor": 1.1,
     "x": "0.39",
     "y": "0.31",
     "class": "PhotoCameraPosition"
    },
    "initialPosition": {
     "zoomFactor": 1,
     "x": "0.50",
     "y": "0.50",
     "class": "PhotoCameraPosition"
    },
    "scaleMode": "fit_outside",
    "easing": "linear"
   },
   "class": "PhotoPlayListItem"
  },
  {
   "media": "this.album_0513B074_1C54_2F76_41B3_F0FF6AC90635_1",
   "camera": {
    "duration": 5000,
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "zoomFactor": 1.1,
     "x": "0.59",
     "y": "0.59",
     "class": "PhotoCameraPosition"
    },
    "initialPosition": {
     "zoomFactor": 1,
     "x": "0.50",
     "y": "0.50",
     "class": "PhotoCameraPosition"
    },
    "scaleMode": "fit_outside",
    "easing": "linear"
   },
   "class": "PhotoPlayListItem"
  },
  {
   "media": "this.album_0513B074_1C54_2F76_41B3_F0FF6AC90635_2",
   "camera": {
    "duration": 5000,
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "zoomFactor": 1.1,
     "x": "0.57",
     "y": "0.67",
     "class": "PhotoCameraPosition"
    },
    "initialPosition": {
     "zoomFactor": 1,
     "x": "0.50",
     "y": "0.50",
     "class": "PhotoCameraPosition"
    },
    "scaleMode": "fit_outside",
    "easing": "linear"
   },
   "class": "PhotoPlayListItem"
  },
  {
   "media": "this.album_0513B074_1C54_2F76_41B3_F0FF6AC90635_3",
   "camera": {
    "duration": 5000,
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "zoomFactor": 1.1,
     "x": "0.45",
     "y": "0.48",
     "class": "PhotoCameraPosition"
    },
    "initialPosition": {
     "zoomFactor": 1,
     "x": "0.50",
     "y": "0.50",
     "class": "PhotoCameraPosition"
    },
    "scaleMode": "fit_outside",
    "easing": "linear"
   },
   "class": "PhotoPlayListItem"
  },
  {
   "media": "this.album_0513B074_1C54_2F76_41B3_F0FF6AC90635_4",
   "camera": {
    "duration": 5000,
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "zoomFactor": 1.1,
     "x": "0.60",
     "y": "0.31",
     "class": "PhotoCameraPosition"
    },
    "initialPosition": {
     "zoomFactor": 1,
     "x": "0.50",
     "y": "0.50",
     "class": "PhotoCameraPosition"
    },
    "scaleMode": "fit_outside",
    "easing": "linear"
   },
   "class": "PhotoPlayListItem"
  },
  {
   "media": "this.album_0513B074_1C54_2F76_41B3_F0FF6AC90635_5",
   "camera": {
    "duration": 5000,
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "zoomFactor": 1.1,
     "x": "0.34",
     "y": "0.54",
     "class": "PhotoCameraPosition"
    },
    "initialPosition": {
     "zoomFactor": 1,
     "x": "0.50",
     "y": "0.50",
     "class": "PhotoCameraPosition"
    },
    "scaleMode": "fit_outside",
    "easing": "linear"
   },
   "class": "PhotoPlayListItem"
  },
  {
   "media": "this.album_0513B074_1C54_2F76_41B3_F0FF6AC90635_6",
   "camera": {
    "duration": 5000,
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "zoomFactor": 1.1,
     "x": "0.52",
     "y": "0.34",
     "class": "PhotoCameraPosition"
    },
    "initialPosition": {
     "zoomFactor": 1,
     "x": "0.50",
     "y": "0.50",
     "class": "PhotoCameraPosition"
    },
    "scaleMode": "fit_outside",
    "easing": "linear"
   },
   "class": "PhotoPlayListItem"
  },
  {
   "media": "this.album_0513B074_1C54_2F76_41B3_F0FF6AC90635_7",
   "camera": {
    "duration": 5000,
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "zoomFactor": 1.1,
     "x": "0.66",
     "y": "0.32",
     "class": "PhotoCameraPosition"
    },
    "initialPosition": {
     "zoomFactor": 1,
     "x": "0.50",
     "y": "0.50",
     "class": "PhotoCameraPosition"
    },
    "scaleMode": "fit_outside",
    "easing": "linear"
   },
   "class": "PhotoPlayListItem"
  },
  {
   "media": "this.album_0513B074_1C54_2F76_41B3_F0FF6AC90635_8",
   "camera": {
    "duration": 5000,
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "zoomFactor": 1.1,
     "x": "0.25",
     "y": "0.55",
     "class": "PhotoCameraPosition"
    },
    "initialPosition": {
     "zoomFactor": 1,
     "x": "0.50",
     "y": "0.50",
     "class": "PhotoCameraPosition"
    },
    "scaleMode": "fit_outside",
    "easing": "linear"
   },
   "class": "PhotoPlayListItem"
  }
 ],
 "id": "album_0513B074_1C54_2F76_41B3_F0FF6AC90635_AlbumPlayList",
 "class": "PhotoPlayList"
},
{
 "enabledInCardboard": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0_HS_0_0.png",
      "width": 141,
      "height": 138,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": 179.28,
   "hfov": 12.41,
   "pitch": 3.02
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "yaw": 179.28,
   "hfov": 12.41,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0_HS_0_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 3.02,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_0AE3118A_1C2D_D192_419F_B1D7A859F67C",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 18)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 05c Left-Up"
 },
 "maps": [
  {
   "yaw": -123.99,
   "hfov": 27.8,
   "image": {
    "levels": [
     {
      "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0_HS_1_0_0_map.gif",
      "width": 44,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -15.38,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_0D80720A_1D01_4E55_41BB_D1FF013F5A41",
   "hfov": 27.8,
   "pitch": -15.38,
   "yaw": -123.99,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "id": "overlay_0A0F4689_1C2F_D39E_41BB_1D9A4EEEB88F",
 "rollOverDisplay": false
},
{
 "contentOpaque": false,
 "children": [
  "this.IconButton_EF8F8BD8_E386_8E02_41D6_310FF1964329"
 ],
 "id": "Container_EF8F8BD8_E386_8E02_41E5_FC5C5513733A",
 "horizontalAlign": "center",
 "width": 110,
 "right": "0%",
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "borderSize": 0,
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "height": 110,
 "top": "0%",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "middle",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "button menu sup"
 },
 "layout": "horizontal"
},
{
 "contentOpaque": false,
 "children": [
  "this.IconButton_EF7806FA_E38F_8606_41E5_5C4557EBCACB",
  "this.IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A",
  "this.IconButton_EED073D3_E38A_9E06_41E1_6CCC9722545D",
  "this.IconButton_EEEB3760_E38B_8603_41D6_FE6B11A3DA96",
  "this.IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0",
  "this.IconButton_EE5807F6_E3BE_860E_41E7_431DDDA54BAC",
  "this.IconButton_EED5213F_E3B9_7A7D_41D8_1B642C004521"
 ],
 "id": "Container_EF8F8BD8_E386_8E02_41E5_90850B5F0BBE",
 "horizontalAlign": "center",
 "width": "91.304%",
 "right": "0%",
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "bottom": "0%",
 "propagateClick": true,
 "height": "85.959%",
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 3,
 "class": "Container",
 "scrollBarMargin": 2,
 "shadow": false,
 "visible": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "-button set"
 },
 "layout": "vertical"
},
{
 "maxWidth": 3000,
 "id": "Image_1B99DD00_16C4_0505_41B3_51F09727447A",
 "left": "0%",
 "maxHeight": 2,
 "horizontalAlign": "center",
 "right": "0%",
 "backgroundOpacity": 0,
 "url": "skin/Image_1B99DD00_16C4_0505_41B3_51F09727447A.png",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "bottom": 53,
 "propagateClick": true,
 "height": 2,
 "paddingBottom": 0,
 "borderSize": 0,
 "minWidth": 1,
 "verticalAlign": "middle",
 "class": "Image",
 "scaleMode": "fit_outside",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "white line"
 }
},
{
 "contentOpaque": false,
 "children": [
  "this.Button_1B998D00_16C4_0505_41AD_67CAA4AAEFE0",
  "this.Button_1B999D00_16C4_0505_41AB_D0C2E7857448",
  "this.Button_1B9A6D00_16C4_0505_4197_F2108627CC98",
  "this.Button_1B9A4D00_16C4_0505_4193_E0EA69B0CBB0",
  "this.Button_1B9A5D00_16C4_0505_41B0_D18F25F377C4"
 ],
 "id": "Container_1B99BD00_16C4_0505_41A4_A3C2452B0288",
 "left": "0%",
 "horizontalAlign": "left",
 "width": 1199,
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "bottom": "0%",
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "paddingBottom": 0,
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "height": 51,
 "minWidth": 1,
 "verticalAlign": "middle",
 "scrollBarWidth": 10,
 "gap": 3,
 "class": "Container",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 30,
 "data": {
  "name": "-button set container"
 },
 "layout": "horizontal"
},
{
 "textDecoration": "none",
 "cursor": "hand",
 "fontFamily": "Netron",
 "fontColor": "#FFFFFF",
 "pressedBackgroundOpacity": 1,
 "shadowBlurRadius": 15,
 "id": "Button_04A2AE30_1C2C_728F_41B1_C2109416FF76",
 "left": "0.06%",
 "horizontalAlign": "center",
 "width": 280,
 "rollOverBackgroundColor": [
  "#04A3E1"
 ],
 "shadowColor": "#000000",
 "rollOverShadow": false,
 "backgroundOpacity": 0,
 "shadowSpread": 1,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "iconHeight": 0,
 "rollOverBackgroundOpacity": 0.8,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "borderSize": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "rollOverBackgroundColorRatios": [
  0.01
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": true,
 "height": 50.5,
 "top": "4.24%",
 "paddingBottom": 0,
 "label": "Real Estate",
 "backgroundColor": [
  "#000000"
 ],
 "minWidth": 1,
 "verticalAlign": "middle",
 "iconBeforeLabel": true,
 "click": "this.setComponentVisibility(this.Container_062AB830_1140_E215_41AF_6C9D65345420, true, 0, null, null, false)",
 "fontStyle": "normal",
 "mode": "push",
 "gap": 5,
 "class": "Button",
 "fontSize": "27px",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "fontWeight": "bold",
 "iconWidth": 0,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Button house info"
 },
 "layout": "horizontal"
},
{
 "contentOpaque": false,
 "children": [
  "this.Container_062A682F_1140_E20B_41B0_3071FCBF3DC9",
  "this.Container_062A082F_1140_E20A_4193_DF1A4391DC79"
 ],
 "shadowBlurRadius": 25,
 "id": "Container_062A782F_1140_E20B_41AF_B3E5DE341773",
 "left": "10%",
 "horizontalAlign": "left",
 "shadowHorizontalLength": 0,
 "shadowColor": "#000000",
 "right": "10%",
 "shadowSpread": 1,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "bottom": "5%",
 "top": "5%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "paddingTop": 0,
 "shadow": true,
 "paddingLeft": 0,
 "data": {
  "name": "Global"
 },
 "layout": "horizontal"
},
{
 "contentOpaque": false,
 "children": [
  "this.IconButton_062A8830_1140_E215_419D_3439F16CCB3E"
 ],
 "id": "Container_062A9830_1140_E215_41A7_5F2BBE5C20E4",
 "left": "10%",
 "horizontalAlign": "right",
 "right": "10%",
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 20,
 "bottom": "80%",
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "top": "5%",
 "paddingBottom": 0,
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 20,
 "paddingLeft": 0,
 "data": {
  "name": "Container X global"
 },
 "layout": "vertical"
},
{
 "contentOpaque": false,
 "children": [
  "this.Container_23F797B7_0C0A_6293_41A7_EC89DBCDB93F",
  "this.Container_23F027B7_0C0A_6293_418E_075FCFAA8A19"
 ],
 "shadowBlurRadius": 25,
 "id": "Container_23F7B7B7_0C0A_6293_4197_F931EEC6FA48",
 "left": "10%",
 "horizontalAlign": "left",
 "shadowHorizontalLength": 0,
 "shadowColor": "#000000",
 "right": "10%",
 "shadowSpread": 1,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "bottom": "5%",
 "top": "5%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "paddingTop": 0,
 "shadow": true,
 "paddingLeft": 0,
 "data": {
  "name": "Global"
 },
 "layout": "horizontal"
},
{
 "contentOpaque": false,
 "children": [
  "this.IconButton_23F087B8_0C0A_629D_4194_6F34C6CBE1DA"
 ],
 "id": "Container_23F097B8_0C0A_629D_4176_D87C90BA32B6",
 "left": "10%",
 "horizontalAlign": "right",
 "right": "10%",
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 20,
 "bottom": "80%",
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "top": "5%",
 "paddingBottom": 0,
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 20,
 "paddingLeft": 0,
 "data": {
  "name": "Container X global"
 },
 "layout": "vertical"
},
{
 "contentOpaque": false,
 "children": [
  "this.Container_3A67552A_0C3A_67BD_4195_ECE46CCB34EA",
  "this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0"
 ],
 "shadowBlurRadius": 25,
 "id": "Container_39A197B1_0C06_62AF_419A_D15E4DDD2528",
 "left": "15%",
 "horizontalAlign": "center",
 "shadowHorizontalLength": 0,
 "shadowColor": "#000000",
 "right": "15%",
 "shadowSpread": 1,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "bottom": "7%",
 "top": "7%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "paddingTop": 0,
 "shadow": true,
 "paddingLeft": 0,
 "data": {
  "name": "Global"
 },
 "layout": "vertical"
},
{
 "contentOpaque": false,
 "children": [
  "this.Container_221C0648_0C06_E5FD_4193_12BCE1D6DD6B",
  "this.Container_221C9648_0C06_E5FD_41A1_A79DE53B3031"
 ],
 "shadowBlurRadius": 25,
 "id": "Container_221C1648_0C06_E5FD_4180_8A2E8B66315E",
 "left": "10%",
 "horizontalAlign": "left",
 "shadowHorizontalLength": 0,
 "shadowColor": "#000000",
 "right": "10%",
 "shadowSpread": 1,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "bottom": "5%",
 "top": "5%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "paddingTop": 0,
 "shadow": true,
 "paddingLeft": 0,
 "data": {
  "name": "Global"
 },
 "layout": "horizontal"
},
{
 "contentOpaque": false,
 "children": [
  "this.IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF"
 ],
 "id": "Container_221B3648_0C06_E5FD_4199_FCE031AE003B",
 "left": "10%",
 "horizontalAlign": "right",
 "right": "10%",
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 20,
 "bottom": "80%",
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "top": "5%",
 "paddingBottom": 0,
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 20,
 "paddingLeft": 0,
 "data": {
  "name": "Container X global"
 },
 "layout": "vertical"
},
{
 "contentOpaque": false,
 "children": [
  "this.Container_2F8A7686_0D4F_6B71_41A9_1A894413085C",
  "this.MapViewer"
 ],
 "shadowBlurRadius": 25,
 "id": "Container_2F8A6686_0D4F_6B71_4174_A02FE43588D3",
 "left": "15%",
 "horizontalAlign": "center",
 "shadowHorizontalLength": 0,
 "shadowColor": "#000000",
 "right": "15%",
 "shadowSpread": 1,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "bottom": "7%",
 "top": "7%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "paddingTop": 0,
 "shadow": true,
 "paddingLeft": 0,
 "data": {
  "name": "Global"
 },
 "layout": "vertical"
},
{
 "contentOpaque": false,
 "children": [
  "this.Container_28214A13_0D5D_5B97_4193_B631E1496339",
  "this.Container_2B0BF61C_0D5B_2B90_4179_632488B1209E"
 ],
 "shadowBlurRadius": 25,
 "id": "Container_28215A13_0D5D_5B97_4198_A7CA735E9E0A",
 "left": "15%",
 "horizontalAlign": "center",
 "shadowHorizontalLength": 0,
 "shadowColor": "#000000",
 "right": "15%",
 "shadowSpread": 1,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "bottom": "7%",
 "top": "7%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "paddingTop": 0,
 "shadow": true,
 "paddingLeft": 0,
 "data": {
  "name": "Global"
 },
 "layout": "vertical"
},
{
 "contentOpaque": false,
 "children": [
  "this.Container_2A19EC4C_0D3B_DFF0_414D_37145C22C5BC"
 ],
 "shadowBlurRadius": 25,
 "id": "Container_2A193C4C_0D3B_DFF0_4161_A2CD128EF536",
 "left": "15%",
 "horizontalAlign": "center",
 "shadowHorizontalLength": 0,
 "shadowColor": "#000000",
 "right": "15%",
 "shadowSpread": 1,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "bottom": "7%",
 "top": "7%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "paddingTop": 0,
 "shadow": true,
 "paddingLeft": 0,
 "data": {
  "name": "Global"
 },
 "layout": "vertical"
},
{
 "contentOpaque": false,
 "children": [
  "this.Container_06C5ABA5_1140_A63F_41A9_850CF958D0DB",
  "this.Container_06C58BA5_1140_A63F_419D_EC83F94F8C54"
 ],
 "shadowBlurRadius": 25,
 "id": "Container_06C5DBA5_1140_A63F_41AD_1D83A33F1255",
 "left": "10%",
 "horizontalAlign": "left",
 "shadowHorizontalLength": 0,
 "shadowColor": "#000000",
 "right": "10%",
 "shadowSpread": 1,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "bottom": "5%",
 "top": "5%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "paddingTop": 0,
 "shadow": true,
 "paddingLeft": 0,
 "data": {
  "name": "Global"
 },
 "layout": "horizontal"
},
{
 "contentOpaque": false,
 "children": [
  "this.IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81"
 ],
 "id": "Container_06C43BA5_1140_A63F_41A1_96DC8F4CAD2F",
 "left": "10%",
 "horizontalAlign": "right",
 "right": "10%",
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 20,
 "bottom": "80%",
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "top": "5%",
 "paddingBottom": 0,
 "borderSize": 0,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 20,
 "paddingLeft": 0,
 "data": {
  "name": "Container X global"
 },
 "layout": "vertical"
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D7D8206_1D01_4E5D_41B2_236A0DB17DF9",
 "levels": [
  {
   "url": "media/panorama_0BDB6B46_00C7_1E72_4168_07B013644602_0_HS_0_0.png",
   "width": 560,
   "height": 300,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D81A209_1D01_4E57_41B7_A739EAB86B4F",
 "levels": [
  {
   "url": "media/panorama_0BD98403_00C7_69F2_4155_E5CEC9B19C6A_0_HS_0_0.png",
   "width": 560,
   "height": 300,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D824208_1D01_4E55_41A4_1F12B4559582",
 "levels": [
  {
   "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0_HS_0_0.png",
   "width": 480,
   "height": 330,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D82F208_1D01_4E55_41B3_DB4D10900300",
 "levels": [
  {
   "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0_HS_1_0.png",
   "width": 560,
   "height": 300,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D810208_1D01_4E55_41B9_0682A0E79D44",
 "levels": [
  {
   "url": "media/panorama_0BD8FD5E_00C7_1A13_4141_0F49D850A8D2_0_HS_2_0.png",
   "width": 480,
   "height": 330,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D7891FF_1D01_4DAB_41A9_5B0E3BDB4FB1",
 "levels": [
  {
   "url": "media/panorama_0BDBB088_00C6_EAFE_415D_3E9F19799FF0_0_HS_9_0.png",
   "width": 560,
   "height": 300,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D834207_1D01_4E5B_41B8_99743AFA245D",
 "levels": [
  {
   "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0_HS_0_0.png",
   "width": 480,
   "height": 330,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D83E207_1D01_4E5B_41B4_B1F702DC76FD",
 "levels": [
  {
   "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0_HS_1_0.png",
   "width": 480,
   "height": 330,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D820208_1D01_4E55_41AA_E609AD56707C",
 "levels": [
  {
   "url": "media/panorama_0BDAA661_00C7_162E_4165_40895C4E611D_0_HS_2_0.png",
   "width": 480,
   "height": 330,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D806209_1D01_4E57_41B3_180A48D0ADC1",
 "levels": [
  {
   "url": "media/panorama_0BD9C176_00C7_6A13_4164_A846E95E0684_0_HS_0_0.png",
   "width": 480,
   "height": 330,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D80C209_1D01_4E57_419A_0FE5ACF82DA1",
 "levels": [
  {
   "url": "media/panorama_0BDBEEF5_00C7_1616_4160_C1381D525209_0_HS_0_0.png",
   "width": 480,
   "height": 330,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D81C209_1D01_4E57_41A8_967E72435B3E",
 "levels": [
  {
   "url": "media/panorama_0BDB8AD2_00C7_7E13_4164_064290B46ED3_0_HS_0_0.png",
   "width": 480,
   "height": 330,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D7E5205_1D01_4E5F_4158_97BF3D43F108",
 "levels": [
  {
   "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0_HS_0_0.png",
   "width": 480,
   "height": 330,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D7E9206_1D01_4E5D_4190_8090205E35F8",
 "levels": [
  {
   "url": "media/panorama_0BDAB4AA_00C6_EA33_4117_C9F3351FDE50_0_HS_1_0.png",
   "width": 480,
   "height": 330,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D7C0206_1D01_4E5D_41AB_4E7A8ABA3F7C",
 "levels": [
  {
   "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0_HS_0_0.png",
   "width": 480,
   "height": 330,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D7C5207_1D01_4E5B_41AB_C3CF7EFA2717",
 "levels": [
  {
   "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0_HS_1_0.png",
   "width": 480,
   "height": 330,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D833207_1D01_4E5B_41A5_1090D2DA8E40",
 "levels": [
  {
   "url": "media/panorama_0BDBDF7C_00C7_3616_4155_0F8F99B00674_0_HS_3_0.png",
   "width": 560,
   "height": 300,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_0D80720A_1D01_4E55_41BB_D1FF013F5A41",
 "levels": [
  {
   "url": "media/panorama_0BDDA633_00C7_3612_414A_51361A0A976F_0_HS_1_0.png",
   "width": 560,
   "height": 300,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "cursor": "hand",
 "maxWidth": 60,
 "id": "IconButton_EF8F8BD8_E386_8E02_41D6_310FF1964329",
 "maxHeight": 60,
 "width": 60,
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": true,
 "propagateClick": true,
 "height": 60,
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_EF8F8BD8_E386_8E02_41D6_310FF1964329_pressed.png",
 "minWidth": 1,
 "verticalAlign": "middle",
 "click": "if(!this.Container_EF8F8BD8_E386_8E02_41E5_90850B5F0BBE.get('visible')){ this.setComponentVisibility(this.Container_EF8F8BD8_E386_8E02_41E5_90850B5F0BBE, true, 0, null, null, false) } else { this.setComponentVisibility(this.Container_EF8F8BD8_E386_8E02_41E5_90850B5F0BBE, false, 0, null, null, false) }",
 "mode": "toggle",
 "iconURL": "skin/IconButton_EF8F8BD8_E386_8E02_41D6_310FF1964329.png",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "image button menu"
 }
},
{
 "cursor": "hand",
 "maxWidth": 58,
 "id": "IconButton_EE5807F6_E3BE_860E_41E7_431DDDA54BAC",
 "maxHeight": 58,
 "width": 58,
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": true,
 "propagateClick": true,
 "height": 58,
 "rollOverIconURL": "skin/IconButton_EE5807F6_E3BE_860E_41E7_431DDDA54BAC_rollover.png",
 "paddingBottom": 0,
 "click": "this.shareTwitter(window.location.href)",
 "minWidth": 1,
 "verticalAlign": "middle",
 "mode": "push",
 "iconURL": "skin/IconButton_EE5807F6_E3BE_860E_41E7_431DDDA54BAC.png",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton TWITTER"
 }
},
{
 "cursor": "hand",
 "maxWidth": 58,
 "id": "IconButton_EED5213F_E3B9_7A7D_41D8_1B642C004521",
 "maxHeight": 58,
 "width": 58,
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": true,
 "propagateClick": true,
 "height": 58,
 "rollOverIconURL": "skin/IconButton_EED5213F_E3B9_7A7D_41D8_1B642C004521_rollover.png",
 "paddingBottom": 0,
 "click": "this.shareFacebook(window.location.href)",
 "minWidth": 1,
 "verticalAlign": "middle",
 "mode": "push",
 "iconURL": "skin/IconButton_EED5213F_E3B9_7A7D_41D8_1B642C004521.png",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton FB"
 }
},
{
 "textDecoration": "none",
 "cursor": "hand",
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "iconBeforeLabel": true,
 "pressedBackgroundOpacity": 1,
 "shadowBlurRadius": 15,
 "id": "Button_1B998D00_16C4_0505_41AD_67CAA4AAEFE0",
 "rollOverBackgroundColor": [
  "#04A3E1"
 ],
 "horizontalAlign": "center",
 "width": 120,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "shadowColor": "#000000",
 "rollOverShadow": false,
 "backgroundOpacity": 0,
 "shadowSpread": 1,
 "iconHeight": 0,
 "rollOverBackgroundOpacity": 0.8,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "borderSize": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "rollOverBackgroundColorRatios": [
  0.01
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": true,
 "height": 40,
 "paddingBottom": 0,
 "label": "HOUSE INFO",
 "mode": "push",
 "backgroundColor": [
  "#000000"
 ],
 "minWidth": 1,
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_062AB830_1140_E215_41AF_6C9D65345420, true, 0, null, null, false)",
 "fontStyle": "normal",
 "gap": 5,
 "class": "Button",
 "fontSize": 12,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "fontWeight": "bold",
 "iconWidth": 0,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Button house info"
 },
 "layout": "horizontal"
},
{
 "textDecoration": "none",
 "cursor": "hand",
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "iconBeforeLabel": true,
 "pressedBackgroundOpacity": 1,
 "shadowBlurRadius": 15,
 "id": "Button_1B999D00_16C4_0505_41AB_D0C2E7857448",
 "rollOverBackgroundColor": [
  "#04A3E1"
 ],
 "horizontalAlign": "center",
 "width": 130,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "shadowColor": "#000000",
 "backgroundOpacity": 0,
 "shadowSpread": 1,
 "iconHeight": 32,
 "rollOverBackgroundOpacity": 0.8,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "borderSize": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "height": 40,
 "paddingBottom": 0,
 "label": "PANORAMA LIST",
 "mode": "push",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "minWidth": 1,
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15, true, 0, null, null, false)",
 "fontStyle": "normal",
 "gap": 5,
 "class": "Button",
 "fontSize": 12,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "fontWeight": "bold",
 "iconWidth": 32,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Button panorama list"
 },
 "layout": "horizontal"
},
{
 "textDecoration": "none",
 "cursor": "hand",
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "iconBeforeLabel": true,
 "pressedBackgroundOpacity": 1,
 "shadowBlurRadius": 15,
 "id": "Button_1B9A6D00_16C4_0505_4197_F2108627CC98",
 "rollOverBackgroundColor": [
  "#04A3E1"
 ],
 "horizontalAlign": "center",
 "width": 90,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "shadowColor": "#000000",
 "backgroundOpacity": 0,
 "shadowSpread": 1,
 "iconHeight": 32,
 "rollOverBackgroundOpacity": 0.8,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "borderSize": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "height": 40,
 "paddingBottom": 0,
 "label": "LOCATION",
 "mode": "push",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "minWidth": 1,
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7, true, 0, null, null, false)",
 "fontStyle": "normal",
 "gap": 5,
 "class": "Button",
 "fontSize": 12,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "fontWeight": "bold",
 "iconWidth": 32,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Button location"
 },
 "layout": "horizontal"
},
{
 "textDecoration": "none",
 "cursor": "hand",
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "iconBeforeLabel": true,
 "pressedBackgroundOpacity": 1,
 "shadowBlurRadius": 15,
 "id": "Button_1B9A4D00_16C4_0505_4193_E0EA69B0CBB0",
 "rollOverBackgroundColor": [
  "#04A3E1"
 ],
 "horizontalAlign": "center",
 "width": 103,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "shadowColor": "#000000",
 "backgroundOpacity": 0,
 "shadowSpread": 1,
 "iconHeight": 32,
 "rollOverBackgroundOpacity": 0.8,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "borderSize": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "height": 40,
 "paddingBottom": 0,
 "label": "FLOORPLAN",
 "mode": "push",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "minWidth": 1,
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41, true, 0, null, null, false)",
 "fontStyle": "normal",
 "gap": 5,
 "class": "Button",
 "fontSize": 12,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "fontWeight": "bold",
 "iconWidth": 32,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Button floorplan"
 },
 "layout": "horizontal"
},
{
 "textDecoration": "none",
 "cursor": "hand",
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "iconBeforeLabel": true,
 "pressedBackgroundOpacity": 1,
 "shadowBlurRadius": 15,
 "id": "Button_1B9A5D00_16C4_0505_41B0_D18F25F377C4",
 "rollOverBackgroundColor": [
  "#04A3E1"
 ],
 "horizontalAlign": "center",
 "width": 112,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "shadowColor": "#000000",
 "backgroundOpacity": 0,
 "shadowSpread": 1,
 "iconHeight": 32,
 "rollOverBackgroundOpacity": 0.8,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "borderSize": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "height": 40,
 "paddingBottom": 0,
 "label": "PHOTOALBUM",
 "mode": "push",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "minWidth": 1,
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E, true, 0, null, null, false)",
 "fontStyle": "normal",
 "gap": 5,
 "class": "Button",
 "fontSize": 12,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "fontWeight": "bold",
 "iconWidth": 32,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Button photoalbum"
 },
 "layout": "horizontal"
},
{
 "contentOpaque": false,
 "children": [
  "this.Image_062A182F_1140_E20B_41B0_9CB8FFD6AA5A"
 ],
 "id": "Container_062A682F_1140_E20B_41B0_3071FCBF3DC9",
 "horizontalAlign": "center",
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "width": "85%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#000000"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "minWidth": 1,
 "verticalAlign": "middle",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "-left"
 },
 "layout": "absolute"
},
{
 "contentOpaque": false,
 "children": [
  "this.Container_062A3830_1140_E215_4195_1698933FE51C",
  "this.Container_062A2830_1140_E215_41AA_EB25B7BD381C",
  "this.Container_062AE830_1140_E215_4180_196ED689F4BD"
 ],
 "id": "Container_062A082F_1140_E20A_4193_DF1A4391DC79",
 "horizontalAlign": "left",
 "backgroundOpacity": 1,
 "scrollBarColor": "#0069A3",
 "width": "50%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 50,
 "borderSize": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 20,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.51,
 "height": "100%",
 "minWidth": 460,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 0,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 20,
 "paddingLeft": 50,
 "data": {
  "name": "-right"
 },
 "layout": "vertical"
},
{
 "cursor": "hand",
 "maxWidth": 60,
 "id": "IconButton_062A8830_1140_E215_419D_3439F16CCB3E",
 "maxHeight": 60,
 "width": "25%",
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "propagateClick": false,
 "height": "75%",
 "rollOverIconURL": "skin/IconButton_062A8830_1140_E215_419D_3439F16CCB3E_rollover.jpg",
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_062A8830_1140_E215_419D_3439F16CCB3E_pressed.jpg",
 "minWidth": 50,
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_062AB830_1140_E215_41AF_6C9D65345420, false, 0, null, null, false)",
 "mode": "push",
 "iconURL": "skin/IconButton_062A8830_1140_E215_419D_3439F16CCB3E.jpg",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "X"
 }
},
{
 "contentOpaque": false,
 "children": [
  "this.ViewerAreaLabeled_23F787B7_0C0A_6293_419A_B4B58B92DAFC",
  "this.Container_23F7F7B7_0C0A_6293_4195_D6240EBAFDC0"
 ],
 "id": "Container_23F797B7_0C0A_6293_41A7_EC89DBCDB93F",
 "horizontalAlign": "center",
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "width": "85%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#000000"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "minWidth": 1,
 "verticalAlign": "middle",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "-left"
 },
 "layout": "absolute"
},
{
 "contentOpaque": false,
 "children": [
  "this.Container_23F017B8_0C0A_629D_41A5_DE420F5F9331",
  "this.Container_23F007B8_0C0A_629D_41A3_034CF0D91203",
  "this.Container_23F047B8_0C0A_629D_415D_F05EF8619564"
 ],
 "id": "Container_23F027B7_0C0A_6293_418E_075FCFAA8A19",
 "horizontalAlign": "left",
 "backgroundOpacity": 1,
 "scrollBarColor": "#0069A3",
 "width": "50%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 50,
 "borderSize": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 20,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.51,
 "height": "100%",
 "minWidth": 460,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 0,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 20,
 "paddingLeft": 50,
 "data": {
  "name": "-right"
 },
 "layout": "vertical"
},
{
 "cursor": "hand",
 "maxWidth": 60,
 "id": "IconButton_23F087B8_0C0A_629D_4194_6F34C6CBE1DA",
 "maxHeight": 60,
 "width": "25%",
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "propagateClick": false,
 "height": "75%",
 "rollOverIconURL": "skin/IconButton_23F087B8_0C0A_629D_4194_6F34C6CBE1DA_rollover.jpg",
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_23F087B8_0C0A_629D_4194_6F34C6CBE1DA_pressed.jpg",
 "minWidth": 50,
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_23F0F7B8_0C0A_629D_418A_F171085EFBF8, false, 0, null, null, false)",
 "mode": "push",
 "iconURL": "skin/IconButton_23F087B8_0C0A_629D_4194_6F34C6CBE1DA.jpg",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "X"
 }
},
{
 "contentOpaque": false,
 "children": [
  "this.HTMLText_3918BF37_0C06_E393_41A1_17CF0ADBAB12",
  "this.IconButton_38922473_0C06_2593_4199_C585853A1AB3"
 ],
 "id": "Container_3A67552A_0C3A_67BD_4195_ECE46CCB34EA",
 "horizontalAlign": "left",
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "height": 140,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "header"
 },
 "layout": "absolute"
},
{
 "paddingTop": 10,
 "itemMaxHeight": 1000,
 "itemMaxWidth": 1000,
 "rollOverItemThumbnailShadowColor": "#04A3E1",
 "itemThumbnailOpacity": 1,
 "itemHorizontalAlign": "center",
 "data": {
  "name": "ThumbnailList"
 },
 "id": "ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0",
 "selectedItemThumbnailShadow": true,
 "itemLabelFontFamily": "Montserrat",
 "itemWidth": 220,
 "itemBorderRadius": 0,
 "backgroundOpacity": 0.05,
 "width": "100%",
 "itemLabelGap": 7,
 "itemLabelPosition": "bottom",
 "minHeight": 1,
 "itemThumbnailBorderRadius": 0,
 "selectedItemThumbnailShadowBlurRadius": 16,
 "paddingRight": 70,
 "backgroundColor": [
  "#000000"
 ],
 "itemMinHeight": 50,
 "selectedItemThumbnailShadowVerticalLength": 0,
 "propagateClick": false,
 "itemPaddingLeft": 3,
 "height": "100%",
 "paddingBottom": 70,
 "rollOverItemThumbnailShadowHorizontalLength": 8,
 "itemPaddingRight": 3,
 "minWidth": 1,
 "verticalAlign": "middle",
 "selectedItemLabelFontColor": "#04A3E1",
 "itemBackgroundColor": [],
 "scrollBarWidth": 10,
 "itemVerticalAlign": "top",
 "scrollBarMargin": 2,
 "itemBackgroundColorRatios": [],
 "itemPaddingTop": 3,
 "backgroundColorDirection": "vertical",
 "itemMinWidth": 50,
 "shadow": false,
 "itemThumbnailShadow": false,
 "selectedItemLabelFontWeight": "bold",
 "rollOverItemThumbnailShadowBlurRadius": 0,
 "horizontalAlign": "center",
 "itemHeight": 156,
 "itemLabelTextDecoration": "none",
 "selectedItemThumbnailShadowHorizontalLength": 0,
 "itemLabelFontWeight": "normal",
 "rollOverItemThumbnailShadow": true,
 "playList": "this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist",
 "scrollBarColor": "#04A3E1",
 "itemLabelFontSize": 14,
 "itemThumbnailScaleMode": "fit_outside",
 "rollOverItemThumbnailShadowVerticalLength": 0,
 "borderRadius": 5,
 "itemThumbnailHeight": 125,
 "scrollBarOpacity": 0.5,
 "borderSize": 0,
 "rollOverItemLabelFontColor": "#04A3E1",
 "backgroundColorRatios": [
  0
 ],
 "itemBackgroundColorDirection": "vertical",
 "itemLabelFontColor": "#666666",
 "scrollBarVisible": "rollOver",
 "itemThumbnailWidth": 220,
 "gap": 26,
 "class": "ThumbnailGrid",
 "itemBackgroundOpacity": 0,
 "itemPaddingBottom": 3,
 "itemLabelHorizontalAlign": "center",
 "itemOpacity": 1,
 "itemMode": "normal",
 "paddingLeft": 70,
 "itemLabelFontStyle": "normal"
},
{
 "contentOpaque": false,
 "children": [
  "this.WebFrame_22F9EEFF_0C1A_2293_4165_411D4444EFEA"
 ],
 "id": "Container_221C0648_0C06_E5FD_4193_12BCE1D6DD6B",
 "horizontalAlign": "center",
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "width": "85%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#000000"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "minWidth": 1,
 "verticalAlign": "middle",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "-left"
 },
 "layout": "absolute"
},
{
 "contentOpaque": false,
 "children": [
  "this.Container_221C8648_0C06_E5FD_41A0_8247B2B7DEB0",
  "this.Container_221B7648_0C06_E5FD_418B_12E57BBFD8EC",
  "this.Container_221B4648_0C06_E5FD_4194_30EDC4E7D1B6"
 ],
 "id": "Container_221C9648_0C06_E5FD_41A1_A79DE53B3031",
 "horizontalAlign": "left",
 "backgroundOpacity": 1,
 "scrollBarColor": "#0069A3",
 "width": "15%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 50,
 "borderSize": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 20,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.51,
 "height": "100%",
 "minWidth": 400,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 0,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 20,
 "paddingLeft": 50,
 "data": {
  "name": "-right"
 },
 "layout": "vertical"
},
{
 "cursor": "hand",
 "maxWidth": 60,
 "id": "IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF",
 "maxHeight": 60,
 "width": "25%",
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "propagateClick": false,
 "height": "75%",
 "rollOverIconURL": "skin/IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF_rollover.jpg",
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF_pressed.jpg",
 "minWidth": 50,
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7, false, 0, null, null, false)",
 "mode": "push",
 "iconURL": "skin/IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF.jpg",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "X"
 }
},
{
 "contentOpaque": false,
 "children": [
  "this.HTMLText_2F8A4686_0D4F_6B71_4183_10C1696E2923",
  "this.IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E"
 ],
 "id": "Container_2F8A7686_0D4F_6B71_41A9_1A894413085C",
 "horizontalAlign": "left",
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "height": 140,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "header"
 },
 "layout": "absolute"
},
{
 "paddingTop": 0,
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "id": "MapViewer",
 "playbackBarRight": 0,
 "playbackBarProgressBorderSize": 0,
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderSize": 6,
 "progressBarBorderRadius": 0,
 "width": "100%",
 "playbackBarBorderRadius": 0,
 "toolTipShadowOpacity": 1,
 "minHeight": 1,
 "playbackBarProgressBorderColor": "#000000",
 "toolTipFontStyle": "normal",
 "paddingRight": 0,
 "toolTipFontFamily": "Arial",
 "progressLeft": 0,
 "propagateClick": false,
 "toolTipTextShadowOpacity": 0,
 "playbackBarHeadBorderRadius": 0,
 "height": "100%",
 "paddingBottom": 0,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 1,
 "minWidth": 1,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "toolTipShadowHorizontalLength": 0,
 "toolTipBackgroundColor": "#F6F6F6",
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "toolTipShadowVerticalLength": 0,
 "progressBarBackgroundColorDirection": "vertical",
 "toolTipFontColor": "#606060",
 "vrPointerSelectionTime": 2000,
 "playbackBarHeadShadowVerticalLength": 0,
 "progressHeight": 6,
 "playbackBarHeadShadow": true,
 "progressBottom": 2,
 "shadow": false,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowHorizontalLength": 0,
 "playbackBarHeadShadowOpacity": 0.7,
 "vrPointerColor": "#FFFFFF",
 "toolTipPaddingRight": 6,
 "toolTipBorderSize": 1,
 "progressBarOpacity": 1,
 "toolTipPaddingLeft": 6,
 "toolTipPaddingTop": 4,
 "toolTipDisplayTime": 600,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBorderSize": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderRadius": 0,
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "transitionMode": "blending",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "borderSize": 0,
 "progressBackgroundColorRatios": [
  0.01
 ],
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "transitionDuration": 500,
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBarBorderColor": "#0066FF",
 "playbackBarHeadHeight": 15,
 "progressBarBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorDirection": "vertical",
 "playbackBarLeft": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarBottom": 0,
 "progressBorderColor": "#FFFFFF",
 "toolTipBorderColor": "#767676",
 "toolTipShadowBlurRadius": 3,
 "toolTipTextShadowColor": "#000000",
 "toolTipOpacity": 1,
 "toolTipShadowSpread": 0,
 "class": "ViewerArea",
 "toolTipFontSize": 12,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipPaddingBottom": 4,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "Floor Plan"
 },
 "toolTipShadowColor": "#333333",
 "playbackBarHeight": 10,
 "toolTipTextShadowBlurRadius": 3,
 "paddingLeft": 0,
 "playbackBarHeadWidth": 6
},
{
 "contentOpaque": false,
 "children": [
  "this.HTMLText_28217A13_0D5D_5B97_419A_F894ECABEB04",
  "this.IconButton_28216A13_0D5D_5B97_41A9_2CAB10DB6CA3"
 ],
 "id": "Container_28214A13_0D5D_5B97_4193_B631E1496339",
 "horizontalAlign": "left",
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "height": 140,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "header"
 },
 "layout": "absolute"
},
{
 "contentOpaque": false,
 "children": [
  "this.ViewerAreaLabeled_281D2361_0D5F_E9B0_41A1_A1F237F85FD7",
  "this.IconButton_2BE71718_0D55_6990_41A5_73D31D902E1D",
  "this.IconButton_28BF3E40_0D4B_DBF0_41A3_D5D2941E6E14"
 ],
 "id": "Container_2B0BF61C_0D5B_2B90_4179_632488B1209E",
 "horizontalAlign": "left",
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Container photo"
 },
 "layout": "absolute"
},
{
 "contentOpaque": false,
 "children": [
  "this.ViewerAreaLabeled_2A198C4C_0D3B_DFF0_419F_C9A785406D9C",
  "this.IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482",
  "this.IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510",
  "this.IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1"
 ],
 "id": "Container_2A19EC4C_0D3B_DFF0_414D_37145C22C5BC",
 "horizontalAlign": "left",
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Container photo"
 },
 "layout": "absolute"
},
{
 "contentOpaque": false,
 "children": [
  "this.Image_06C5BBA5_1140_A63F_41A7_E6D01D4CC397"
 ],
 "id": "Container_06C5ABA5_1140_A63F_41A9_850CF958D0DB",
 "horizontalAlign": "center",
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "width": "55%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#000000"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "minWidth": 1,
 "verticalAlign": "middle",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "-left"
 },
 "layout": "absolute"
},
{
 "contentOpaque": false,
 "children": [
  "this.Container_06C59BA5_1140_A63F_41B1_4B41E3B7D98D",
  "this.Container_06C46BA5_1140_A63F_4151_B5A20B4EA86A",
  "this.Container_06C42BA5_1140_A63F_4195_037A0687532F"
 ],
 "id": "Container_06C58BA5_1140_A63F_419D_EC83F94F8C54",
 "horizontalAlign": "left",
 "backgroundOpacity": 1,
 "scrollBarColor": "#0069A3",
 "width": "45%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 60,
 "borderSize": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 20,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.51,
 "height": "100%",
 "minWidth": 460,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 0,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 20,
 "paddingLeft": 60,
 "data": {
  "name": "-right"
 },
 "layout": "vertical"
},
{
 "cursor": "hand",
 "maxWidth": 60,
 "id": "IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81",
 "maxHeight": 60,
 "width": "25%",
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "propagateClick": false,
 "height": "75%",
 "rollOverIconURL": "skin/IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81_rollover.jpg",
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81_pressed.jpg",
 "minWidth": 50,
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC, false, 0, null, null, false)",
 "mode": "push",
 "iconURL": "skin/IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81.jpg",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "X"
 }
},
{
 "maxWidth": 2000,
 "id": "Image_062A182F_1140_E20B_41B0_9CB8FFD6AA5A",
 "left": "0%",
 "maxHeight": 1000,
 "width": "100%",
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "url": "skin/Image_062A182F_1140_E20B_41B0_9CB8FFD6AA5A.jpg",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "top": "0%",
 "propagateClick": false,
 "height": "100%",
 "paddingBottom": 0,
 "minWidth": 1,
 "verticalAlign": "middle",
 "class": "Image",
 "scaleMode": "fit_outside",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Image"
 }
},
{
 "contentOpaque": false,
 "id": "Container_062A3830_1140_E215_4195_1698933FE51C",
 "horizontalAlign": "right",
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 0,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "height": 60,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 0,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 20,
 "paddingLeft": 0,
 "data": {
  "name": "Container space"
 },
 "layout": "horizontal"
},
{
 "contentOpaque": false,
 "children": [
  "this.HTMLText_062AD830_1140_E215_41B0_321699661E7F",
  "this.Button_062AF830_1140_E215_418D_D2FC11B12C47"
 ],
 "id": "Container_062A2830_1140_E215_41AA_EB25B7BD381C",
 "horizontalAlign": "left",
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#E73B2C",
 "width": "100%",
 "minHeight": 520,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 30,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.79,
 "height": "100%",
 "minWidth": 100,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Container text"
 },
 "layout": "vertical"
},
{
 "contentOpaque": false,
 "id": "Container_062AE830_1140_E215_4180_196ED689F4BD",
 "horizontalAlign": "left",
 "width": 370,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "height": 40,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Container space"
 },
 "layout": "horizontal"
},
{
 "paddingTop": 0,
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "id": "ViewerAreaLabeled_23F787B7_0C0A_6293_419A_B4B58B92DAFC",
 "left": 0,
 "playbackBarRight": 0,
 "playbackBarProgressBorderSize": 0,
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderSize": 6,
 "right": 0,
 "playbackBarBorderRadius": 0,
 "progressBarBorderRadius": 0,
 "toolTipShadowOpacity": 1,
 "minHeight": 1,
 "playbackBarProgressBorderColor": "#000000",
 "toolTipFontStyle": "normal",
 "paddingRight": 0,
 "toolTipFontFamily": "Arial",
 "playbackBarHeadBorderRadius": 0,
 "progressLeft": 0,
 "playbackBarHeadBorderColor": "#000000",
 "propagateClick": false,
 "toolTipTextShadowOpacity": 0,
 "paddingBottom": 0,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 1,
 "minWidth": 1,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "toolTipShadowHorizontalLength": 0,
 "toolTipBackgroundColor": "#F6F6F6",
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "toolTipShadowVerticalLength": 0,
 "progressBarBackgroundColorDirection": "vertical",
 "toolTipFontColor": "#606060",
 "vrPointerSelectionTime": 2000,
 "playbackBarHeadShadowVerticalLength": 0,
 "progressHeight": 6,
 "playbackBarHeadShadow": true,
 "progressBottom": 2,
 "shadow": false,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowHorizontalLength": 0,
 "playbackBarHeadShadowOpacity": 0.7,
 "vrPointerColor": "#FFFFFF",
 "toolTipPaddingRight": 6,
 "toolTipBorderSize": 1,
 "progressBarOpacity": 1,
 "toolTipPaddingLeft": 6,
 "toolTipPaddingTop": 4,
 "toolTipDisplayTime": 600,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBorderSize": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderRadius": 0,
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "transitionMode": "blending",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "bottom": 0,
 "progressBackgroundColorRatios": [
  0.01
 ],
 "borderSize": 0,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "top": 0,
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBarBorderColor": "#0066FF",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorDirection": "vertical",
 "transitionDuration": 500,
 "playbackBarHeadOpacity": 1,
 "playbackBarBottom": 0,
 "playbackBarHeadHeight": 15,
 "progressBorderColor": "#FFFFFF",
 "playbackBarLeft": 0,
 "toolTipBorderColor": "#767676",
 "toolTipShadowBlurRadius": 3,
 "toolTipTextShadowColor": "#000000",
 "toolTipOpacity": 1,
 "toolTipShadowSpread": 0,
 "class": "ViewerArea",
 "toolTipFontSize": 12,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipPaddingBottom": 4,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "Viewer info 1"
 },
 "toolTipShadowColor": "#333333",
 "playbackBarHeight": 10,
 "toolTipTextShadowBlurRadius": 3,
 "paddingLeft": 0,
 "playbackBarHeadWidth": 6
},
{
 "contentOpaque": false,
 "children": [
  "this.IconButton_23F7E7B7_0C0A_6293_419F_D3D84EB3AFBD",
  "this.Container_23F7D7B7_0C0A_6293_4195_312C9CAEABE4",
  "this.IconButton_23F037B7_0C0A_6293_41A2_C1707EE666E4"
 ],
 "id": "Container_23F7F7B7_0C0A_6293_4195_D6240EBAFDC0",
 "left": "0%",
 "horizontalAlign": "left",
 "width": "100%",
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "top": "0%",
 "propagateClick": false,
 "height": "100%",
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "middle",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Container arrows"
 },
 "layout": "horizontal"
},
{
 "contentOpaque": false,
 "id": "Container_23F017B8_0C0A_629D_41A5_DE420F5F9331",
 "horizontalAlign": "right",
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 0,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "height": 60,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 0,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 20,
 "paddingLeft": 0,
 "data": {
  "name": "Container space"
 },
 "layout": "horizontal"
},
{
 "contentOpaque": false,
 "children": [
  "this.HTMLText_23F067B8_0C0A_629D_41A9_1A1C797BB055",
  "this.Button_23F057B8_0C0A_629D_41A2_CD6BDCDB0145"
 ],
 "id": "Container_23F007B8_0C0A_629D_41A3_034CF0D91203",
 "horizontalAlign": "left",
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#E73B2C",
 "width": "100%",
 "minHeight": 520,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 30,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.79,
 "height": "100%",
 "minWidth": 100,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Container text"
 },
 "layout": "vertical"
},
{
 "contentOpaque": false,
 "id": "Container_23F047B8_0C0A_629D_415D_F05EF8619564",
 "horizontalAlign": "left",
 "width": 370,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "height": 40,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Container space"
 },
 "layout": "horizontal"
},
{
 "id": "HTMLText_3918BF37_0C06_E393_41A1_17CF0ADBAB12",
 "left": "0%",
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "width": "77.115%",
 "minHeight": 100,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "top": "0%",
 "propagateClick": false,
 "height": "100%",
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:5.21vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:5.21vh;font-family:'Bebas Neue Bold';\">Panorama list:</SPAN></SPAN></DIV></div>",
 "scrollBarWidth": 10,
 "class": "HTMLText",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 80,
 "data": {
  "name": "HTMLText54192"
 }
},
{
 "cursor": "hand",
 "maxWidth": 60,
 "id": "IconButton_38922473_0C06_2593_4199_C585853A1AB3",
 "maxHeight": 60,
 "width": "100%",
 "horizontalAlign": "right",
 "right": 20,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "top": 20,
 "transparencyActive": false,
 "propagateClick": false,
 "height": "36.14%",
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_38922473_0C06_2593_4199_C585853A1AB3_pressed.jpg",
 "minWidth": 50,
 "rollOverIconURL": "skin/IconButton_38922473_0C06_2593_4199_C585853A1AB3_rollover.jpg",
 "verticalAlign": "top",
 "click": "this.setComponentVisibility(this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15, false, 0, null, null, false)",
 "mode": "push",
 "iconURL": "skin/IconButton_38922473_0C06_2593_4199_C585853A1AB3.jpg",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton X"
 }
},
{
 "scrollEnabled": true,
 "id": "WebFrame_22F9EEFF_0C1A_2293_4165_411D4444EFEA",
 "left": "0%",
 "right": "0%",
 "backgroundOpacity": 1,
 "url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14377.55330038866!2d-73.99492968084243!3d40.75084469078082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9f775f259%3A0x999668d0d7c3fd7d!2s400+5th+Ave%2C+New+York%2C+NY+10018!5e0!3m2!1ses!2sus!4v1467271743182\" width=\"600\" height=\"450\" frameborder=\"0\" style=\"border:0\" allowfullscreen>",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "bottom": "0%",
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF"
 ],
 "top": "0%",
 "paddingBottom": 0,
 "borderSize": 0,
 "minWidth": 1,
 "insetBorder": false,
 "class": "WebFrame",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "WebFrame48191"
 }
},
{
 "contentOpaque": false,
 "id": "Container_221C8648_0C06_E5FD_41A0_8247B2B7DEB0",
 "horizontalAlign": "right",
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 0,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "height": 60,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 0,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 20,
 "paddingLeft": 0,
 "data": {
  "name": "Container space"
 },
 "layout": "horizontal"
},
{
 "contentOpaque": false,
 "children": [
  "this.HTMLText_221B6648_0C06_E5FD_41A0_77851DC2C548",
  "this.Button_221B5648_0C06_E5FD_4198_40C786948FF0"
 ],
 "id": "Container_221B7648_0C06_E5FD_418B_12E57BBFD8EC",
 "horizontalAlign": "left",
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#E73B2C",
 "width": "100%",
 "minHeight": 520,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 30,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.79,
 "height": "100%",
 "minWidth": 100,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Container text"
 },
 "layout": "vertical"
},
{
 "contentOpaque": false,
 "id": "Container_221B4648_0C06_E5FD_4194_30EDC4E7D1B6",
 "horizontalAlign": "left",
 "width": 370,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "height": 40,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Container space"
 },
 "layout": "horizontal"
},
{
 "id": "HTMLText_2F8A4686_0D4F_6B71_4183_10C1696E2923",
 "left": "0%",
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "width": "77.115%",
 "minHeight": 100,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "top": "0%",
 "propagateClick": false,
 "height": "100%",
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:5.21vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:5.21vh;font-family:'Bebas Neue Bold';\">FLOORPLAN:</SPAN></SPAN></DIV></div>",
 "scrollBarWidth": 10,
 "class": "HTMLText",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 80,
 "data": {
  "name": "HTMLText54192"
 }
},
{
 "cursor": "hand",
 "maxWidth": 60,
 "id": "IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E",
 "maxHeight": 60,
 "width": "100%",
 "horizontalAlign": "right",
 "right": 20,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "top": 20,
 "transparencyActive": false,
 "propagateClick": false,
 "height": "36.14%",
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E_pressed.jpg",
 "minWidth": 50,
 "rollOverIconURL": "skin/IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E_rollover.jpg",
 "verticalAlign": "top",
 "click": "this.setComponentVisibility(this.Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41, false, 0, null, null, false)",
 "mode": "push",
 "iconURL": "skin/IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E.jpg",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton X"
 }
},
{
 "id": "HTMLText_28217A13_0D5D_5B97_419A_F894ECABEB04",
 "left": "0%",
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "width": "77.115%",
 "minHeight": 100,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "top": "0%",
 "propagateClick": false,
 "height": "100%",
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:5.21vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:5.21vh;font-family:'Bebas Neue Bold';\">PHOTOALBUM:</SPAN></SPAN></DIV></div>",
 "scrollBarWidth": 10,
 "class": "HTMLText",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 80,
 "data": {
  "name": "HTMLText54192"
 }
},
{
 "cursor": "hand",
 "maxWidth": 60,
 "id": "IconButton_28216A13_0D5D_5B97_41A9_2CAB10DB6CA3",
 "maxHeight": 60,
 "width": "100%",
 "horizontalAlign": "right",
 "right": 20,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "top": 20,
 "transparencyActive": false,
 "propagateClick": false,
 "height": "36.14%",
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_28216A13_0D5D_5B97_41A9_2CAB10DB6CA3_pressed.jpg",
 "minWidth": 50,
 "rollOverIconURL": "skin/IconButton_28216A13_0D5D_5B97_41A9_2CAB10DB6CA3_rollover.jpg",
 "verticalAlign": "top",
 "click": "this.setComponentVisibility(this.Container_2820BA13_0D5D_5B97_4192_AABC38F6F169, false, 0, null, null, false)",
 "mode": "push",
 "iconURL": "skin/IconButton_28216A13_0D5D_5B97_41A9_2CAB10DB6CA3.jpg",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton X"
 }
},
{
 "paddingTop": 0,
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "id": "ViewerAreaLabeled_281D2361_0D5F_E9B0_41A1_A1F237F85FD7",
 "left": "0%",
 "playbackBarRight": 0,
 "playbackBarProgressBorderSize": 0,
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderSize": 6,
 "progressBarBorderRadius": 0,
 "width": "100%",
 "playbackBarBorderRadius": 0,
 "toolTipShadowOpacity": 1,
 "minHeight": 1,
 "playbackBarProgressBorderColor": "#000000",
 "toolTipFontStyle": "normal",
 "paddingRight": 0,
 "toolTipFontFamily": "Arial",
 "progressLeft": 0,
 "propagateClick": false,
 "toolTipTextShadowOpacity": 0,
 "playbackBarHeadBorderRadius": 0,
 "height": "100%",
 "paddingBottom": 0,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 1,
 "minWidth": 1,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "toolTipShadowHorizontalLength": 0,
 "toolTipBackgroundColor": "#F6F6F6",
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "toolTipShadowVerticalLength": 0,
 "progressBarBackgroundColorDirection": "vertical",
 "toolTipFontColor": "#606060",
 "vrPointerSelectionTime": 2000,
 "playbackBarHeadShadowVerticalLength": 0,
 "progressHeight": 6,
 "playbackBarHeadShadow": true,
 "progressBottom": 2,
 "shadow": false,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowHorizontalLength": 0,
 "playbackBarHeadShadowOpacity": 0.7,
 "vrPointerColor": "#FFFFFF",
 "toolTipPaddingRight": 6,
 "toolTipBorderSize": 1,
 "progressBarOpacity": 1,
 "toolTipPaddingLeft": 6,
 "toolTipPaddingTop": 4,
 "toolTipDisplayTime": 600,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBorderSize": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderRadius": 0,
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "transitionMode": "blending",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "borderSize": 0,
 "progressBackgroundColorRatios": [
  0.01
 ],
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "top": "0%",
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBarBorderColor": "#0066FF",
 "playbackBarHeadHeight": 15,
 "progressBarBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorDirection": "vertical",
 "transitionDuration": 500,
 "playbackBarHeadOpacity": 1,
 "playbackBarBottom": 0,
 "progressBorderColor": "#FFFFFF",
 "playbackBarLeft": 0,
 "toolTipBorderColor": "#767676",
 "toolTipShadowBlurRadius": 3,
 "toolTipTextShadowColor": "#000000",
 "toolTipOpacity": 1,
 "toolTipShadowSpread": 0,
 "class": "ViewerArea",
 "toolTipFontSize": 12,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipPaddingBottom": 4,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "Viewer photoalbum + text 1"
 },
 "toolTipShadowColor": "#333333",
 "playbackBarHeight": 10,
 "toolTipTextShadowBlurRadius": 3,
 "paddingLeft": 0,
 "playbackBarHeadWidth": 6
},
{
 "paddingTop": 0,
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "id": "ViewerAreaLabeled_2A198C4C_0D3B_DFF0_419F_C9A785406D9C",
 "left": "0%",
 "playbackBarRight": 0,
 "playbackBarProgressBorderSize": 0,
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderSize": 6,
 "progressBarBorderRadius": 0,
 "width": "100%",
 "playbackBarBorderRadius": 0,
 "toolTipShadowOpacity": 1,
 "minHeight": 1,
 "playbackBarProgressBorderColor": "#000000",
 "toolTipFontStyle": "normal",
 "paddingRight": 0,
 "toolTipFontFamily": "Arial",
 "progressLeft": 0,
 "propagateClick": false,
 "toolTipTextShadowOpacity": 0,
 "playbackBarHeadBorderRadius": 0,
 "height": "100%",
 "paddingBottom": 0,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 1,
 "minWidth": 1,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "toolTipShadowHorizontalLength": 0,
 "toolTipBackgroundColor": "#F6F6F6",
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "toolTipShadowVerticalLength": 0,
 "progressBarBackgroundColorDirection": "vertical",
 "toolTipFontColor": "#606060",
 "vrPointerSelectionTime": 2000,
 "playbackBarHeadShadowVerticalLength": 0,
 "progressHeight": 6,
 "playbackBarHeadShadow": true,
 "progressBottom": 2,
 "shadow": false,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowHorizontalLength": 0,
 "playbackBarHeadShadowOpacity": 0.7,
 "vrPointerColor": "#FFFFFF",
 "toolTipPaddingRight": 6,
 "toolTipBorderSize": 1,
 "progressBarOpacity": 1,
 "toolTipPaddingLeft": 6,
 "toolTipPaddingTop": 4,
 "toolTipDisplayTime": 600,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBorderSize": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderRadius": 0,
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "transitionMode": "blending",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "borderSize": 0,
 "progressBackgroundColorRatios": [
  0.01
 ],
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "top": "0%",
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBarBorderColor": "#0066FF",
 "playbackBarHeadHeight": 15,
 "progressBarBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorDirection": "vertical",
 "transitionDuration": 500,
 "playbackBarHeadOpacity": 1,
 "playbackBarBottom": 0,
 "progressBorderColor": "#FFFFFF",
 "playbackBarLeft": 0,
 "toolTipBorderColor": "#767676",
 "toolTipShadowBlurRadius": 3,
 "toolTipTextShadowColor": "#000000",
 "toolTipOpacity": 1,
 "toolTipShadowSpread": 0,
 "class": "ViewerArea",
 "toolTipFontSize": 12,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipPaddingBottom": 4,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "Viewer photoalbum 1"
 },
 "toolTipShadowColor": "#333333",
 "playbackBarHeight": 10,
 "toolTipTextShadowBlurRadius": 3,
 "paddingLeft": 0,
 "playbackBarHeadWidth": 6
},
{
 "cursor": "hand",
 "maxWidth": 60,
 "id": "IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1",
 "maxHeight": 60,
 "width": "10%",
 "horizontalAlign": "right",
 "right": 20,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "top": 20,
 "transparencyActive": false,
 "propagateClick": false,
 "height": "10%",
 "paddingBottom": 0,
 "pressedIconURL": "skin/IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1_pressed.jpg",
 "minWidth": 50,
 "rollOverIconURL": "skin/IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1_rollover.jpg",
 "verticalAlign": "top",
 "click": "this.setComponentVisibility(this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E, false, 0, null, null, false)",
 "mode": "push",
 "iconURL": "skin/IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1.jpg",
 "class": "IconButton",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "IconButton X"
 }
},
{
 "maxWidth": 2000,
 "id": "Image_06C5BBA5_1140_A63F_41A7_E6D01D4CC397",
 "left": "0%",
 "maxHeight": 1000,
 "width": "100%",
 "horizontalAlign": "center",
 "backgroundOpacity": 0,
 "url": "skin/Image_06C5BBA5_1140_A63F_41A7_E6D01D4CC397.jpg",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "top": "0%",
 "propagateClick": false,
 "height": "100%",
 "paddingBottom": 0,
 "minWidth": 1,
 "verticalAlign": "bottom",
 "class": "Image",
 "scaleMode": "fit_outside",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Image"
 }
},
{
 "contentOpaque": false,
 "id": "Container_06C59BA5_1140_A63F_41B1_4B41E3B7D98D",
 "horizontalAlign": "right",
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 0,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "height": 60,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 0,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 20,
 "paddingLeft": 0,
 "data": {
  "name": "Container space"
 },
 "layout": "horizontal"
},
{
 "contentOpaque": false,
 "children": [
  "this.HTMLText_0B42C466_11C0_623D_4193_9FAB57A5AC33",
  "this.Container_0D9BF47A_11C0_E215_41A4_A63C8527FF9C"
 ],
 "id": "Container_06C46BA5_1140_A63F_4151_B5A20B4EA86A",
 "horizontalAlign": "left",
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#E73B2C",
 "width": "100%",
 "minHeight": 520,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 30,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.79,
 "height": "100%",
 "minWidth": 100,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Container text"
 },
 "layout": "vertical"
},
{
 "contentOpaque": false,
 "id": "Container_06C42BA5_1140_A63F_4195_037A0687532F",
 "horizontalAlign": "left",
 "width": 370,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "height": 40,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Container space"
 },
 "layout": "horizontal"
},
{
 "id": "HTMLText_062AD830_1140_E215_41B0_321699661E7F",
 "backgroundOpacity": 0,
 "scrollBarColor": "#04A3E1",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 10,
 "borderSize": 0,
 "propagateClick": false,
 "height": "100%",
 "paddingBottom": 20,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "scrollBarWidth": 10,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:7.67vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:6.66vh;font-family:'Bebas Neue Bold';\">Lorem ipsum</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:6.66vh;font-family:'Bebas Neue Bold';\">dolor sit amet</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:3.33vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.87vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:3.33vh;font-family:'Bebas Neue Bold';\">consectetur adipiscing elit. Morbi bibendum pharetra lorem, accumsan san nulla.</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.16vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.87vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.16vh;\">Mauris aliquet neque quis libero consequat vestibulum. Donec lacinia consequat dolor viverra sagittis. Praesent consequat porttitor risus, eu condimentum nunc. Proin et velit ac sapien luctus efficitur egestas ac augue. Nunc dictum, augue eget eleifend interdum, quam libero imperdiet lectus, vel scelerisque turpis lectus vel ligula. Duis a porta sem. Maecenas sollicitudin nunc id risus fringilla, a pharetra orci iaculis. Aliquam turpis ligula, tincidunt sit amet consequat ac, imperdiet non dolor.</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.16vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.87vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.16vh;\">Integer gravida dui quis euismod placerat. Maecenas quis accumsan ipsum. Aliquam gravida velit at dolor mollis, quis luctus mauris vulputate. Proin condimentum id nunc sed sollicitudin.</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:2.46vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.87vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:2.46vh;font-family:'Bebas Neue Bold';\"><B>Donec feugiat:</B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.16vh;\"> \u2022 Nisl nec mi sollicitudin facilisis </SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.16vh;\"> \u2022 Nam sed faucibus est.</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.16vh;\"> \u2022 Ut eget lorem sed leo.</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.16vh;\"> \u2022 Sollicitudin tempor sit amet non urna. </SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.16vh;\"> \u2022 Aliquam feugiat mauris sit amet.</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:2.46vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.87vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:2.46vh;font-family:'Bebas Neue Bold';\"><B>lorem ipsum:</B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:3.62vh;font-family:'Bebas Neue Bold';\"><B>$150,000</B></SPAN></SPAN></DIV></div>",
 "class": "HTMLText",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 10,
 "data": {
  "name": "HTMLText"
 }
},
{
 "textDecoration": "none",
 "cursor": "hand",
 "fontFamily": "Bebas Neue Bold",
 "fontColor": "#FFFFFF",
 "pressedBackgroundOpacity": 1,
 "shadowBlurRadius": 6,
 "id": "Button_062AF830_1140_E215_418D_D2FC11B12C47",
 "rollOverBackgroundOpacity": 1,
 "horizontalAlign": "center",
 "pressedBackgroundColor": [
  "#000000"
 ],
 "shadowColor": "#000000",
 "backgroundOpacity": 0.7,
 "shadowSpread": 1,
 "width": "46%",
 "iconHeight": 32,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "borderSize": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#04A3E1"
 ],
 "paddingBottom": 0,
 "height": "9%",
 "minWidth": 1,
 "verticalAlign": "middle",
 "iconBeforeLabel": true,
 "label": "lorem ipsum",
 "fontStyle": "normal",
 "mode": "push",
 "gap": 5,
 "class": "Button",
 "fontSize": "3vh",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "fontWeight": "normal",
 "iconWidth": 32,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Button"
 },
 "layout": "horizontal"
},
{
 "contentOpaque": false,
 "id": "Container_23F7D7B7_0C0A_6293_4195_312C9CAEABE4",
 "horizontalAlign": "left",
 "width": "80%",
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "propagateClick": false,
 "height": "30%",
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "gap": 10,
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Container separator"
 },
 "layout": "absolute"
},
{
 "id": "HTMLText_23F067B8_0C0A_629D_41A9_1A1C797BB055",
 "backgroundOpacity": 0,
 "scrollBarColor": "#04A3E1",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 10,
 "borderSize": 0,
 "propagateClick": false,
 "height": "100%",
 "paddingBottom": 20,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "scrollBarWidth": 10,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:7.67vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:6.66vh;font-family:'Bebas Neue Bold';\">Lorem ipsum</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:6.66vh;font-family:'Bebas Neue Bold';\">dolor sit amet</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:3.33vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.87vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:3.33vh;font-family:'Bebas Neue Bold';\">consectetur adipiscing elit. Morbi bibendum pharetra lorem, accumsan san nulla.</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.16vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.87vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.16vh;\">Mauris aliquet neque quis libero consequat vestibulum. Donec lacinia consequat dolor viverra sagittis. Praesent consequat porttitor risus, eu condimentum nunc. Proin et velit ac sapien luctus efficitur egestas ac augue. Nunc dictum, augue eget eleifend interdum, quam libero imperdiet lectus, vel scelerisque turpis lectus vel ligula. Duis a porta sem. Maecenas sollicitudin nunc id risus fringilla, a pharetra orci iaculis. Aliquam turpis ligula, tincidunt sit amet consequat ac, imperdiet non dolor.</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.16vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.87vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.16vh;\">Integer gravida dui quis euismod placerat. Maecenas quis accumsan ipsum. Aliquam gravida velit at dolor mollis, quis luctus mauris vulputate. Proin condimentum id nunc sed sollicitudin.</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:2.46vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.87vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:2.46vh;font-family:'Bebas Neue Bold';\"><B>Donec feugiat:</B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.16vh;\"> \u2022 Nisl nec mi sollicitudin facilisis </SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.16vh;\"> \u2022 Nam sed faucibus est.</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.16vh;\"> \u2022 Ut eget lorem sed leo.</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.16vh;\"> \u2022 Sollicitudin tempor sit amet non urna. </SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.16vh;\"> \u2022 Aliquam feugiat mauris sit amet.</SPAN></SPAN></DIV></div>",
 "class": "HTMLText",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 10,
 "data": {
  "name": "HTMLText"
 }
},
{
 "textDecoration": "none",
 "cursor": "hand",
 "fontFamily": "Bebas Neue Bold",
 "fontColor": "#FFFFFF",
 "pressedBackgroundOpacity": 1,
 "shadowBlurRadius": 6,
 "id": "Button_23F057B8_0C0A_629D_41A2_CD6BDCDB0145",
 "rollOverBackgroundOpacity": 1,
 "horizontalAlign": "center",
 "pressedBackgroundColor": [
  "#000000"
 ],
 "shadowColor": "#000000",
 "backgroundOpacity": 0.7,
 "shadowSpread": 1,
 "width": "46%",
 "iconHeight": 32,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "borderSize": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#04A3E1"
 ],
 "paddingBottom": 0,
 "height": "9%",
 "minWidth": 1,
 "verticalAlign": "middle",
 "iconBeforeLabel": true,
 "label": "lorem ipsum",
 "fontStyle": "normal",
 "mode": "push",
 "gap": 5,
 "class": "Button",
 "fontSize": "3vh",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "fontWeight": "normal",
 "iconWidth": 32,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Button"
 },
 "layout": "horizontal"
},
{
 "id": "HTMLText_221B6648_0C06_E5FD_41A0_77851DC2C548",
 "backgroundOpacity": 0,
 "scrollBarColor": "#04A3E1",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 10,
 "borderSize": 0,
 "propagateClick": false,
 "height": "100%",
 "paddingBottom": 20,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "scrollBarWidth": 10,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:7.67vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:6.66vh;font-family:'Bebas Neue Bold';\">location</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.74vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.87vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:3.33vh;font-family:'Bebas Neue Bold';\">address line 1</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:3.33vh;font-family:'Bebas Neue Bold';\">address line 2</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:5.21vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.87vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.16vh;\">Mauris aliquet neque quis libero consequat vestibulum. Donec lacinia consequat dolor viverra sagittis. Praesent consequat porttitor risus, eu condimentum nunc. Proin et velit ac sapien luctus efficitur egestas ac augue. Nunc dictum, augue eget eleifend interdum, quam libero imperdiet lectus, vel scelerisque turpis lectus vel ligula. Duis a porta sem. Maecenas sollicitudin nunc id risus fringilla, a pharetra orci iaculis. Aliquam turpis ligula, tincidunt sit amet consequat ac.</SPAN></SPAN></DIV></div>",
 "class": "HTMLText",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 10,
 "data": {
  "name": "HTMLText"
 }
},
{
 "textDecoration": "none",
 "cursor": "hand",
 "fontFamily": "Bebas Neue Bold",
 "fontColor": "#FFFFFF",
 "pressedBackgroundOpacity": 1,
 "shadowBlurRadius": 6,
 "id": "Button_221B5648_0C06_E5FD_4198_40C786948FF0",
 "rollOverBackgroundOpacity": 1,
 "horizontalAlign": "center",
 "width": 207,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "shadowColor": "#000000",
 "backgroundOpacity": 0.7,
 "shadowSpread": 1,
 "iconHeight": 32,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "borderSize": 0,
 "height": 59,
 "pressedBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#04A3E1"
 ],
 "paddingBottom": 0,
 "label": "lorem ipsum",
 "minWidth": 1,
 "verticalAlign": "middle",
 "iconBeforeLabel": true,
 "fontStyle": "normal",
 "mode": "push",
 "gap": 5,
 "class": "Button",
 "fontSize": 34,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "fontWeight": "normal",
 "iconWidth": 32,
 "visible": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Button"
 },
 "layout": "horizontal"
},
{
 "id": "HTMLText_0B42C466_11C0_623D_4193_9FAB57A5AC33",
 "backgroundOpacity": 0,
 "scrollBarColor": "#04A3E1",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "propagateClick": false,
 "height": "45%",
 "paddingBottom": 10,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "scrollBarWidth": 10,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:7.67vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:6.08vh;font-family:'Bebas Neue Bold';\">real estate agent</SPAN></SPAN></DIV></div>",
 "class": "HTMLText",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "HTMLText18899"
 }
},
{
 "contentOpaque": false,
 "children": [
  "this.Image_0B48D65D_11C0_6E0F_41A2_4D6F373BABA0",
  "this.HTMLText_0B4B0DC1_11C0_6277_41A4_201A5BB3F7AE"
 ],
 "id": "Container_0D9BF47A_11C0_E215_41A4_A63C8527FF9C",
 "horizontalAlign": "left",
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "80%",
 "minWidth": 1,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Container",
 "scrollBarMargin": 2,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "- content"
 },
 "layout": "horizontal"
},
{
 "maxWidth": 200,
 "id": "Image_0B48D65D_11C0_6E0F_41A2_4D6F373BABA0",
 "maxHeight": 200,
 "width": "25%",
 "horizontalAlign": "left",
 "backgroundOpacity": 0,
 "url": "skin/Image_0B48D65D_11C0_6E0F_41A2_4D6F373BABA0.jpg",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "propagateClick": false,
 "height": "100%",
 "paddingBottom": 0,
 "minWidth": 1,
 "verticalAlign": "top",
 "class": "Image",
 "scaleMode": "fit_inside",
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "agent photo"
 }
},
{
 "id": "HTMLText_0B4B0DC1_11C0_6277_41A4_201A5BB3F7AE",
 "backgroundOpacity": 0,
 "scrollBarColor": "#04A3E1",
 "width": "75%",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 10,
 "borderSize": 0,
 "propagateClick": false,
 "height": "100%",
 "paddingBottom": 10,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "scrollBarWidth": 10,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:3.33vh;font-family:'Bebas Neue Bold';\">john doe</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:2.03vh;font-family:'Bebas Neue Bold';\">licensed real estate salesperson</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.74vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.87vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#999999;font-size:1.74vh;font-family:'Bebas Neue Bold';\">Tlf.: +11 111 111 111</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#999999;font-size:1.74vh;font-family:'Bebas Neue Bold';\">jhondoe@realestate.com</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#999999;font-size:1.74vh;font-family:'Bebas Neue Bold';\">www.loremipsum.com</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.16vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.87vh;font-family:Arial, Helvetica, sans-serif;\"/></p><p STYLE=\"margin:0; line-height:1.16vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.87vh;font-family:Arial, Helvetica, sans-serif;\"/></p><p STYLE=\"margin:0; line-height:1.16vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.87vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.16vh;\">Mauris aliquet neque quis libero consequat vestibulum. Donec lacinia consequat dolor viverra sagittis. Praesent consequat porttitor risus, eu condimentum nunc. Proin et velit ac sapien luctus efficitur egestas ac augue. Nunc dictum, augue eget eleifend interdum, quam libero imperdiet lectus, vel scelerisque turpis lectus vel ligula. Duis a porta sem. Maecenas sollicitudin nunc id risus fringilla, a pharetra orci iaculis. Aliquam turpis ligula, tincidunt sit amet consequat ac, imperdiet non dolor.</SPAN></SPAN></DIV></div>",
 "class": "HTMLText",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 10,
 "data": {
  "name": "HTMLText19460"
 }
}],
 "verticalAlign": "top",
 "mobileMipmappingEnabled": false,
 "buttonToggleMute": "this.IconButton_EED073D3_E38A_9E06_41E1_6CCC9722545D",
 "backgroundPreloadEnabled": true,
 "vrPolyfillScale": 0.5,
 "scrollBarWidth": 10,
 "gap": 10,
 "class": "Player",
 "scrollBarMargin": 2,
 "shadow": false,
 "paddingTop": 0,
 "paddingLeft": 0,
 "data": {
  "name": "Player468"
 },
 "layout": "absolute"
};

    
    function HistoryData(playList) {
        this.playList = playList;
        this.list = [];
        this.pointer = -1;
    }

    HistoryData.prototype.add = function(index){
        if(this.pointer < this.list.length && this.list[this.pointer] == index) {
            return;
        }
        ++this.pointer;
        this.list.splice(this.pointer, this.list.length - this.pointer, index);
    };

    HistoryData.prototype.back = function(){
        if(!this.canBack()) return;
        this.playList.set('selectedIndex', this.list[--this.pointer]);
    };

    HistoryData.prototype.forward = function(){
        if(!this.canForward()) return;
        this.playList.set('selectedIndex', this.list[++this.pointer]);
    };

    HistoryData.prototype.canBack = function(){
        return this.pointer > 0;
    };

    HistoryData.prototype.canForward = function(){
        return this.pointer >= 0 && this.pointer < this.list.length-1;
    };
    //

    if(script.data == undefined)
        script.data = {};
    script.data["history"] = {};    //playListID -> HistoryData

    TDV.PlayerAPI.defineScript(script);
})();

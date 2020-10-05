//Global vars
//Game states has to coincide with the ones in the json
var _GAME_NOT_INITIALIZED = "gamenotinitialized";
var _GAME_INITILIZING = "gameinitializing"
var _GAME_MAINMENU = "mainmenu";
var _GAME_RUNNING = "gamerunning";
var _GAME_PAUSED = "gamepaused";
var _GAME_OVER = "gameover";
var _GAME_DIALOG = "dialog";
var _GAME_STORY = "story";
var _GAME_STAGES = "stages";
var _GAME_LIBRARY = "library";
var _GAME_RESTART = "restart";
var _GAME_BACK = "back";

var _FPS = 50;

//directions
var _NOMOVE = 0;
var _LEFT = 1;
var _UP = 2;
var _RIGHT = 3;
var _DOWN = 4;

var _SPACEBAR = 5;
var _ESCAPE = 6;
var _RESET = 7;
var _PAUSE = 8;
var _SPEEDUP = 9;
var _SPEEDDOWN = 10;

//Grid size
var _WSQUARE = 12;
var _HSQUARE = 9;
var _scale; //Multiplier of the size. Don't use multiples of 3 to avoid strange behaviour on square edges
var _squareSize; //Size of a square (contemplating the scale)
var _sq; //Size of a square of size 1/12 * 1/9 of the grid (ignoring scale);

var _EMPTY = "empty";
var _SNAEK = "snaek";
var _SNAEK_COLOR = "#00ff00";

//json
var _itemsJson;
var _enemiesJson;
var _buttonsJson;
var _menusJson;
var _imagesJson;
var _storyJson;

//loads
var _totalJson = 0;
var _totalEntities = 0;
var _totalButtons = 0;
var _totalImages = 0;
var _totalCharacters = 0;
var _totalBackgrounds = 0;
var _loadedJson = 0;
var _loadedEntities = 0;
var _loadedButtons = 0;
var _loadedImages = 0;
var _loadedCharacters = 0;
var _loadedBackgrounds = 0;

var _state = _GAME_NOT_INITIALIZED;
var _currentStory;
var _currentStage;
var _currentLevel;
var _currentLevelJson;

//Game window
var _lw;
var _mw;
var _h;
var _grid;
var _gridVisited; //Tells for each cell if it's background has to be revealed or not


//context
var _lctx;
var _mctx = [];
/*
 ** _mctx layers:
 ** 0: backgrounds
 ** 1: items
 ** 2: environment
 ** 3: enemies and snake
 ** 4: grid
 ** 5: images
 ** 6: buttons
 */

//mappings
var _keyMapping = {};

//snaek (an array of posx, posy, from, to)
var _snaek;
var _snaekLength;
var _snaekSpeed; //squares per second
var _tmpSnaekSpeed; //When changed we modify this one and when the snaek is updated the real one.
var _snaekMaxSpeed;

var _snaekDirection; //Array with the queued directions
var _tilesRevealed;

//objects (x, y, object, timesToRespawn, [life])
var _objects;

//Update
var _update;

//timings
var _timingSnaek;
var _turnsStopped;
var _turnsSliding;

//Environment effects
var _environment; //Transparency
var _environmentInc; //Variation per 0.1 second
var _environmentTopLimit; //Limit of transparency
var _environmentColor; //Fog, night, poison, water, blood...

//buttons
var _buttons = {}; //{name: [pos, source]}
var _lshapes = []; //[{ctx, x, y, w, h, img, func, data}]
var _mshapes = []; //[{ctx, x, y, w, h, img, func, data}]
var _NOTHING = -1;
var _lobjectHover = _NOTHING;
var _mobjectHover = _NOTHING;

var _CLICKABLE_NORMAL = 0;
var _CLICKABLE_HOVER = 1;
var _CLICKABLE_PRESSED = 2;

//dialog
var _dialog;
var _dialogArray;
var _dialogIndex;
var _PREGAME = 0;
var _INGAME = 1;

//objectives
var _objectivesArray;
var _objectivesIndex;

//others
var _alertBrowser = false;
var _realfps = 0;
var _frames = 0;
var _timefps = 0;
var _gameStatiscs = {};
var _objectiveStatiscs = {};
//Glogal Statiscs are saved directly to the computer
var _remainintTime = 0;
var _setRemainingTime = false;
var _DIF_EASY = 1;
var _DIF_NORMAL = 2;
var _DIF_HARD = 3;
var _difficulty = _DIF_EASY;
var _LIBRARY_ITEMS = 0;
var _LIBRARY_ENEMIES = 1;
var _libraryTab = _LIBRARY_ITEMS;
var _libraryPage = 0;

//EveryGame subweb needs this function (updateContent) that is called once the web is created or it's resized
function updateContent(w, h) {
   if ($('#content>canvas').length==0) {
      //First time here we have to populate the content with the canvas
      createCanvas();
   }
   resizingCanvas(w, h);
   if (_state == _GAME_NOT_INITIALIZED){
      initGame();      
      return;
   }   
   drawNewState(); 
}

function createCanvas() {
   var content = $('#content');
   var canvasAr=[];
   canvasAr[0] = $('<canvas class="layer1" id="left-canvas" tabindex="1" unselectable="on"></canvas>');
   canvasAr[0].css("background-color","#d67417");
   canvasAr[1] = $('<canvas class="layer1 main-canvas" id="main-canvas1" tabindex="2" unselectable="on"></canvas>');
   canvasAr[1].css("background-color","#444");
   canvasAr[2] = $('<canvas class="layer2 main-canvas" id="main-canvas2" tabindex="3" unselectable="on"></canvas>');
   canvasAr[3] = $('<canvas class="layer3 main-canvas" id="main-canvas3" tabindex="4" unselectable="on"></canvas>');
   canvasAr[4] = $('<canvas class="layer4 main-canvas" id="main-canvas4" tabindex="5" unselectable="on"></canvas>');
   canvasAr[5] = $('<canvas class="layer5 main-canvas" id="main-canvas5" tabindex="6" unselectable="on"></canvas>');
   canvasAr[6] = $('<canvas class="layer6 main-canvas" id="main-canvas6" tabindex="7" unselectable="on"></canvas>');
   canvasAr[7] = $('<canvas class="layer7 main-canvas" id="main-canvas7" tabindex="8" unselectable="on"></canvas>');
   for (var i=0; i<canvasAr.length;i++) {
      canvasAr[i].css({
         'margin': 0,
         'padding': 0,
         'position': 'absolute',
         '-webkit-touch-callout': 'none',
         '-webkit-user-select': 'none',
         '-khtml-user-select': 'none',
         '-moz-user-select': 'none',
         '-ms-user-select': 'none',
         'user-select': 'none',
         'outline': 'none',
         '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)' 
      });
      if (i>0) {
         canvasAr[i].css("z-index",i);
      }
      content.append(canvasAr[i]);
   }
}

function updateState(name) {
   _state = name;
   drawNewState();
}

function drawNewState() {
   if (_state == _GAME_RUNNING || _state == _GAME_PAUSED || _state == _GAME_OVER){
      _squareSize = _mw/(_WSQUARE * _scale);
      repaintGrid(); //Main Canvas
      drawGrid();
   }
   drawLeftCanvas();
   drawMainCanvas();
   eval(_menusJson[_state].afterload);
}

function resizingCanvas(totalW, totalH) {
   //We want an aspect ratio of 4+12:9 with a minimum padding distance through absolute positioning of aprox. 1%
   if (totalW * 9/16 > totalH) {
      //We have to add more padding to the width
      innerH = Math.floor((totalH - (0.02 * totalH)) / 9) * 9;
      paddingH = Math.floor((totalH - innerH) / 2);
      innerW = 16 * innerH / 9;
      paddingW = Math.floor((totalW - innerW) / 2);
   }
   else{
      //We have to add padding to the heigth
      innerW = Math.floor((totalW - (0.02 * totalW)) / 16) * 16;
      paddingW = Math.floor((totalW - innerW) / 2);
      innerH = 9 * innerW / 16;
      paddingH = Math.floor((totalH - innerH) / 2);
   }
   leftW = Math.floor(innerW * 4 / 16);
   mainW = Math.floor(innerW * 12 / 16);
   $("#left-canvas").attr({
      'width': leftW,
      'height': innerH      
   });
   $(".main-canvas").attr({
      'width': mainW,
      'height': innerH      
   });
   $("canvas").css("top", paddingH);
   $("#left-canvas").css("left", paddingW);
   $(".main-canvas").css("left", paddingW+leftW);
   $("#left-canvas").width(leftW);
   $(".main-canvas").width(mainW);
   $("#left-canvas").height(innerH);
   $(".main-canvas").height(innerH);   
   _lw = leftW;
   _mw = mainW;   
   _h = innerH;
   _sq = _mw/_WSQUARE;   
}

function initGame() {
   _mshapes = [];
   _mobjectHover = _NOTHING;
   $(".main-canvas").each(function(index, elem){
      _mctx[index] = elem.getContext("2d");   
   });
   _lctx = $("#left-canvas")[0].getContext("2d");
   _totalJson += 2;
   $.getJSON('/snaek/json/snaek.json', initMainJson);
   $.getJSON('/snaek/json/story.json', initStoryJson);
   initKeyMapping();
}

function initMainJson(json) {
   _loadedJson++;
   loadDone();
   _itemsJson = json.items;
   _enemiesJson = json.enemies;
   _buttonsJson = json.buttons;
   _menusJson = json.menus;
   _imagesJson = json.images;
   _totalEntities += Object.keys(_enemiesJson).length + Object.keys(_itemsJson).length;;
   _totalButtons += Object.keys(_buttonsJson).length;
   _totalImages +=  Object.keys(_imagesJson).length;
   updateState(_GAME_INITILIZING); //Now the updateCanvas can read the _menusJson
   initMainImageMapping();
}

function initMainImageMapping() {
   //Items
   for (var key in _itemsJson) {
      _itemsJson[key].img = loadImage(_itemsJson[key].source, "entity");      
   }
   //Enemies
   for (var key in _enemiesJson) {
      _enemiesJson[key].img = loadImage(_enemiesJson[key].source, "entity");
   }
   //Buttons
   for (var key in _buttonsJson) {
      _buttonsJson[key].img = loadImage(_buttonsJson[key].source, "button");
   }
   //Images
   for (var key in _imagesJson) {
      _imagesJson[key].img = loadImage(_imagesJson[key].source, "image");
   }    
}

function initStoryJson(json) {
   _loadedJson++;
   loadDone();
   _storyJson = json;
   _totalImages += _storyJson.length;
   for (var story = 0; story<_storyJson.length; story++) {
      _totalBackgrounds += Object.keys(_storyJson[story].backgrounds).length;
      _totalCharacters += Object.keys(_storyJson[story].characters).length;
      initStoryImageMapping(story);
   }
}

function initStoryImageMapping(story) {
   //Characters
   for (var key in _storyJson[story].characters) {
      _storyJson[story].characters[key].img = loadImage(_storyJson[story].characters[key].source, "character");
   }
   //Backgrounds
   for (var key in _storyJson[story].backgrounds) {
      _storyJson[story].backgrounds[key].img = loadImage(_storyJson[story].backgrounds[key].source, "background");
   }
   //Image
   _storyJson[story].img = loadImage(_storyJson[story].source, "image");
}

function initKeyMapping() {
   _keyMapping[27] = _ESCAPE;
   _keyMapping[32] = _SPACEBAR;
   _keyMapping[37] = _LEFT;
   _keyMapping[38] = _UP;
   _keyMapping[39] = _RIGHT;
   _keyMapping[40] = _DOWN;
   _keyMapping[keyCodeLetter("A")] = _LEFT;
   _keyMapping[keyCodeLetter("W")] = _UP;
   _keyMapping[keyCodeLetter("D")] = _RIGHT;
   _keyMapping[keyCodeLetter("S")] = _DOWN;
   _keyMapping[keyCodeLetter("R")] = _RESET;
   _keyMapping[keyCodeLetter("P")] = _PAUSE;
   _keyMapping[keyCodeLetter("Z")] = _SPEEDDOWN;
   _keyMapping[keyCodeLetter("X")] = _SPEEDUP;
   _keyMapping[keyCodeLetter("K")] = _SPEEDDOWN;
   _keyMapping[keyCodeLetter("L")] = _SPEEDUP;
}

function loadImage(source, kind) {
   var img = new Image();
   img.onload = function() {
      switch (kind) {
         case "entity":
            _loadedEntities++;
            break;
         case "button":
            _loadedButtons++;
            break;
         case "image":
            _loadedImages++;
            break;
         case "character":
            _loadedCharacters++;
            break;
         case "background":
            _loadedBackgrounds++;
            break;
      }
      loadDone();
   };
   img.src = source;
   return img;
}

function loadDone() {
   loadProgress();
   if (_loadedBackgrounds == _totalBackgrounds && _loadedButtons == _totalButtons &&
       _loadedCharacters == _totalCharacters && _loadedEntities == _totalEntities &&
       _loadedImages == _totalImages && _loadedJson == _totalJson) {
      _mctx[0].clearRect(0,0,_mw,_h);
      updateState(_GAME_MAINMENU);
   }   
}

function loadProgress() {
   _mctx[0].clearRect(0,0,_mw,_h);
   drawText(_mctx[0],"Loading...", 0.9*_sq, 0.9*_sq, 10*_sq, 0.5*_sq, "#fff", "Calibri", "left");
   drawText(_mctx[0],"Main Files (" + _loadedJson + "/" + _totalJson +"):", 0.9*_sq, 1.5*_sq, 10*_sq, 0.2*_sq, "#fff", "Calibri", "left");
   drawProgressbar(_mctx[0], 1.7*_sq, _loadedJson, _totalJson);
   drawText(_mctx[0],"Entities (" + _loadedEntities + "/" + _totalEntities +"):", 0.9*_sq, 2.5*_sq, 10*_sq, 0.2*_sq, "#fff", "Calibri", "left");
   drawProgressbar(_mctx[0], 2.7*_sq, _loadedEntities, _totalEntities);
   drawText(_mctx[0],"Buttons (" + _loadedButtons + "/" + _totalButtons +"):", 0.9*_sq, 3.5*_sq, 10*_sq, 0.2*_sq, "#fff", "Calibri", "left");
   drawProgressbar(_mctx[0], 3.7*_sq, _loadedButtons, _totalButtons);
   drawText(_mctx[0],"Images (" + _loadedImages + "/" + _totalImages +"):", 0.9*_sq, 4.5*_sq, 10*_sq, 0.2*_sq, "#fff", "Calibri", "left");
   drawProgressbar(_mctx[0], 4.7*_sq, _loadedImages, _totalImages);
   drawText(_mctx[0],"Backgrounds (" + _loadedBackgrounds + "/" + _totalBackgrounds +"):", 0.9*_sq, 5.5*_sq, 10*_sq, 0.2*_sq, "#fff", "Calibri", "left");
   drawProgressbar(_mctx[0], 5.7*_sq, _loadedBackgrounds, _totalBackgrounds);
   drawText(_mctx[0],"Characters (" + _loadedCharacters + "/" + _totalCharacters +"):", 0.9*_sq, 6.5*_sq, 10*_sq, 0.2*_sq, "#fff", "Calibri", "left");
   drawProgressbar(_mctx[0], 6.7*_sq, _loadedCharacters, _totalCharacters);
}

function drawProgressbar(ctx, y, loaded, total) {
   drawRect(ctx, 0.9*_sq, y, 10*loaded*_sq/total, 0.45*_sq, "#0f0", 1);
   drawRect(ctx, 0.9*_sq+10*loaded*_sq/total, y, 10*(1-loaded/total)*_sq, 0.45*_sq, "#0f0", 0.3);   
}

function initGrid() {
   _grid = [];
   _gridVisited = [];
   for (var i=0; i<_WSQUARE * _scale; i++) {
      _grid[i]=[];
      _gridVisited[i]=[];
      for (var j=0; j<_HSQUARE  * _scale; j++) {
         setGrid(i,j,_EMPTY);
         _gridVisited[i][j] = false;
      }
   }
}

function newGame() {
   _objects = [];
   _enemies = [];
   _environment = 0;
   _environmentInc = 0;
   _environmentTopLimit = 0.9;
   _environmentColor = "#000";
   //clear canvas
   for (i=0; i<_mctx.length; i++) {      
      _mctx[i].clearRect(0,0,_mw,_h);
   }
   if (_currentLevelJson) {
      _scale = _currentLevelJson.level.scale;
      _snaekLength = _currentLevelJson.level.snakeLength;
      _snaekSpeed = _currentLevelJson.level.snakeSpeed;
      _tmpSnaekSpeed = _currentLevelJson.level.snakeSpeed;
      _snaekMaxSpeed = _currentLevelJson.level.snakeSpeed;
      _objectivesArray = _currentLevelJson.level.objectives;
      _objectivesIndex = 0;
      if (_currentLevelJson.level.environment) {
         _environment = _currentLevelJson.level.environment.base;
         _environmentInc = _currentLevelJson.level.environment.inc;
         _environmentTopLimit = _currentLevelJson.level.environment.topLimit;
         _environmentColor = _currentLevelJson.level.environment.color;   
      }
   }
   else{
      _scale = 2;
      _snaekLength = 25;
      _snaekMaxSpeed = 4;
      _snaekSpeed = 4;
      _tmpSnaekSpeed = 4;
   }   
   _squareSize = _mw/(_WSQUARE * _scale);
   initGrid(); //We need to set the _scale value before calling this
   setGrid(Math.floor(_WSQUARE * _scale/4),Math.floor(_HSQUARE * _scale/2), _SNAEK)
   _snaek = [[Math.floor(_WSQUARE * _scale/4), Math.floor(_HSQUARE  * _scale/2), _LEFT , _RIGHT]];   
   _snaekDirection = [_RIGHT];   
   _turnsStopped = 0;
   _turnsSliding = 0;
   _tilesRevealed = 0;
   _timingSnaek = 0;
   _timefps = new Date().getTime();
   _realfps = 0;
   _frames = 0;
   if (_currentLevelJson) {
      loadObjects();
      loadTime();
   }
   iniGameStatiscs();   
   resumeGame();
}

//Inicialized each time a game begins
function iniGameStatiscs() {
   _gameStatiscs = {};
   iniObjectivesStatiscs();
}

//Inicialized each time an objective begins
function iniObjectivesStatiscs() {
   _objectiveStatiscs = {}
}

function incStatiscs(name, value) {
   _gameStatiscs[name] = loadGameStatiscs(name) + value;
   _objectiveStatiscs[name] = loadObjectiveStatiscs(name) + value;
}

function loadGameStatiscs(name) {
   if (_gameStatiscs[name]) {
      return _gameStatiscs[name];
   }
   return 0;
}

function loadObjectiveStatiscs(name) {
   if (_objectiveStatiscs[name]) {
      return _objectiveStatiscs[name];
   }
   return 0;
}

function resumeGame() {
   var img;
   var direction;
   updateState(_GAME_RUNNING);
   if (_snaekDirection.length>0) {
      direction = _snaekDirection[0];
   }
   else{
      direction = _snaek[_snaek.length-1][3];
   }
   switch (direction) {
      case _UP:
         img = _imagesJson["up"].img;
         break;
      case _DOWN:
         img = _imagesJson["down"].img;
         break;
      case _LEFT:
         img = _imagesJson["left"].img;
         break;
      case _RIGHT:
         img = _imagesJson["right"].img;
         break;
   }
   $('.main-canvas').last().focus();
   if (_update) {
      window.clearInterval(_update);
      window.clearTimeout(_update);
   }
   _update = setTimeout(function(){
      _mctx[5].clearRect(0,0,_mw,_h);
      drawText(_mctx[5], "1", _sq*6, _sq*4, _sq*2, _sq*2, "#aaa", "Calibri", "center");
      drawImage(_mctx[5], img, (_snaek[_snaek.length-1][0]+0.2)*_squareSize, (_snaek[_snaek.length-1][1]+0.2)*_squareSize, 0.6*_squareSize, 0.6*_squareSize, 1, 1);
      _update = setTimeout(function(){
         _mctx[5].clearRect(0,0,_mw,_h);
         if (_update) {
            window.clearInterval(_update);      
         }
         _update = setInterval(updateGame, 1000/_FPS);},1000);},1000);
   drawText(_mctx[5], "2", _sq*6, _sq*4, _sq*2, _sq*2, "#aaa", "Calibri", "center");
   drawImage(_mctx[5], img, (_snaek[_snaek.length-1][0]+0.2)*_squareSize, (_snaek[_snaek.length-1][1]+0.2)*_squareSize, 0.6*_squareSize, 0.6*_squareSize, 1, 1);
}

function drawGrid() {
   _mctx[4].clearRect(0, 0, _mw, _h);
   for (var i = 0; i <= _mw; i += _squareSize) {
      drawLine(_mctx[4], i, 0, i, _h, "#666", 1);   
   }
   for (var i =0; i <= _h; i += _squareSize) {
      drawLine(_mctx[4], 0, i, _mw, i, "#666", 1);
   }   
}

function repaintGrid() {
   for (var i=0; i<_WSQUARE * _scale; i++) {
      for (var j=0; j<_HSQUARE  * _scale; j++) {
         if (_gridVisited[i][j] && _currentLevelJson.level.background) {
            drawImagePortion(_mctx[0], _storyJson[_currentStory].backgrounds[_currentLevelJson.level.background].img, i * _squareSize+1, j * _squareSize+1 ,
                             _squareSize-2, _squareSize-2, 0.5, i, j);
         }
         drawUpperLayer(i, j);
      }
   }    
}

function drawUpperLayer(i, j) {
   if (_grid[i][j] != _EMPTY) {
      switch (_grid[i][j]) {
         case _SNAEK:
            drawRect(_mctx[3], i * _squareSize + 1, j * _squareSize + 1, _squareSize - 2, _squareSize - 2, _SNAEK_COLOR, 1);                  
            break;
         default:
            if (isEnemy(_grid[i][j])) {
               drawImage(_mctx[3], _enemiesJson[_grid[i][j]].img, i * _squareSize, j * _squareSize, _squareSize, _squareSize, true, 1);
            }
            else{
               drawImage(_mctx[1], _itemsJson[_grid[i][j]].img, i * _squareSize, j * _squareSize, _squareSize, _squareSize, true, 1);
            }            
            break;
      }
   }
}

function drawLine(ctx, x1, y1, x2, y2, color, width) {
   ctx.beginPath();
   ctx.moveTo(x1, y1);
   ctx.lineTo(x2, y2);
   ctx.lineWidth = width;
   ctx.strokeStyle = color;
   ctx.stroke();
}

function drawRect(ctx, x, y, w, h, color, opacity) {
   ctx.beginPath();
   ctx.globalAlpha = opacity;
   ctx.rect(x, y, w, h);
   ctx.fillStyle = color;
   ctx.lineWidth = 0;
   ctx.fill();
   ctx.globalAlpha = 1;
}

function drawText(ctx, text, x, y, w, h, color, font, align) {
   ctx.font = 'bold ' + h + 'pt ' + font;
   ctx.textAlign = align;
   ctx.fillStyle = color;
   wrapText(ctx, text, x, y, w, 1.5*h);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
   var words = text.split(' ');
   var line = '';

   for(var n = 0; n < words.length; n++) {
     var testLine = line + words[n] + ' ';
     var metrics = ctx.measureText(testLine);
     var testWidth = metrics.width;
     if(testWidth > maxWidth) {
       ctx.fillText(line, x, y);
       line = words[n] + ' ';
       y += lineHeight;
     }
     else {
       line = testLine;
     }
   }
   ctx.fillText(line, x, y);
}

function updateGame(){
   _frames++;
   if (_frames == _FPS) {
      _realfps = Math.floor(1000*_frames/(new Date().getTime() - _timefps));
      _timefps = new Date().getTime();
      _frames = 0;
   }
   incStatiscs("timingGame", 1/_FPS);
   _timingSnaek += 1/_FPS;
   if (_setRemainingTime) {
      _remainingTime = Math.max(0, _remainingTime - 1/_FPS);
      if (_remainingTime <= 0) {
         gameOver();
      }
   }
   if (Math.floor((_timingSnaek - 1/_FPS)*_snaekSpeed) < Math.floor(_timingSnaek*_snaekSpeed)) {
      updateSnaek();
      if (_tmpSnaekSpeed!=_snaekSpeed) {
         _snaekSpeed=_tmpSnaekSpeed;
         _timingSnaek = 0;
      }
   }
   updateEnemies();
   updateEnvironment();   
   drawStatiscs();
   checkAvoids();
   checkObjectives();
}

function updateSnaek() {
   var reversed;
   var next;
   var x;
   var y;
   
   if (_turnsStopped > 0) {
      _turnsStopped--;
      return;
   }
   reversed = false;
   
   //Determining the 'next' movement
   if (_snaekDirection.length > 0 && _turnsSliding == 0) {
      snaekDirection = _snaekDirection.shift();
   }
   else{
      snaekDirection = _snaek[_snaek.length-1][3];
      if (_turnsSliding > 0) {
         _turnsSliding--;
      }
   }
   _snaek[_snaek.length-1][3] = snaekDirection;
   next = [_snaek[_snaek.length-1][0], _snaek[_snaek.length-1][1], opposite(snaekDirection), snaekDirection];   
   if (!nextSnaekMovement(next, snaekDirection)){
      gameOver();
      return;
   }
   doSnakeMovement(next);   
}

function doSnakeMovement(next) {
   var x = next[0];
   var y = next[1];
   value = _grid[x][y];
   if (value == _EMPTY) {
      _snaek.push(next);
      setGrid(x, y, _SNAEK);    
      checkSnaekLength();
   }
   else if (value == _SNAEK) {
      gameOver();
   }
   else if (isEnemy(value)) {
      eval(_enemiesJson[value].beforeImpact);
      if (_state == _GAME_OVER) {
         return;
      }
      if (_enemiesJson[value].eatable) {
         deleteObject(x, y, true);
         _snaek.push(next);
         setGrid(x, y, _SNAEK);          
      }
      checkSnaekLength();
      eval(_enemiesJson[value].afterImpact);
   }
   else{ //is item      
      eval(_itemsJson[value].beforeImpact);
      if (_state == _GAME_OVER) {
         return;
      }
      if (_itemsJson[value].eatable) {
         deleteObject(x, y, true);
         _snaek.push(next);
         setGrid(x, y, _SNAEK);          
      }
      checkSnaekLength();
      eval(_itemsJson[value].afterImpact);
   }
}

function getSnaekLength() {
   return _snaekLength;
}

function incSnaekSpeed(inc) {
   _tmpSnaekSpeed += inc;
   if (_tmpSnaekSpeed>_snaekMaxSpeed) {
      _tmpSnaekSpeed=_snaekMaxSpeed;
   }
   if (_tmpSnaekSpeed<2) {
      _tmpSnaekSpeed=2;
   }
}

function incSnaekMaxSpeed(inc) {
   _snaekMaxSpeed += inc;
   incSnaekSpeed(inc);
   _timingSnaek = 0;
}

function incSnaekLength(inc) {
   _snaekLength += inc;
}

function setTurnsStop(n) {
   _turnsStopped = n;
}

function setTurnsSliding(n) {
   _turnsSliding = n;
}

function getDifficultyString() {
   switch (_difficulty) {
      case _DIF_EASY:
         return "easy";
      case _DIF_NORMAL:
         return "normal";
      case _DIF_HARD:
         return "hard";
      default:
         return "easy";
   }
}

function checkSnaekLength() {
   while (_snaek.length > _snaekLength) {
      setGrid(_snaek[0][0], _snaek[0][1], _EMPTY);
      setGridVisited(_snaek[0][0], _snaek[0][1]);
      _snaek.splice(0, 1);      
   }
}

//Modify next to be the next snaekMovement and returns true if it is possible or false if it isn't
function nextSnaekMovement(next, snaekDirection) {
   switch (snaekDirection) {
      case _RIGHT:
         next[0]++;
         incStatiscs("timesRight", 1);
         break;
      case _LEFT:
         next[0]--;
         incStatiscs("timesLeft", 1);
         break;
      case _DOWN:
         next[1]++;
         incStatiscs("timesDown", 1);
         break;
      case _UP:
         next[1]--;
         incStatiscs("timesUp", 1);
         break;            
   }
   if (next[0] > (_WSQUARE * _scale) - 1 || next[0] < 0 || next[1] > (_HSQUARE * _scale) - 1 || next[1] < 0) {
      return false;
   }
   return true;
}

function reverseSnaek() {
   _snaek.reverse();
   for (var i=0; i<_snaek.length; i++) {
      var tmp = _snaek[i][2];
      _snaek[i][2] = _snaek[i][3];
      _snaek[i][3] = tmp;
   }
   _snaekDirection = [opposite(_snaek[_snaek.length-1][2])];
}

function opposite(direction) {
   switch (direction) {
      case _DOWN:
         return _UP;
      case _UP:
         return _DOWN;
      case _LEFT:
         return _RIGHT;
      case _RIGHT:
         return _LEFT;
      default:
         return _RIGHT;
   }
}

function direction(direction) {
   if (direction == _UP) {
      return "up";
   }
   if (direction == _LEFT) {
      return "left";
   }
   if (direction == _DOWN) {
      return "down";
   }
   if (direction == _RIGHT) {
      return "right";
   }
   return "circle-red"; //Error
}

function snaekTurnLeft() {
   var direction = getSnaekDirection();
   direction = (direction + 2) % 4 + 1;
   _snaekDirection.push(direction);
   drawStatiscs();
}

function snaekTurnRight(args) {
   var direction = getSnaekDirection();
   direction = (direction) % 4 + 1;
   _snaekDirection.push(direction);
   drawStatiscs();
}

function snaekTurn(action) {
   if (action != opposite(getSnaekDirection())){
      _snaekDirection.push(action);
      drawStatiscs();
   }
}

function getSnaekDirection() {
   if (_snaekDirection.length==0) {
      return _snaek[_snaek.length-1][3];
   }
   else{
      return _snaekDirection[_snaekDirection.length-1];
   }
}

function bombExplosion(x,y) {
   for (var i = x-1; i<=x+1; i++) {
      for (var j = y-1; j<=y+1; j++) {
         if (i>=0 && i<_WSQUARE*_scale && j>=0 && j<_HSQUARE*_scale) {
            setGridVisited(i, j);
            switch (_grid[i][j]) {
               case "blue wall":
                  deleteObject(i,j,true);
                  createObject("green wall",i,j,0);
                  break;
               case "green wall":
                  deleteObject(i,j,true);
                  createObject("yellow wall",i,j,0);
                  break;
               case "yellow wall":
                  deleteObject(i,j,true);
                  createObject("white wall",i,j,0);
                  break;
               case "white wall":
                  deleteObject(i,j,true);
                  break;
            }
            if (isBoss(_grid[i][j])) {
               decreaseLife(i,j,5);
            }
         }
      }
   }
}

function setGridVisited(x, y) {
   if (!_gridVisited[x][y]) {
      _gridVisited[x][y] = true;
      _tilesRevealed += 1;
      if (_currentLevelJson.level.background) {
         drawImagePortion(_mctx[0], _storyJson[_currentStory].backgrounds[_currentLevelJson.level.background].img, x * _squareSize+1, y * _squareSize+1 ,
                       _squareSize-2, _squareSize-2, 0.5, x, y);
      }
   }   
}

function setGrid(x, y, value) {
   _grid[x][y] = value;
   _mctx[1].clearRect(x * _squareSize, y * _squareSize, _squareSize, _squareSize);
   _mctx[3].clearRect(x * _squareSize, y * _squareSize, _squareSize, _squareSize);
   drawUpperLayer(x, y);
}

//object is the name of the object (FOOD, MOUSE...)
function createObjects(n, object, respawnTimes){
   created = 0;
   tries = 0;
   while (created < n && tries < n * 1000) {
      i = Math.floor(Math.random() * _WSQUARE * _HSQUARE * _scale * _scale);
      x = i%(_WSQUARE * _scale);
      y = Math.floor(i/(_WSQUARE * _scale));
      //Check that the distance to the head of the snaek is > 1
      if (squareExistsAndObject(x,y,_EMPTY) && (Math.abs(x-_snaek[_snaek.length-1][0])>2 || Math.abs(y-_snaek[_snaek.length-1][1]>2))) {
         createObject(object, x, y, respawnTimes);
         created++;
      }
      tries++;
   }
   if (tries>=n*1000) {
      alert("!!!Implement something to create the object anyway!!!");
   }
}

//Create an object in the given position
function createObject(object, x, y, respawnTimes){
   if (squareExistsAndObject(x,y,_EMPTY)){
      setGrid(x, y, object);
      if (_enemiesJson[object] && _enemiesJson[object].life) {
         _objects.push([x, y, object, respawnTimes, _enemiesJson[object].life*_difficulty]);
      }
      else{
         _objects.push([x, y, object, respawnTimes]);
      }
      unlockObject(object);
   }
   else{ //if not empty create the object anywhere
      createObjects(1, object, respawnTimes);
   }
}

function findObject(kind) {
   for (var i=0; i<_objects.length; i++) {
      if (kind == _objects[i][2]) {
         return i
      }
   }
   return -1;
}

function countObject(kind) {
   var n = 0;
   for (var i=0; i<_objects.length; i++) {
      if (kind == _objects[i][2]) {
         n++;
      }
   }
   return n;
}

function deleteObject(x, y, killed) {
   for (i=0; i<_objects.length; i++) {
      if (_objects[i][0] == x && _objects[i][1] == y) {
         setGrid(x, y, _EMPTY);
         var name = _objects[i][2];
         var respawnTimes = _objects[i][3];
         if (isEnemy(name) && killed) {
            incStatiscs("points", _enemiesJson[name].points * _snaekSpeed);
         }
         if (killed) {
            incStatiscs("objects_" + name,1);
         }         
         _objects.splice(i,1);
         if (respawnTimes > 0) {
            createObjects(1, name, respawnTimes-1);
         }         
         return;
      }
   }
}

function deleteObjects(kind) {
   var x;
   var y;
   var respawnTimes;
   for (var i=_objects.length-1; i>=0; i--) {
      if (kind == _objects[i][2]) {
         x=_objects[i][0];
         y=_objects[i][1];
         setGrid(x, y, _EMPTY);
         respawnTimes = _objects[i][3];
         /*if (isEnemy(kind)) {
            incStatiscs("points", _enemiesJson[kind].points * _snaekSpeed);
         }
         incStatiscs("objects_" + kind,1);*/
         _objects.splice(i,1);
      }
   }
}

//return true if after decreasing the life is dead
function decreaseLife(x, y, inc) {
   for (i=0; i<_objects.length; i++) {
      if (_objects[i][0] == x && _objects[i][1] == y) {
         _objects[i][4]-=inc;
         if (_objects[i][4]<=0) {
            _objects[i][4]=0;
            deleteObject(x, y, true);
            return true; 
         }
      }
   }
   return false;
}

function updateEnemies(){
   for (i=0; i<_objects.length; i++) {
      if (isEnemy(_objects[i][2]) && isEnemyTurn(_objects[i][2])) {
         moveEnemy(i);
      }
   }
}

function isEnemy(name) {
   return _enemiesJson[name];
}

function isBoss(name) {
   return _enemiesJson[name] && _enemiesJson[name].life;
}

function isEnemyTurn(e) {
   var speed = _enemiesJson[e].speed * _difficulty;
   if (Math.floor((_gameStatiscs["timingGame"] - 1/_FPS)*speed) < Math.floor(_gameStatiscs["timingGame"]*speed)) {
      return true;     
   }
   return false;
}

function moveEnemy(i) {
   var direction;
   var create = _EMPTY;
   var move;
   var x = _objects[i][0];
   var y = _objects[i][1];
   var value = _objects[i][2];
   var pos = [x, y];
   eval(_enemiesJson[value].preMove);
   move = eval(_enemiesJson[value].move);
   if (move) {
      _objects[i][0] = pos[0];
      _objects[i][1] = pos[1];
      setGrid(_objects[i][0], _objects[i][1],_objects[i][2]);
      setGrid(x, y, _EMPTY);
      if (create != _EMPTY) {
         createObject(create, x, y, 0);
      }      
   }
   eval(_enemiesJson[value].postMove);
}

//modifies the array to do a random move and if it can't stay in the same pos and returns false
function randomMove(pos) {
   var direction = Math.floor(Math.random() * 4) + 1;
   var tmp=[pos[0],pos[1]];
   switch (direction) {
      case _RIGHT:
         tmp[0]++;
         break;
      case _LEFT:
         tmp[0]--;
         break;
      case _DOWN:
         tmp[1]++;
         break;
      case _UP:
         tmp[1]--;
         break;            
   }
   if (tmp[0] > (_WSQUARE * _scale) - 1 || tmp[0] < 0 || tmp[1] > (_HSQUARE * _scale) - 1 || tmp[1] < 0){
      return false;
   }
   if (_grid[tmp[0]][tmp[1]] != _EMPTY) {
      return false;
   }
   pos[0] = tmp[0];
   pos[1] = tmp[1];
   return true;
}

//modifies the array to do a random move and if it can't stay in the same pos and returns false
//If the snake is near he stings the snake
function randomAttackMove(pos) {
   if (!attackMove(pos)) {
      return randomMove(pos);
   }
   return false;
}

function attackMove(pos) {
   if(squareExistsAndObject(pos[0]+1,pos[1],_SNAEK) || squareExistsAndObject(pos[0]-1,pos[1],_SNAEK) ||
      squareExistsAndObject(pos[0],pos[1]+1,_SNAEK) || squareExistsAndObject(pos[0],pos[1]-1,_SNAEK)){
      incSnaekLength(-1);
      if (_snaekLength<5) {
         gameOver();
      }
      return true;
   }
   return false;
}

//modifies the array to do teleport move and if it can't stay in the same pos and returns false
function teleportMove(pos) {
   var teleported = false
   var tries = 0;
   while (!teleported && tries < 10) {
      var i = Math.floor(Math.random() * _WSQUARE * _HSQUARE * _scale * _scale);
      var x = i%(_WSQUARE * _scale);
      var y = Math.floor(i/(_WSQUARE * _scale));
      //Check that the distance to the head of the snaek is > 1
      if (squareExistsAndObject(x,y,_EMPTY) && (Math.abs(x-_snaek[_snaek.length-1][0])>2 || Math.abs(y-_snaek[_snaek.length-1][1]>2))) {
         teleported = true;
         pos[0] = x;
         pos[1] = y;
         created++;
      }
      tries++;
   }
   return teleported;
}

//Try moving the knight and returns True if it has been moved
function knightMove(i, pos) {
   var move;
   var x = pos[0];
   var y = pos[1];
   var moves = [];
   if (squareExistsAndObject(x+2, y+1,_EMPTY)) {
      moves.push([x+2, y+1]);
   }
   if (squareExistsAndObject(x+1, y+2,_EMPTY)) {
      moves.push([x+1, y+2]);
   }
   if (squareExistsAndObject(x-2, y+1,_EMPTY)) {
      moves.push([x-2, y+1]);
   }
   if (squareExistsAndObject(x-1, y+2,_EMPTY)) {
      moves.push([x-1, y+2]);
   }
   if (squareExistsAndObject(x+2, y-1,_EMPTY)) {
      moves.push([x+2, y-1]);
   }
   if (squareExistsAndObject(x+1, y-2,_EMPTY)) {
      moves.push([x+1, y-2]);
   }
   if (squareExistsAndObject(x-2, y-1,_EMPTY)) {
      moves.push([x-2, y-1]);
   }
   if (squareExistsAndObject(x-1, y-2,_EMPTY)) {
      moves.push([x-1, y-2]);
   }
   if (moves.length == 0) {
      return false;
   }
   move = moves[Math.floor(Math.random() * moves.length)];
   pos[0] = move[0];
   pos[1] = move[1];
   return true;
}

function squareExistsAndObject(x, y, o) {
   if (x<0 || y<0 || x>=_WSQUARE*_scale || y>=_HSQUARE*_scale) {
      return false;
   }
   return _grid[x][y] == o;
}

function updateEnvironment() {
   if (Math.floor((_gameStatiscs["timingGame"] - 1/_FPS)*10) < Math.floor(_gameStatiscs["timingGame"]*10)) {
      incEnvironment(_environmentInc);
   }
}

function incEnvironment(inc) {
   if (inc == 0) {
      return;
   }
   _environment += inc;
   if (_environment > _environmentTopLimit) {
      _environment = _environmentTopLimit;
   }
   if (_environment < 0) {
      _environment = 0;
   }
   redrawEnvironment();
}

function redrawEnvironment() {
   _mctx[2].clearRect(0,0,_mw,_h);
   drawRect(_mctx[2], 0, 0, _mw, _h, _environmentColor, _environment);
}

function togglePause() {
   if (_state != _GAME_PAUSED) {
      window.clearInterval(_update);
      _update = null;
      updateState(_GAME_PAUSED);
   }
   else{
      _update = setInterval(updateGame, 1000/_FPS);
      updateState(_GAME_RUNNING);
   }
}

function drawMainCanvas() {
   var buttons = _menusJson[_state].main.buttons;
   var texts = _menusJson[_state].main.texts;
   var images = _menusJson[_state].main.images;
   
   for (i=0; i<_mctx.length; i++) {
      if (_menusJson[_state].main.clear[i]) {
         _mctx[i].clearRect(0,0,_mw,_h);         
      }      
   }
   $('.main-canvas').css("cursor", "default");
   _mshapes = [];
   _mobjectHover = _NOTHING;

   for (var i=0; i<texts.length; i++) {
      var text = texts[i];
      drawText(_mctx[text.layer], eval(text['text']), _sq*text['x'], _sq*text['y'], _sq*text['w'], _sq*text['h'], text['color'], "Calibri", text['alignment']);
   }
   for (key in buttons) {
      var button = buttons[key];
      drawClickable(_mctx[button.layer], _mshapes, _buttonsJson[key].img, button['x']*_sq, button['y']*_sq, button['w']*_sq,
                    button['h']*_sq, buttonPressed, _menusJson[_state]["main"]["buttons"][key]);
   }
   for (key in images) {
      var image = images[key];
      drawImage(_mctx[image.layer], _imagesJson[image.name].img, image['x']*_sq, image['y']*_sq, image['w']*_sq, image['h']*_sq, false, image['opacity']);
   }
}

function drawLeftCanvas() {   
   //clear Canvas
   if (_menusJson[_state].left.clear) {
      $('#left-canvas').css("cursor", "default");
      _lctx.clearRect(0,0,_lw,_h);
      _lshapes = [];
      _lobjectHover = _NOTHING;
   }
   var buttons = _menusJson[_state].left.buttons;
   var texts = _menusJson[_state].left.texts;
   for (var i=0; i<texts.length; i++) {
      var text = texts[i];
      drawText(_lctx, eval(text['text']), _sq*text['x'], _sq*text['y'], _sq*text['w'], _sq*text['h'], text['color'], "Calibri", text['alignment']);
   }
   for (key in buttons) {
      var button = buttons[key];
      drawClickable(_lctx, _lshapes,_buttonsJson[key].img, button['x']*_sq, button['y']*_sq, button['w']*_sq, button['h']*_sq,
                    buttonPressed, _menusJson[_state]["left"]["buttons"][key]);
   }
}

function drawStatiscs() {
   var color;
   _lctx.clearRect(0,0,_lw,5.6*_h/9);
   if (_objectivesArray) {
      var y = 0.8;
      drawText(_lctx, "Objectives:", 2*_sq, y*_sq, 3.5*_sq, 0.5*_sq, "#333", "Calibri", "center");
      y += 0.5;
      for (var i=0; i<_objectivesArray[_objectivesIndex].texts.length; i++) {
         drawText(_lctx, eval(_objectivesArray[_objectivesIndex].texts[i]), 0.6*_sq, y*_sq, 3.5*_sq, 0.25*_sq, "#444", "Calibri", "left");
         if (eval(_objectivesArray[_objectivesIndex].conditions[i])) {
            drawImage(_lctx, _imagesJson["checked-box"].img, 0.25*_sq, (y-0.2)*_sq, 0.25*_sq, 0.25*_sq, true, 1.0);
         }
         else{
            drawImage(_lctx, _imagesJson["unchecked-box"].img, 0.25*_sq, (y-0.2)*_sq, 0.25*_sq, 0.25*_sq, true, 1.0);   
         }
         y+=0.3;
      }      
      //If boss draws the boss life
      if (_objectivesArray[_objectivesIndex].boss){
         var totalLife = _enemiesJson[_objectivesArray[_objectivesIndex].boss].life*_difficulty;
         for (var i=0; i<_objects.length; i++) {
            if (_objects[i][2] == _objectivesArray[_objectivesIndex].boss) {               
               var bossLife = _objects[i][4];
               drawRect(_lctx, _sq, (y-0.2)*_sq, 2.5*_sq*bossLife/totalLife, 0.25*_sq, "#2c2", 1);
               drawRect(_lctx, (1+2.5*bossLife/totalLife)*_sq, (y-0.2)*_sq, 2.5*_sq*(1-bossLife/totalLife), 0.25*_sq, "#c22", 1);
               drawText(_lctx, Math.ceil(100*bossLife/totalLife)+"%", 0.25*_sq, y*_sq, 1.5*_sq, 0.25*_sq, "#444", "Calibri", "left");
               y += 0.3;
            }
         }
      }
      y+=0.2;
      if (_objectivesArray[_objectivesIndex].avoids && _objectivesArray[_objectivesIndex].avoids.length > 0) {
         y += 0.3;
         drawText(_lctx, "Avoid this:", 2*_sq, y*_sq, 3.5*_sq, 0.5*_sq, "#333", "Calibri", "center");
         y += 0.5;
         for (var i=0; i<_objectivesArray[_objectivesIndex].avoids.length; i++) {
            color = "#444";
            if (eval(_objectivesArray[_objectivesIndex].avoids[i].red)) {
               color = "#922";
            }
            drawText(_lctx, eval(_objectivesArray[_objectivesIndex].avoids[i].text), 0.25*_sq, y*_sq, 3.5*_sq, 0.25*_sq, color, "Calibri", "left");
         }
         y+=0.5;
      }
      if (_setRemainingTime) {
         y += 0.3;
         drawText(_lctx, "Time Left:", 2*_sq, y*_sq, 3.5*_sq, 0.5*_sq, "#333", "Calibri", "center");
         y += 0.5;
         color = "#444";
         if (_remainingTime < 10) {
            color = "#922";
         }
         drawText(_lctx, _remainingTime.toFixed(2), 2*_sq, y*_sq, 3.5*_sq, 0.4*_sq, color, "Calibri", "center");
         y+= 0.5;
      }
      drawText(_lctx, "Length: "+_snaekLength, 0.25*_sq, y*_sq, 3.5*_sq, 0.25*_sq, "#922", "Calibri", "left");
      y+= 0.3;
      if (_turnsStopped > 0) {
         drawText(_lctx, "Stopped: " + _turnsStopped, 0.25*_sq, y*_sq, 3.5*_sq, 0.25*_sq, "#922", "Calibri", "left");
         y+= 0.3;
      }      
      if (_turnsSliding > 0) {
         drawText(_lctx, "Slidding...", 0.25*_sq, y*_sq, 3.5*_sq, 0.25*_sq, "#922", "Calibri", "left");
         y+= 0.3;         
      }
      //We only draw the changing speed once explained: story=0, stage=1, level=0, objective=2
      if (_currentStory > 0 || _currentStage > 1 || (_currentStage == 1 && _currentLevel>0) || (_currentStage == 1 && _currentLevel==0 & _objectivesIndex>1)) {
         drawText(_lctx, "Speed: "+_snaekSpeed+"/"+_snaekMaxSpeed, 0.25*_sq, y*_sq, 3.5*_sq, 0.25*_sq, "#922", "Calibri", "left");
         y+= 0.3;
      }
      //We only draw the queue once explained: story=0, stage=0, level=1, objective=1
      if (_currentStory > 0 || _currentStage > 0 || _currentLevel > 1 || (_currentLevel == 1 && _objectivesIndex > 0)) {
         drawText(_lctx, "Queued:", 0.25*_sq, y*_sq, 3.5*_sq, 0.25*_sq, "#922", "Calibri", "left");
         if (_snaekDirection.length > 0) {
            for (var i=0; i<_snaekDirection.length && i<6; i++) {
               drawImage(_lctx, _imagesJson[direction(_snaekDirection[i])].img, (1.5+i*0.3)*_sq, (y-0.25)*_sq, 0.25*_sq, 0.25*_sq, true, 1);
            }
         }
         y+= 0.3;
      }     
      
      //y+= 0.3;
      //drawText(_lctx, "FPS: " + _realfps, 0.25*_sq, y*_sq, 3.5*_sq, 0.25*_sq, "#333", "Calibri", "left");
   }
}

function checkObjectives() {
   var completed = true;
   if (_objectivesArray) {
      for (var i=0; i<_objectivesArray[_objectivesIndex].conditions.length; i++) {
         if (!eval(_objectivesArray[_objectivesIndex].conditions[i])) {
            completed = false;
         }
      }
      if (completed) {
         _dialog = _INGAME;
         _dialogArray = _objectivesArray[_objectivesIndex].dialog;
         _dialogIndex = 0;
         updateState(_GAME_DIALOG);
      }
   }
}

function checkAvoids() {
   if (_objectivesArray) {
      if (_objectivesArray[_objectivesIndex].avoids) {
         for (var i=0; i<_objectivesArray[_objectivesIndex].avoids.length; i++) {
            if (eval(_objectivesArray[_objectivesIndex].avoids[i].what)) {
               gameOver();
            }
         }  
      }      
   }
}

function drawClickable(ctx, shapes, img, x, y, w, h, func, data) {
   drawImage(ctx, img, x, y, w, h, true, 1);
   shapes[shapes.length] = {"ctx":ctx, "x": x, "y": y, "w": w, "h": h, "img": img, "func":func, "data": data};
}

function redrawClickable(shapes, i, state) {
   var obj = shapes[i];
   switch (state){
      case _CLICKABLE_HOVER:
         drawImage(obj.ctx, obj.img, obj.x, obj.y, obj.w, obj.h, true, 0.7);
         break;
      case _CLICKABLE_PRESSED:
         drawImagePressed(obj.ctx, obj.img, obj.x, obj.y, obj.w, obj.h, true, 0.7);
         break;
      case _CLICKABLE_NORMAL:
         drawImage(obj.ctx, obj.img, obj.x, obj.y, obj.w, obj.h, true, 1);
         break;
   }
}

function clickablePressed(i, shapes) {
   shapes[i].func(shapes[i].data);
}

function buttonPressed(button) {
   _lobjectHover = _NOTHING;
   eval(button.action);
}

function iniStory() {
   unlockStory(0, getDifficultyString());
   updateState(_GAME_STORY);
}

function drawImagePressed(ctx, img, x, y, w, h, clear, opacity) {
   if (clear) {         
      ctx.clearRect(x-1,y-1,w+2,h+2); //We clear 1 more pixel to make sure that decimals don't affect us
   }
   drawImage(ctx, img, x+0.1*w, y+0.1*h, w-0.2*w, h-0.2*h, false, opacity);
}

function drawImage(ctx, img, x, y, w, h, clear, opacity) {
   ctx.globalAlpha = opacity;
   if (clear) {         
      ctx.clearRect(x-1,y-1,w+2,h+2); //We clear 1 more pixel to make sure that decimals don't affect us
   }
   ctx.drawImage(img, x, y, w, h);
   ctx.lineWidth = 0;
   ctx.globalAlpha = 1;
}

function drawImagePortion(ctx, img, x, y, w, h, opacity, i, j) {
   ctx.globalAlpha = opacity;
   var xProp = img.width / _mw;
   var yProp = img.height / _h;
   ctx.clearRect(x, y, w, h);
   ctx.drawImage(img, x*xProp, y*yProp, w*xProp, h*yProp, x, y, w, h);
   drawUpperLayer(i, j);
   ctx.globalAlpha = 1;
}   

function loadStory(i) {
   _currentStory = i;
   setLastStage();
   updateState("stages");
}

function unlockStory(num, difficulty) {
   storeString("story_" + num + "_" + difficulty + "_islocked", "false");
}

function isLockedStory(num, difficulty) {
   return loadString("story_" + num + "_" + difficulty + "_islocked") !== "false";
}

function isCompletedStage(story, stage, difficulty) {
   return loadString("stage_" + story + "_" + stage + "_" + difficulty) == "true";
}

function setCompletedStage(story, stage, difficulty) {
   storeString("stage_" + story + "_" + stage + "_" + difficulty, "true");
}

function isCompletedLevel(story, stage, level, difficulty) {
   return loadString("level_" + story + "_" + stage + "_" + level + "_" + difficulty, "true") == "true";
}

function setCompletedlevel(story, stage, level, difficulty) {
   storeString("level_" + story + "_" + stage + "_" + level + "_" + difficulty, "true");
}

function drawDifficulty() {
   _mctx[4].clearRect(0,0,_mw,_sq*0.3);
   _mctx[4].clearRect(0,0,_mw,_sq*0.3);
   var x = _sq*8;
   var color = "#eee"
   drawText(_mctx[4], "Difficulty:", x, _sq*0.4, _sq*8, _sq*0.2, color, "Calibri", "left");
   var metrics = _mctx[4].measureText("Difficulty:").width;
   x += metrics;
   if (_difficulty == _DIF_EASY) {
      color = "#ee0";
   }
   drawText(_mctx[4], " Easy ", x, _sq*0.4, _sq*8, _sq*0.2, color, "Calibri", "left");
   color = "#eee";
   var metrics = _mctx[4].measureText(" Easy ").width;
   drawClickable(_mctx[5], _mshapes, _buttonsJson["transparent"].img, x, _sq*0.1, metrics, _sq*0.4, changeDifficulty, _DIF_EASY);
   x += metrics;
   if (_difficulty == _DIF_NORMAL) {
      color = "#ee0";
   }
   drawText(_mctx[4], " Normal ", x, _sq*0.4, _sq*8, _sq*0.2, color, "Calibri", "left");
   color = "#eee";
   var metrics = _mctx[4].measureText(" Normal ").width;
   drawClickable(_mctx[5], _mshapes, _buttonsJson["transparent"].img, x, _sq*0.1, metrics, _sq*0.4, changeDifficulty, _DIF_NORMAL);
   x += metrics;
   if (_difficulty == _DIF_HARD) {
      color = "#ee0";
   }
   drawText(_mctx[4], " Hard ", x, _sq*0.4, _sq*8, _sq*0.2, color, "Calibri", "left");
   color = "#eee";
   var metrics = _mctx[4].measureText(" Hard ").width;
   drawClickable(_mctx[5], _mshapes, _buttonsJson["transparent"].img, x, _sq*0.1, metrics, _sq*0.4, changeDifficulty, _DIF_HARD);
}

function changeDifficulty(level) {
   _difficulty = level;
   drawDifficulty();
}

function drawStoryTiles() { //Space for 6 tiles
   for (var i=0; i<_storyJson.length; i++) {
      x = i % 3;
      y = Math.floor(i/3);      
      drawStoryTile(i, x, y);
   }
}

function drawStoryTile(i, x, y) {
   drawLine(_mctx[0], x*_sq*4, y*_sq*4.5, (x+1)*_sq*4, y*_sq*4.5, "#999", 1);
   drawLine(_mctx[0], (x+1)*_sq*4, y*_sq*4.5, (x+1)*_sq*4, (y+1)*_sq*4.5, "#999", 1);
   drawLine(_mctx[0], x*_sq*4, y*_sq*4.5, x*_sq*4, (y+1)*_sq*4.5, "#999", 1);
   drawLine(_mctx[0], x*_sq*4, (y+1)*_sq*4.5, (x+1)*_sq*4, (y+1)*_sq*4.5, "#999", 1);
   if (isLockedStory(i, getDifficultyString())) {      
      drawImage(_mctx[0], _imagesJson.locked.img, (4*x+0.5)*_sq, (4.5*y+0.5)*_sq, 3*_sq, 3*_sq, true, 1);
      drawText(_mctx[0], "?????", (4*x+2)*_sq, (4.5*y+4)*_sq, 3*_sq, 0.3*_sq, "#ccc", "Calibri", "center");
   }
   else{
      drawClickable(_mctx[6], _mshapes, _storyJson[i].img, (4*x+0.5)*_sq, (4.5*y+0.5)*_sq, 3*_sq, 3*_sq, loadStory, i);
      drawText(_mctx[0], _storyJson[i].name, (4*x+2)*_sq, (4.5*y+4)*_sq, 3*_sq, 0.3*_sq, "#ccc", "Calibri", "center");  
   }   
}

function drawStages() {
   background = _storyJson[_currentStory].backgrounds[_storyJson[_currentStory].stages[_currentStage].background].img;
   text = _storyJson[_currentStory].stages[_currentStage].name;
   drawImage(_mctx[0],background, 0, 0, _mw, _h, true, 0.5);
   drawText(_mctx[0], text, 6*_sq, _sq*1.3, 10*_sq, 0.5*_sq, "#eee", "Calibri", "center");
   drawLevels(_currentStory, _currentStage);
}

function setLastStage() {
   _currentStage = 0;
   while (isCompletedStage(_currentStory,_currentStage,getDifficultyString()) && _currentStage < _storyJson[_currentStory].stages.length-1) {
      _currentStage++;
   }
}

function drawLevels(story, stage) {
   var levels = _storyJson[story].stages[stage].levels;
   var level;
   var i;
   _currentLevel = -1;
   for (i=0; i<levels.length; i++) {
      level = levels[i];
      if (isCompletedLevel(story, stage, i, getDifficultyString())) {
         drawClickable(_mctx[4], _mshapes, _imagesJson["circle-green"].img, level.x*_sq, level.y*_sq, level.r*_sq,
                       level.r*_sq, beginLevel, [story, stage, i]);
         if (i > 0) {
            drawLine(_mctx[0], (level.x+level.r/2)*_sq, (level.y+level.r/2)*_sq,
                  (levels[i-1].x+levels[i-1].r/2)*_sq, (levels[i-1].y+levels[i-1].r/2)*_sq, "#888", 5);
         }
      }
      else if (_currentLevel == -1) {
         _currentLevel = i;
         if (level.stop) {
            drawClickable(_mctx[4], _mshapes, _imagesJson["circle-grey"].img, level.x*_sq, level.y*_sq, level.r*_sq,
                       level.r*_sq, "", "");
         } else {
            drawClickable(_mctx[4], _mshapes, _imagesJson["circle-red"].img, level.x*_sq, level.y*_sq, level.r*_sq,
                       level.r*_sq, beginLevel, [story, stage, i]);
         }
         if (i > 0) {
            drawLine(_mctx[0], (level.x+level.r/2)*_sq, (level.y+level.r/2)*_sq,
                  (levels[i-1].x+levels[i-1].r/2)*_sq, (levels[i-1].y+levels[i-1].r/2)*_sq, "#888", 5);
         }
      }
      /*else{ //Activate this for showing all the path
         drawImage(_mctx[4], _imagesJson["circle-grey"].img, level.x*_sq, level.y*_sq, level.r*_sq, level.r*_sq, true, 1);
      }
      if (i > 0) {
         drawLine(_mctx[0], (level.x+level.r/2)*_sq, (level.y+level.r/2)*_sq,
                  (levels[i-1].x+levels[i-1].r/2)*_sq, (levels[i-1].y+levels[i-1].r/2)*_sq, "#888", 5);
      }*/
   }
   if (_currentLevel==-1) {
      _currentLevel = i;
   }
   if (_currentStage>0) {
      drawClickable(_mctx[6], _mshapes, _imagesJson["previous"].img, 0.1*_sq, 4.1*_sq, 0.8*_sq, 0.8*_sq, previousStage, "");
   }
   if (isCompletedStage(_currentStory, _currentStage, getDifficultyString()) && _storyJson[_currentStory].stages.length>_currentStage+1) {
      drawClickable(_mctx[6], _mshapes, _imagesJson["next"].img, 11.1*_sq, 4.1*_sq, 0.8*_sq, 0.8*_sq, nextStage, "");
   }
}

function previousStage() {
   _currentStage--;
   updateState(_GAME_STAGES);
}

function nextStage() {
   _currentStage++;
   updateState(_GAME_STAGES);
}

function drawLibrary(){
   var x = _sq*1.5;
   var color1;
   var color2;
   var metrics;
   var objects;
   var text;
   var unlocked;
   var i;
   if (_libraryTab == _LIBRARY_ITEMS) {
      color1 = "#ee0";
      color2 = "#eee";
      objects = _itemsJson;
   }
   else{
      color1 = "#eee";
      color2 = "#ee0"
      objects = _enemiesJson;
   }
   unlocked = 0;
   for (key in _itemsJson) {
      if (isUnlockedObject(key)) {
         unlocked++;
      }
   }
   text = "Items (" +unlocked+"/"+Object.keys(_itemsJson).length+")";
   drawText(_mctx[4], text, x, _sq, _sq*8, _sq*0.4, color1, "Calibri", "left");
   metrics = _mctx[4].measureText(text).width;
   drawClickable(_mctx[5], _mshapes, _buttonsJson["transparent"].img, x, _sq*0.6, metrics, _sq*0.5, changeLibraryTab, _LIBRARY_ITEMS);
   x = _sq*7;
   unlocked = 0;
   for (key in _enemiesJson) {
      if (isUnlockedObject(key)) {
         unlocked++;
      }
   }
   text = "Enemies (" +unlocked+"/"+Object.keys(_enemiesJson).length+")";
   drawText(_mctx[4], text, x, _sq, _sq*8, _sq*0.4, color2, "Calibri", "left");
   metrics = _mctx[4].measureText(text).width;
   drawClickable(_mctx[5], _mshapes, _buttonsJson["transparent"].img, x, _sq*0.6, metrics, _sq*0.5, changeLibraryTab, _LIBRARY_ENEMIES);
   var sortedObjects = Object.keys(objects);
   if (_libraryPage>0) {
      drawClickable(_mctx[6], _mshapes, _imagesJson["previous"].img, 0.1*_sq, 4.1*_sq, 0.8*_sq, 0.8*_sq, previousLibraryPage, "");
   }
   if ((_libraryPage+1)*7*4<sortedObjects.length) {
      drawClickable(_mctx[6], _mshapes, _imagesJson["next"].img, 11.1*_sq, 4.1*_sq, 0.8*_sq, 0.8*_sq, nextLibraryPage, "");
   }
   for (var y=0; y<4; y++) {
      for (var z=0; z<7; z++) {
         i=7*4*_libraryPage+7*y+z;
         if (i>=sortedObjects.length) {
            return;
         }
         if (isUnlockedObject(sortedObjects[i])) {
            drawImage(_mctx[0], objects[sortedObjects[i]].img, _sq*(z*1.5+0.95), _sq*(2+y*1.5), _sq*1.1, _sq*1.1, false, 1);
         }
         else{
            drawImage(_mctx[0], _imagesJson.locked.img, _sq*(z*1.5+0.75), _sq*(1.8+y*1.5), _sq*1.5, _sq*1.5, false, 1);
         }
      }
   }   
}

function drawObject(x, y) {
   var objects;
   if (_libraryTab == _LIBRARY_ITEMS) {
      objects = _itemsJson;
   }
   else{
      objects = _enemiesJson;
   }
   var sortedObjects = Object.keys(objects);
   var i=7*4*_libraryPage+7*y+x;
   _lctx.clearRect(0,0,_lw,7.8*_sq);
   if (isUnlockedObject(sortedObjects[i])) {
      drawText(_lctx, sortedObjects[i].toUpperCase() ,2*_sq, _sq, 4*_sq, 0.4*_sq, "#eee","calibri", "center");
      drawImage(_lctx, objects[sortedObjects[i]].img, _sq*1.25, _sq*1.5, _sq*1.5, _sq*1.5, false, 1);
      drawText(_lctx, objects[sortedObjects[i]].description, 0.3*_sq, 3.5*_sq, 3.4*_sq, 0.25*_sq, "#444","calibri", "left");
   }
   else{
      drawText(_lctx, "LOCKED",2*_sq, _sq, 4*_sq, 0.4*_sq, "#eee","calibri", "center");      
      drawImage(_lctx, _imagesJson.locked.img, _sq*1.25, _sq*1.5, _sq*1.5, _sq*1.5, false, 1);
      drawText(_lctx, "Keep playing story mode to unlock more items and enemies!",0.3*_sq, 3.5*_sq, 3.4*_sq, 0.25*_sq, "#444","calibri", "left");
   }
}

function unlockObject(o) {
   storeString("object_"+o, "true")
}

function isUnlockedObject(o) {
   return loadString("object_"+o)=="true";
}

function changeLibraryTab(n) {
   _libraryTab = n;
   _libraryPage = 0;
   updateState(_GAME_LIBRARY);
}

function nextLibraryPage() {
   _libraryPage++;
   updateState(_GAME_LIBRARY);
}

function previousLibraryPage() {
   _libraryPage--;
   updateState(_GAME_LIBRARY);
}

function beginLevel(data) {
   _currentLevelJson = _storyJson[data[0]].stages[data[1]].levels[data[2]];
   _currentStory = data[0];
   _currentStage = data[1];
   _currentLevel = data[2];
   _dialog = _PREGAME;
   _dialogArray = _currentLevelJson.prelevel;
   _dialogIndex = 0;
   updateState(_GAME_DIALOG);   
}

function drawSnaekDialogBox() {
   var dialog = _dialogArray[_dialogIndex];
   if (_update) {
      window.clearInterval(_update);
      _update = null;
   }
   drawRect(_mctx[5], 0, 0, _mw, _h, "#fff", 0.6);
   if (dialog.alignment == "right") {
      drawRightBubble(_storyJson[_currentStory].characters[dialog.character].img, dialog.sentence);
   }
   else{
      drawLeftBubble(_storyJson[_currentStory].characters[dialog.character].img, dialog.sentence);
   }   
}

function nextDialog() {
   _dialogIndex++;
   if (_dialogIndex >= _dialogArray.length) {
      skipDialog();
   }
   else{
      updateState(_GAME_DIALOG);
   }
}

function previousDialog() {
   if (_dialogIndex > 0) {
      _dialogIndex--;
      updateState(_GAME_DIALOG);
   }
}

function skipDialog() {
   switch (_dialog) {
      case _PREGAME:
         newGame();
         break;
      case _INGAME: //Load the next objective and load the enemies
         _objectivesIndex++;
         iniObjectivesStatiscs();
         if (_objectivesIndex >= _objectivesArray.length) {
            levelCompleted();
         }
         else{
            loadObjects();
            loadTime();
            resumeGame();
         }
         break;
   }
}

function loadObjects() {
   for (var i=0; i<_objectivesArray[_objectivesIndex].objects.length; i++){
      var obj = _objectivesArray[_objectivesIndex].objects[i];
      if (obj.position == "random") {
         createObjects(obj.n, obj.name, obj.respawns);
      } else if (obj.position == "fixed"){
         for (var j=0; j<obj.pos.length; j++) {
            createObject(obj.name, obj.pos[j][0], obj.pos[j][1], obj.respawns);
         }         
      } else if (obj.position == "forced"){
         for (var j=0; j<obj.pos.length; j++) {
            deleteObject(obj.pos[j][0], obj.pos[j][1], false);
            if (obj.name != "empty") {
               createObject(obj.name, obj.pos[j][0], obj.pos[j][1], obj.respawns);
            }            
         }         
      }
   }
}

function loadTime() {
   if (_objectivesArray[_objectivesIndex].time) {
      _setRemainingTime = true;
      _remainingTime = _objectivesArray[_objectivesIndex].time;
   }
   else{
      _setRemainingTime = false;
   }
}

function levelCompleted() {
   setCompletedlevel(_currentStory, _currentStage, _currentLevel, getDifficultyString());
   incrementString("statiscs_levelsCompleted", 1);
   incrementString("statiscs_level_" + _currentStory + "_" + _currentStage + "_"+ _currentLevel + "_" + getDifficultyString() + "_completed", 1);
   if (_storyJson[_currentStory].stages[_currentStage].levels.length-1 == _currentLevel) {
      setCompletedStage(_currentStory, _currentStage, getDifficultyString());
   }
   saveStatiscs();
   
   if (_currentLevelJson.level.background) {
      for (i=0; i<_mctx.length; i++) {
         _mctx[i].clearRect(0,0,_mw, _h);
      }
      drawImage(_mctx[0], _storyJson[_currentStory].backgrounds[_currentLevelJson.level.background].img, 0,0, _mw, _h, true, 1);
      setTimeout(function(){updateState(_GAME_STAGES);}, 2000);
   }
   else{
      updateState(_GAME_STAGES);      
   }
}

function gameOver() {
   incrementString("statiscs_levelsFailed", 1);
   incrementString("statiscs_level_" + _currentStory + "_" + _currentStage + "_"+ _currentLevel + "_" + getDifficultyString() + "_failed", 1);
   saveStatiscs();
   updateState(_GAME_OVER);
   window.clearInterval(_update);
   _update = null;
}

function saveStatiscs() {
   for (key in _gameStatiscs) {
      incrementString("statiscs_" + key, _gameStatiscs[key]);
   }
}

function drawRightBubble(img, txt) {
   preBubble();
   _mctx[5].lineTo(_sq*10, _sq*5.5);
   _mctx[5].lineTo(_sq*9.75, _sq*5.75);
   _mctx[5].lineTo(_sq*9.5, _sq*5.5);
   postBubble(img,txt);
   drawImage(_mctx[5], img, _sq*9, _sq*6, _sq*2, _sq*2, false, 1);
}

function drawLeftBubble(img, txt) {
   preBubble();   
   _mctx[5].lineTo(_sq*2, _sq*5.5);
   _mctx[5].lineTo(_sq*1.75, _sq*5.75);
   _mctx[5].lineTo(_sq*1.5, _sq*5.5);
   postBubble(img, txt);
   drawImage(_mctx[5], img, _sq*1, _sq*6, _sq*2, _sq*2, false, 1);
}

function preBubble() {
   _mctx[5].lineWidth = 2;
   _mctx[5].strokeStyle = "#666"
   _mctx[5].fillStyle = "#fff";
   _mctx[5].globalAlpha = 0.7;
   _mctx[5].beginPath();
   _mctx[5].moveTo(_sq*0.5, _sq*0.5);
   _mctx[5].lineTo(_sq*11.5, _sq*0.5);
   _mctx[5].lineTo(_sq*11.5, _sq*5.5);
}

function postBubble(img, txt) {
   _mctx[5].lineTo(_sq*0.5, _sq*5.5);
   _mctx[5].lineTo(_sq*0.5, _sq*0.5);
   _mctx[5].fill();
   _mctx[5].globalAlpha = 1;
   _mctx[5].stroke();
   _mctx[5].closePath();   
   drawText(_mctx[5], txt, _sq*6, _sq*1.25, _sq*10, _sq*0.5, "#444", "Calibri", "center")
}

//Given a letter return it's keycode
function keyCodeLetter(letter) {
   return letter.charCodeAt(0);
}

function storeString(key, value) {
   if(typeof(Storage)!=="undefined"){
      localStorage[key]=value;
   }
   else if (!_alertBrowser){
      alert("Sorry, your browser does not support web storage. Update to last version of Google Chrome");
      _alertBrowser = true;
   }
}

function incrementString(key, value) {
   if(typeof(Storage)!=="undefined"){
      if (localStorage[key]){
         localStorage[key] = parseFloat(localStorage[key]) + value;
      }
      else{
         localStorage[key] = value;
      }
   }
   else if (!_alertBrowser){
      alert("Sorry, your browser does not support web storage. Update to last version of Google Chrome");
      _alertBrowser = true;
   }
}

function loadString(key) {
   if(typeof(Storage)!=="undefined"){
      return localStorage[key];
   }
   else if (!_alertBrowser){
      alert("Sorry, your browser does not support web storage. Update to last version of Google Chrome");
      _alertBrowser = true;
   }
   return false;
}

function onLoadGame() {
   updateContent($("#content").outerWidth(), $("#content").outerHeight());
   $(".main-canvas").last().keydown(onMainCanvasKeyPress);
   $("#left-canvas").keydown(onMainCanvasKeyPress); //Calls the same function that main canvas on key press
   $(".main-canvas").last().mousemove(onMainCanvasMouseMove);
   $("#left-canvas").mousemove(onLeftCanvasMouseMove);
   $(".main-canvas").last().mousedown(onMainCanvasMouseDown);   
   $("#left-canvas").mousedown(onLeftCanvasMouseDown);
   $(".main-canvas").last().mouseup(onMainCanvasMouseUp);
   $("#left-canvas").mouseup(onLeftCanvasMouseUp);
   $(".main-canvas").last().mouseleave(onMainCanvasMouseLeave);
   $("#left-canvas").mouseleave(onLeftCanvasMouseLeave);

   $(window).resize(function() {
      updateContent($("#content").outerWidth(), $("#content").outerHeight());
   });
}

function onMainCanvasKeyPress(key) {
   key.preventDefault();
   action = _keyMapping[key.keyCode];
   if (action) {
      switch (action) {
         case _RESET:
            newGame();
            break;
         case _PAUSE:
            if (_state == _GAME_RUNNING || _state == _GAME_PAUSED) {
               togglePause();                  
            }               
            break;
         case _SPACEBAR:
            if (_state == _GAME_RUNNING){
               _snaekDirection = [];
            }
            if (_state == _GAME_DIALOG){
               nextDialog();
            }
            break;
         case _ESCAPE:
            if (_state == _GAME_DIALOG){
               skipDialog();
            }
            break;
         case _SPEEDDOWN:
            incSnaekSpeed(-0.25);
            break;
         case _SPEEDUP:
            incSnaekSpeed(0.25);
            break;
         default:
            if (_state == _GAME_RUNNING) {
               snaekTurn(action);
            }                              
      }          
   }            
}

function onLeftCanvasMouseMove(e) {
   _lobjectHover = onCanvasMouseMove(e, $("#left-canvas"), _lctx, _lshapes, _lobjectHover);   
}

function onMainCanvasMouseMove(e) {
   _mobjectHover = onCanvasMouseMove(e, $(".main-canvas").last(), _mctx[_mctx.length-1], _mshapes, _mobjectHover);
}

function onCanvasMouseMove(e, canvas, ctx, shapes, objectHover) {
   e.preventDefault();
   var mx = e.offsetX;
   var my = e.offsetY;
   if(mx==undefined){ // this works for Firefox
     mx = e.pageX-canvas.offset().left;
     my = e.pageY-canvas.offset().top;
   }             

   var selected = _NOTHING
   for (var key in shapes) {
      if (contains(mx, my, shapes[key])) {
         selected = key;
      }
   }
   if (selected != objectHover) {
      if (selected == _NOTHING) {
         canvas.css("cursor", "default");
         redrawClickable(shapes, objectHover, _CLICKABLE_NORMAL);     
      } else {            
         canvas.css("cursor", "pointer");
         redrawClickable(shapes, selected, _CLICKABLE_HOVER);
         if (objectHover != _NOTHING) {
            redrawClickable(shapes, objectHover, _CLICKABLE_NORMAL);  
         }
      }
      return selected;
   }
   if (_state == _GAME_LIBRARY && ctx==_mctx[_mctx.length-1]) {
      var x=Math.floor(((mx/_sq)-0.75)/1.5);
      var y=Math.floor(((my/_sq)-1.8)/1.5);
      if (x>=0 && y>=0 && x<7 && y<4) {
         drawObject(x,y);
      }         
   }
   return objectHover;
}

function contains(x, y, shape) {
   return x >= shape.x && y >= shape.y && x <= shape.w+shape.x && y <= shape.h+shape.y;
}

function onLeftCanvasMouseDown(e) {
   $('#left-canvas').focus();
   onCanvasMouseDown(e, _lctx, _lobjectHover, _lshapes);
}

function onMainCanvasMouseDown(e) {
   $('.main-canvas').last().focus();
   onCanvasMouseDown(e, _mctx[_mctx.length-1], _mobjectHover, _mshapes);
}   

function onCanvasMouseDown(e, ctx, objectHover, shapes) {
   e.preventDefault();
   if (objectHover != _NOTHING) {
      redrawClickable(shapes, objectHover, _CLICKABLE_PRESSED);
   }
}

function onLeftCanvasMouseUp(e) {
   onCanvasMouseUp(e, _lctx, 'left', _lobjectHover, _lshapes);
}

function onMainCanvasMouseUp(e) {      
   //For cell phones we make the snaek turn left or right depending of the side of the screen clicked
   /*if (_state == _GAME_RUNNING) {
      if (e.offsetX <= _mw/2) {
         snaekTurnLeft();
      }
      else{
         snaekTurnRight();
      }
   }*/
   onCanvasMouseUp(e, _mctx[_mctx.length-1], 'main', _mobjectHover, _mshapes);
}

function onCanvasMouseUp(e, ctx, canvas, objectHover, shapes) {
   e.preventDefault();
   if (objectHover != _NOTHING) {
      redrawClickable(shapes, objectHover, _CLICKABLE_HOVER);
      clickablePressed(objectHover, shapes);
   }
}

function onLeftCanvasMouseLeave(e) {
   onCanvasMouseLeave(e, _lctx, _lobjectHover, _lshapes);
   _lobjectHover = _NOTHING;
}

function onMainCanvasMouseLeave(e) {
   onCanvasMouseLeave(e, _mctx, _mobjectHover, _mshapes);
   _mobjectHover = _NOTHING;
}

function onCanvasMouseLeave(e, ctx, objectHover, shapes) {
   if (objectHover != _NOTHING) {         
      redrawClickable(shapes, objectHover, _CLICKABLE_NORMAL);
   }
}

var stage;
var mazeGame={};
var bindings={}; // A dic mapping ASCII keys to string values describing the action we want to take when that key is pressed.
var actions={}; // A dic mapping actions to a boolean value indicating whether that action is currently being performed.

jQuery(function($){
   updateContent($("#content").outerWidth(), $("#content").outerHeight());
});

function updateContent(w, h) {
   if ($('#content>div').length==0) { //First time here
      var div = $("<div id='game'></div>");
      $('#content').append(div);
      stage = new Kinetic.Stage({
         container: 'game',
         width: w,
         height: h
      });
      stage.background = backgroundLayer("#ccc");
      stage.add(stage.background);
      createMaze(20,15,30);
   } else { //Redraw everything
      stage.setWidth(w);
      stage.setHeight(h);
      stage.background.rect.setWidth(w);
      stage.background.rect.setHeight(h);
      stage.draw();
   }  
}

function createMaze(tilesWidth, tilesHeight, pixelsSquare) { 
   initializeMaze(tilesWidth, tilesHeight, pixelsSquare);   
   mazeIterativeCreate();
   makeTree();
   drawMaze();
   startGame();
}

function initializeMaze(tilesWidth, tilesHeight, pixelsSquare) {
   mazeGame.width = tilesWidth;
   mazeGame.height = tilesHeight;
   mazeGame.pixels = pixelsSquare;
   mazeGame.squares=[];
   mazeGame.vWalls=[];
   mazeGame.hWalls=[]
   mazeGame.randomize=random(15,60); //To make the generation more random
   for (var i=0;i<mazeGame.height;i++) {
      mazeGame.squares[i]=[];      
      if (i<mazeGame.height-1) {
         mazeGame.hWalls[i] = [];
      }
      mazeGame.vWalls[i]=[];
      for (var j=0;j<mazeGame.width;j++) {
         mazeGame.squares[i][j] = false;
         if (i<mazeGame.height-1) {
            mazeGame.hWalls[i][j] = true;
         }
         if (j<mazeGame.width-1) {
            mazeGame.vWalls[i][j] = true;
         }
      }
   }
}

function mazeIterativeCreate(){
   var x=random(0,mazeGame.height-1);
   var y=random(0,mazeGame.width-1)
   mazeGame.squares[x][y]=true;
   mazeGame.path=[[x,y]];
   while (mazeGame.path.length>0) {
      var square;
      var index;
      var options=[];
      var newPath;      
      if (Math.random()>mazeGame.randomize){//Continue path
         index=mazeGame.path.length-1;
      
      } else { //New path
         index=random(0, mazeGame.path.length-1);
      }
      square=mazeGame.path[index];
      optionsAdd(options,square[0]-1,square[1],square[0]-1,square[1],true);
      optionsAdd(options,square[0]+1,square[1],square[0],square[1],true);
      optionsAdd(options,square[0],square[1]-1,square[0],square[1]-1,false);
      optionsAdd(options,square[0],square[1]+1,square[0],square[1],false);
      if (options.length == 0) {
         mazeGame.path.splice(index, 1);
      } else {
         newPath=options[Math.floor(Math.random()*options.length)];
         mazeGame.squares[newPath[0]][newPath[1]]=true;
         if (newPath[4]) {
            mazeGame.hWalls[newPath[2]][newPath[3]]=false;
         } else {
            mazeGame.vWalls[newPath[2]][newPath[3]]=false;
         }                
         mazeGame.path.push([newPath[0],newPath[1]]);
      }
   }
}

function optionsAdd(options,x,y,wallx,wally,horizontal) {
   if (x>=0 && x<mazeGame.height && y>=0 && y<mazeGame.width && !mazeGame.squares[x][y]) {
      options.push([x,y,wallx,wally,horizontal]);
   }
}

function makeTree() {
   mazeGame.root={
      node: [0,0],
      sons: []
   }
   mazeMakeTreeNode(mazeGame.root, null);
}

function mazeMakeTreeNode(node, antNode) {
   //First create the sons
   var cell=node.node;
   mazeAddNode(node,cell[0]-1,cell[1], cell[0]-1,cell[1], true, antNode);
   mazeAddNode(node,cell[0]+1,cell[1], cell[0],cell[1], true,antNode);
   mazeAddNode(node,cell[0],cell[1]-1, cell[0],cell[1]-1,false, antNode);
   mazeAddNode(node,cell[0],cell[1]+1, cell[0],cell[1], false, antNode);
   var maxHeight=0;
   var maxHeightCell=[cell[0], cell[1]];
   var secondMaxHeight=0;
   var secondMaxHeightCell=[];
   var maxPath=0;
   var cellPathStart=[cell[0], cell[1]];
   var cellPathEnd=[cell[0], cell[1]];
   for (var i=0; i<node.sons.length; i++) {
      var height=node.sons[i].height;
      if (height>secondMaxHeight) {
         if (height>maxHeight) {
            secondMaxHeight=maxHeight;
            secondMaxHeightCell=maxHeightCell;
            maxHeight=height;
            maxHeightCell=node.sons[i].heightCell;
         } else {
            secondMaxHeight=height;
            secondMaxHeightCell=node.sons[i].heightCell;
         }
      }
      if (maxPath<node.sons[i].maxPath) {
         maxPath=node.sons[i].maxPath;
         cellPathStart=node.sons[i].cellPathStart;
         cellPathEnd=node.sons[i].cellPathEnd;
      }
   }
   node.height = maxHeight +1;
   node.heightCell = maxHeightCell;
   if (maxPath<maxHeight+secondMaxHeight) {
      maxPath=maxHeight+secondMaxHeight;
      cellPathStart=maxHeightCell;
      cellPathEnd=secondMaxHeightCell;
   }        
   node.maxPath=maxPath;
   node.cellPathStart=cellPathStart;
   node.cellPathEnd=cellPathEnd;
}

function mazeAddNode(node, x, y, wallx, wally, horizontal, antNode) {
   var cell=node.node;
   if (x>=0 && x<mazeGame.height && y>=0 && y<mazeGame.width && (!antNode || x!=antNode.node[0] || y!=antNode.node[1])) {
      if (horizontal) {
         if (!mazeGame.hWalls[wallx][wally]) {
            node.sons.push({node:[x,y],sons:[]});
            mazeMakeTreeNode(node.sons[node.sons.length-1],node);
         }
      } else {
         if (!mazeGame.vWalls[wallx][wally]) {
            node.sons.push({node:[x,y],sons:[]});
            mazeMakeTreeNode(node.sons[node.sons.length-1],node);
         }
      }
   }
}

function drawMaze() {
   var sq = mazeGame.pixels;
   var strokeWidth = Math.floor(sq/15);
   //Outer line
   var line = new Kinetic.Line({
      points: [12,0,12,mazeGame.height*sq+38,mazeGame.width*sq+38,mazeGame.height*sq+38,mazeGame.width*sq+38,12,12,12],
      stroke: 'black',
      strokeWidth:26
   });
   
   //Maze
   stage.getLayers()[0].add(line);
   for (var i=0;i<mazeGame.height;i++) {
      for (var j=0;j<mazeGame.width;j++) {
         if (i<mazeGame.height-1 && mazeGame.hWalls[i][j]) {
            var line = new Kinetic.Line({
               points: [25+sq*(j)-strokeWidth/2,25+sq*(i+1),25+sq*(j+1)+strokeWidth/2,25+sq*(i+1)],
               stroke: 'black',
               strokeWidth:strokeWidth
            });
            stage.getLayers()[0].add(line);
         }
         if (j<mazeGame.width-1 && mazeGame.vWalls[i][j]) {
            var line = new Kinetic.Line({
               points: [25+sq*(j+1),25+sq*(i)-strokeWidth/2,25+sq*(j+1),25+sq*(i+1)+strokeWidth/2],
               stroke: 'black',
               strokeWidth:strokeWidth
            });
            stage.getLayers()[0].add(line);
         }
      }
   }
   stage.getLayers()[0].draw();
   
   //Start
   mazeGame.circle=new Kinetic.Circle({
      x:25+sq/2+sq*mazeGame.root.cellPathStart[1],
      y:25+sq/2+sq*mazeGame.root.cellPathStart[0],
      radius: sq/3,
      fill: 'red',
      stroke: 'black',
      strokeWidth:strokeWidth
   });
   
   //End
   var circle=new Kinetic.Circle({
      x:25+sq/2+sq*mazeGame.root.cellPathEnd[1],
      y:25+sq/2+sq*mazeGame.root.cellPathEnd[0],
      radius: sq/3,
      fill: '#333',
      stroke: '#333',
      strokeWidth:strokeWidth
   });  
   var layerBall = new Kinetic.Layer();
   layerBall.add(circle);
   layerBall.add(mazeGame.circle);
   stage.add(layerBall);
   
   //Tot això potser hauria d'anar a un altre lloc
   $('#game').mouseenter(function(){
      document.body.style.cursor = "pointer";      
   }); 
   $('#game').mouseleave(function(){
      document.body.style.cursor = "default";
      mazeGame.focus=false;
   });
   $('#game').mousedown(mouseIni); 
   $('#game').mouseup(mouseEnd);
  
   window.addEventListener('keydown',onKeyDown);
   window.addEventListener('keyup',onKeyUp);
   bindAction(87, 'move-up');
   bindAction(38, 'move-up');
   bindAction(65, 'move-left');
   bindAction(37, 'move-left');
   bindAction(83, 'move-down');
   bindAction(40, 'move-down');
   bindAction(68, 'move-right');
   bindAction(39, 'move-right');
}

function bindAction(key, action) {
   bindings[key] = action;
}

function onKeyDown() {
   actions[bindings[event.keyCode]] = true;
}

function onKeyUp() {
   actions[bindings[event.keyCode]] = false;
}

function startGame() {
   mazeGame.mousePressed=false;
   mazeGame.inMovement = false;
   mazeGame.time = new Date().getTime();
   mazeGame.interval=setInterval(mazeBallMove,33);
}

function mouseIni() {
   mazeGame.mousePressed=true;
   mazeGame.focus=true;
}

function mouseEnd() {
   mazeGame.mousePressed=false;
}

function mazeBallMove() {
   if (mazeGame.inMovement) {
      return;
   }
   if (mazeGame.mousePressed) {
      var mousePosition=stage.getTouchPosition();
      if (!mousePosition) {
         mousePosition=stage.getMousePosition()
      }
      if (!mousePosition) {
         return;
      }
      if (Math.abs(mousePosition.x-mazeGame.circle.getX())>Math.abs(mousePosition.y-mazeGame.circle.getY())) {
         if (!horizontalMove(mousePosition)) {
            if(!verticalMove(mousePosition)){
               return;
            }
         }
      } else{
         if (!verticalMove(mousePosition)) {
            if(!horizontalMove(mousePosition)){
               return;
            }
         }
      }
   } else if (mazeGame.focus) {
      if (actions['move-up']) {
         moveUp();
      } else if (actions['move-down']) {
         moveDown();
      } else if (actions['move-left']) {
         moveLeft();
      } else if (actions['move-right']) {
         moveRight();
      }
   }
}

function horizontalMove(pos) {
   if (Math.abs(pos.x-mazeGame.circle.getX())<=mazeGame.pixels/2) {
      return false;
   }   
   if (pos.x>mazeGame.circle.getX()) {
      return moveRight();
   } else {
      return moveLeft();
   }
}

function verticalMove(pos) {
   if (Math.abs(pos.y-mazeGame.circle.getY())<=mazeGame.pixels/2) {
      return false;
   }
   if (pos.y>mazeGame.circle.getY()) {
      return moveDown();      
   } else {
      return moveUp();      
   }
}

function moveLeft() {
   var sq=mazeGame.pixels;
   var posX=(mazeGame.circle.getX()-25-sq/2)/sq;
   var posY=(mazeGame.circle.getY()-25-sq/2)/sq;
   var endX;
   if (posX<1 || mazeGame.vWalls[posY][posX-1]) {         
      return false;
   } else {
      endX = posX-1;                
   }
   moveTo(posX, posY, endX, posY);
   return true;
}

function moveRight() {
   var sq=mazeGame.pixels;
   var posX=(mazeGame.circle.getX()-25-sq/2)/sq;
   var posY=(mazeGame.circle.getY()-25-sq/2)/sq;
   var endX;
   if (posX>mazeGame.width-2 || mazeGame.vWalls[posY][posX]) {
      return false;
   } else {
      endX = posX+1;                
   }
   moveTo(posX, posY, endX, posY);
   return true;
}

function moveUp() {
   var sq=mazeGame.pixels;
   var posX=(mazeGame.circle.getX()-25-sq/2)/sq;
   var posY=(mazeGame.circle.getY()-25-sq/2)/sq;
   var endY;
   if (posY<1 || mazeGame.hWalls[posY-1][posX]) {
      return false;
   } else {
      endY = posY-1;                
   }
   moveTo(posX, posY, posX, endY);
   return true;
}

function moveDown() {
   var sq=mazeGame.pixels;
   var posX=(mazeGame.circle.getX()-25-sq/2)/sq;
   var posY=(mazeGame.circle.getY()-25-sq/2)/sq;
   var endY;
   if (posY>mazeGame.height-2 || mazeGame.hWalls[posY][posX]) {
      return false;
   } else {
      endY = posY+1;                
   }
   moveTo(posX, posY, posX, endY);
   return true;
}

function moveTo(posX, posY, endX, endY) {
   var sq=mazeGame.pixels;
   var anim=new Kinetic.Animation(function(frame) {
   if (frame.time < 200) {
      mazeGame.circle.setX(25+sq/2+posX*sq+(endX-posX)*frame.time*sq/200);
      mazeGame.circle.setY(25+sq/2+posY*sq+(endY-posY)*frame.time*sq/200);
   }else{        
      mazeGame.circle.setX(25+sq/2+endX*sq);
      mazeGame.circle.setY(25+sq/2+endY*sq);
      anim.stop();
      clearInterval(mazeGame.interval);
      mazeGame.inMovement=false;
      if (endX==mazeGame.root.cellPathEnd[1] && endY==mazeGame.root.cellPathEnd[0]) {
         mazeGameCompleted();
      } else {
         mazeBallMove();
         mazeGame.interval=setInterval(mazeBallMove,33);
      }
   }
   }, stage.getLayers()[1]);
   if (!mazeGame.inMovement) {
      mazeGame.inMovement=true;
      anim.start();
   }
}

function mazeGameCompleted() {
   mazeGame.time = new Date().getTime()-mazeGame.time;
   //var star = mazeMedal();        
   //var previousMedal=loadString("mazeMedal");
   //var improved = false;        
   
   //if (!loadString("mazeTime") || mazeGame.time < loadString("mazeTime")) {
   //   improved = true;
      //storeString("mazeMedal", star);
      //storeString("mazeTime", mazeGame.time);
   //}
   //mazeEndScreen();
}

function backgroundLayer(color) {
   var b = new Kinetic.Layer();
   b.rect = new Kinetic.Rect({
      width: stage.getWidth(),
      height: stage.getHeight(),
      fill: color
   });
   b.add(b.rect);
   return b;
}

//Generates a random integer number between ini and end;
function random(ini, end) {
   return Math.floor(Math.random()*(end-ini+1))+ini;
}
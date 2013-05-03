var action={BUILD_ACTION_SPEED:3,doTheBuild:function(b,a,c){0==b.iterate%this.BUILD_ACTION_SPEED&&(100>c.cp?production.updateConstruction(b,c):c.l<gameData.ELEMENTS[c.f][c.r][c.t].l?production.repairBuilding(b,c):a.a=null)},doTheAttack:function(b,a,c){0==b.iterate%(3-gameData.ELEMENTS[a.f][a.r][a.t].attackSpeed)&&fightLogic.attack(b,a,c)},doTheGathering:function(b,a,c){0==b.iterate%gameData.ELEMENTS[a.f][a.r][a.t].gatheringSpeed&&production.gatherResources(b,a,c)}};var AI={RESOURCE_DISTANCE_THRESHOLD:10,ENEMY_DISTANCE_THRESHOLD:15,searchForNewResources:function(b,a,c,d){b=mapLogic.getNearestResource(b,c,d);tools.getElementsDistance(c,b)<=gameData.ELEMENTS[a.f][a.r][a.t].vision?(a.a=b,a.pa=b):(a.a=null,a.pa=null)},searchForNewEnemy:function(b,a){var c=mapLogic.getNearestEnemy(b,a);null!=c&&tools.getElementsDistance(a,c)<=gameData.ELEMENTS[a.f][a.r][a.t].vision&&(a.a=c)},targetReaction:function(b,a,c){gameData.ELEMENTS[a.f][a.r][a.t].isBuilder?(b=tools.getTilesAroundElements(b,
a),0<b.length&&(a.mt=b[parseInt(Math.random()*(b.length-1))])):a.a=c}};var fightLogic={WEAPON_TYPES:{normal:0,piercing:1,siege:2,magic:3},ARMOR_TYPES:{unarmored:0,light:1,medium:2,heavy:3,building:4},WEAPONS_EFFICIENCY:[[1,1,1.5,1,0.5],[1.5,1.5,0.5,0.5,0.3],[1.5,1,0.5,0.5,2],[1.5,1.5,1.5,1.5,0.3]],attack:function(b,a,c){var d=Math.max(0,parseInt(gameData.ELEMENTS[a.f][a.r][a.t].attack*this.WEAPONS_EFFICIENCY[gameData.ELEMENTS[a.f][a.r][a.t].weaponType][gameData.ELEMENTS[c.f][c.r][c.t].armorType]*(1+0.2*Math.random()))-gameData.ELEMENTS[c.f][c.r][c.t].defense);this.applyDamage(b,
d,c,a);tools.addUniqueElementToArray(b.modified,c);c.f==gameData.FAMILIES.unit&&(null==c.a&&(null==c.mt||null==c.mt.x))&&AI.targetReaction(b,c,a)},applyDamage:function(b,a,c,d){c.l-=a;null!=d&&0>=c.l&&(d.fr+=1,d.a=null,tools.addUniqueElementToArray(b.modified,d),c.murderer=d.o,AI.searchForNewEnemy(b,d))}};var gameCreation={PROBABILITY_TREE:0.6,ZONE_SIZE:8,createNewGame:function(b,a){var c=new gameData.Game,d;for(d in a){var e=a[d],f;for(f in b.ir.re)e.re.push(b.ir.re[f].value);for(var g in a)g==d?e.ra.push(gameData.RANKS.me):e.ra.push(gameData.RANKS.enemy);c.players.push(e)}this.createNewMap(c,b,a);stats.init(c);return c},createNewMap:function(b,a,c){b.grid=this.initGrid(a.size);a.t.id==gameData.MAP_TYPES.random.id&&this.createRandomMap(b,a,c)},initGrid:function(b){for(var a=[],c=0;c<b.x;c++){a[c]=
[];for(var d=0;d<b.y;d++)a[c][d]={x:c,y:d,isWall:!1}}return a},createRandomMap:function(b,a,c){for(var d=parseInt(a.size.x/this.ZONE_SIZE),e=parseInt(a.size.y/this.ZONE_SIZE),f=[],g=0;g<d;g++){f.push([]);for(var h=0;h<e;h++)f[g].push(-10)}this.dispatchPlayers(b,f,c,d,e);c=[];for(g in a.ve.zones)for(var h=a.ve.zones[g],k=0;k<h.factor;k++)c.push(h.t);for(g=0;g<d;g++)for(h=0;h<e;h++)0>f[g][h]?this.populateZone(b,a,{x:g*this.ZONE_SIZE+1,y:h*this.ZONE_SIZE+1},{x:(g+1)*this.ZONE_SIZE-1,y:(h+1)*this.ZONE_SIZE-
1},c[parseInt(Math.random()*c.length)]):this.populateZone(b,a,{x:g*this.ZONE_SIZE+1,y:h*this.ZONE_SIZE+1},{x:(g+1)*this.ZONE_SIZE-1,y:(h+1)*this.ZONE_SIZE-1},f[g][h])},populateZone:function(b,a,c,d,e){switch(e){case gameData.ZONES.forest:this.createForest(b,c,d);break;case gameData.ZONES.goldmine:this.createGoldMine(b,a,c,d)}},createForest:function(b,a,c){for(var d=a.x;d<c.x;d++)for(var e=a.y;e<c.y;e++)Math.random()<this.PROBABILITY_TREE&&this.addGameElement(b,new gameData.Terrain(gameData.ELEMENTS[gameData.FAMILIES.terrain][0][0],
d,e))},createGoldMine:function(b,a,c,d){a=this.getRandomPositionInZoneForElement(gameData.ELEMENTS[gameData.FAMILIES.terrain][0][2],c,d);this.addGameElement(b,new gameData.Terrain(gameData.ELEMENTS[gameData.FAMILIES.terrain][0][2],a.x,a.y))},getRandomPositionInZoneForElement:function(b,a,c){return{x:parseInt(a.x+b.shape[0].length/2+Math.random()*(c.x-a.x-b.shape[0].length)),y:parseInt(a.y+b.shape.length/2+Math.random()*(c.y-a.y-b.shape.length))}},addGameElement:function(b,a){var c=gameData.ELEMENTS[a.f][a.r][a.t].shape;
b.gameElements.push(a);for(var d in c){var e=c[d],f;for(f in e)if(0<e[f]){var g=tools.getPartPosition(a,d,f);b.grid[g.x][g.y].isWall=!0}}tools.addUniqueElementToArray(b.added,a)},removeGameElement:function(b,a){var c=gameData.ELEMENTS[a.f][a.r][a.t].shape,d;for(d in c){var e=c[d],f;for(f in e)if(0<e[f]){var g=tools.getPartPosition(a,d,f);b.grid[g.x][g.y].isWall=!1}}tools.addUniqueElementToArray(b.removed,a)},dispatchPlayers:function(b,a,c){var d=this.getAvailableInitialPositions(c.length),e;for(e in c){var f=
parseInt(d.length*Math.random()),g=d[f],g={x:this.convertCoordinates(a[0].length,g.x),y:this.convertCoordinates(a.length,g.y)};d.splice(f,1);a[g.x][g.y]=gameData.ZONES.basecamp;f={x:g.x*this.ZONE_SIZE+parseInt(this.ZONE_SIZE/4)+parseInt(Math.random()*this.ZONE_SIZE/2),y:g.y*this.ZONE_SIZE+parseInt(this.ZONE_SIZE/4)+parseInt(Math.random()*this.ZONE_SIZE/2)};this.setupBasecamp(b,c[e],f);this.placeZoneRandomlyAround(gameData.ZONES.forest,a,g.x,g.y);this.placeZoneRandomlyAround(gameData.ZONES.goldmine,
a,g.x,g.y)}},placeZoneRandomlyAround:function(b,a,c,d){for(var e=null,f=null;null==e||1==a[e][f];)e=Math.min(a[0].length-1,Math.max(0,parseInt(c+2*Math.random()-1))),f=Math.min(a.length-1,Math.max(0,parseInt(d+2*Math.random()-1)));a[e][f]=b},setupBasecamp:function(b,a,c){var d=gameData.BASECAMPS[a.r];c=new gameData.Building(d.buildings[0],c.x,c.y,a.o,!0);this.addGameElement(b,c);c=tools.getTilesAroundElements(b,c);for(var e in d.units)this.addGameElement(b,new gameData.Unit(d.units[e],c[e].x,c[e].y,
a.o))},getAvailableInitialPositions:function(b){var a=[];if(4!=b)for(var c=[[0,0,0],[0,1,0],[0,0,0]],d=0;d<b;d++){for(var e=null,f=null;null==e||0<c[e][f];)e=parseInt(3*Math.random()),f=parseInt(3*Math.random());c[e][f]=1;a.push({x:e,y:f});3>=b&&(2>e&&(c[e+1][f]=1),0<e&&(c[e-1][f]=1),2>f&&(c[e][f+1]=1),0<f&&(c[e][f-1]=1))}else 0.5>Math.random()?(a.push({x:0,y:0}),a.push({x:0,y:2}),a.push({x:2,y:0}),a.push({x:2,y:2})):(a.push({x:1,y:0}),a.push({x:1,y:2}),a.push({x:0,y:1}),a.push({x:2,y:1}));return a},
convertCoordinates:function(b,a){return 0==a?1:1==a?parseInt(b/2):b-2}};var gameData={FAMILIES:{unit:0,building:1,terrain:2},ELEMENTS:[[],[],[]],RANKS:{me:0,ally:1,neutral:2,enemy:3},PLAYER_STATUSES:{ig:0,defeat:1,victory:2,watcher:3},unitId:0,createUniqueId:function(){this.unitId+=1;return(new Date).getMilliseconds()+"i"+this.unitId}};var gameLogic={FREQUENCY:5,update:function(b){b.modified=[];b.added=[];b.removed=[];for(var a in b.orders)order.dispatchReceivedOrder(b,b.orders[a][0],b.orders[a][1]);b.orders=[];for(var c in b.players)b.players[c].s=gameData.PLAYER_STATUSES.defeat;for(c in b.gameElements){var d=b.gameElements[c];d.f==gameData.FAMILIES.building&&(b.players[d.o].s=gameData.PLAYER_STATUSES.ig);this.resolveActions(b,d);this.updateMoves(b,d);this.updateBuildings(b,d);d.f==gameData.FAMILIES.unit&&this.protectAround(b,
d)}this.addNewBuildings(b);this.removeDeads(b);this.checkGameOver(b);stats.update(b);c=[];for(a in b.chat)c.push(b.chat[a]);b.chat=[];return{modified:b.modified,added:b.added,removed:b.removed,players:b.players,chat:c}},addNewBuildings:function(b){for(var a in b.newBuildings)gameCreation.addGameElement(b,b.newBuildings[a]);b.newBuildings=[]},updateMoves:function(b,a){null!=a.mt&&null!=a.mt.x&&(move.moveElement(b,a),tools.addUniqueElementToArray(b.modified,a))},resolveActions:function(b,a){if(null!=
a.a){var c=gameData.ELEMENTS[a.f][a.r][a.t],d=tools.getElementsDistance(a,a.a);1>=d?(a.mt={x:null,y:null},c.isBuilder&&a.a.f==gameData.FAMILIES.building&&rank.isAlly(b.players,a.o,a.a)?100>a.a.cp?action.doTheBuild(b,a,a.a):null!=a.ga?production.getBackResources(b,a):action.doTheBuild(b,a,a.a):c.isBuilder&&a.a.f==gameData.FAMILIES.terrain?action.doTheGathering(b,a,a.a):rank.isEnemy(b.players,a.o,a.a)&&action.doTheAttack(b,a,a.a)):d<=c.range?rank.isEnemy(b.players,a.o,a.a)&&(action.doTheAttack(b,a,
a.a),a.mt={x:null,y:null}):(c=tools.getClosestPart(a,a.a),a.mt={x:c.x,y:c.y});tools.addUniqueElementToArray(b.modified,a)}},removeDeads:function(b){for(var a=b.gameElements.length;a--;){var c=b.gameElements[a];if(0>=c.l||0==c.ra)c.f!=gameData.FAMILIES.terrain&&(c.f==gameData.FAMILIES.building?production.removeBuilding(b,c):c.f==gameData.FAMILIES.unit&&production.removeUnit(b,c)),this.removeElement(b,a),gameCreation.removeGameElement(b,c)}},updateBuildings:function(b,a){a.f==gameData.FAMILIES.building&&
0<a.q.length&&(production.updateQueueProgress(b,a),tools.addUniqueElementToArray(b.modified,a))},removeElement:function(b,a){b.gameElements.splice(a,1)},checkGameOver:function(b){var a=0,c=-1,d;for(d in b.players)b.players[d].s==gameData.PLAYER_STATUSES.defeat?a++:c=b.players[d].o;a==b.players.length-1&&(b.players[c].s=gameData.PLAYER_STATUSES.victory)},protectAround:function(b,a){(null==a.mt||null==a.mt.x)&&(null==a.a&&null==a.pa&&!gameData.ELEMENTS[a.f][a.r][a.t].isBuilder)&&AI.searchForNewEnemy(b,
a)}};var mapLogic={getNearestResource:function(b,a,c){var d=-1,e=null,f;for(f in b.gameElements){var g=b.gameElements[f];if(g.f==gameData.FAMILIES.terrain&&gameData.ELEMENTS[g.f][g.r][g.t].resourceType==c){var h=tools.getElementsDistance(a,g);if(2>h)return g;if(h<d||-1==d)d=h,e=g}}return e},getNearestBuilding:function(b,a,c){var d=-1,e=null,f;for(f in b.gameElements){var g=b.gameElements[f];if(g.f==gameData.FAMILIES.building&&rank.isAlly(b.players,a.o,g)&&g.t==c){var h=tools.getElementsDistance(a,g);if(2>
h)return g;if(h<d||-1==d)d=h,e=g}}return e},getNearestEnemy:function(b,a){var c=-1,d=null,e;for(e in b.gameElements){var f=b.gameElements[e];if(f.f!=gameData.FAMILIES.terrain&&rank.isEnemy(b.players,a.o,f)){var g=tools.getElementsDistance(a,f);if(g<=gameData.ELEMENTS[a.f][a.r][a.t].vision&&f.f==gameData.FAMILIES.unit)return f;if(g<c||-1==c)c=g,d=f}}return d}};var move={ASTAR_MAX_STEPS_SEARCH:4,moveElement:function(b,a){if(0==b.iterate%gameData.ELEMENTS[a.f][a.r][a.t].speed){for(var c=b.grid[a.mt.x][a.mt.y],d=0;c.isWall&&20>d;){d++;var e=astar.neighbors(b.grid,c,!0),f;for(f in e)if(!e[f].isWall){c=e[f];a.mt={x:c.x,y:c.y};break}}c=astar.search(b.grid,b.grid[a.p.x][a.p.y],c,!0);if(0<c.length){c={x:c[0].x,y:c[0].y};if(!b.grid[c.x][c.y].isWall){d=gameData.ELEMENTS[a.f][a.r][a.t].shape;for(f in d)for(var g in d[f])0<d[f][g]&&(e=tools.getPartPosition(a,f,g),
b.grid[e.x][e.y].isWall=!1);a.p=c;for(f in d)for(g in d[f])0<d[f][g]&&(e=tools.getPartPosition(a,f,g),b.grid[e.x][e.y].isWall=!0)}a.mt.x==a.p.x&&a.mt.y==a.p.y&&(a.mt={x:null,y:null})}}}},astar={init:function(b){for(var a=0,c=b.length;a<c;a++)for(var d=0,e=b[a].length;d<e;d++){var f=b[a][d];f.f=0;f.g=0;f.h=0;f.cost=1;f.visited=!1;f.closed=!1;f.parent=null}},heap:function(){return new BinaryHeap(function(b){return b.f})},search:function(b,a,c,d,e){astar.init(b);e=e||astar.manhattan;d=!!d;var f=astar.heap();
for(f.push(a);0<f.size();){a=f.pop();if(a===c||f.size>this.ASTAR_MAX_STEPS_SEARCH){b=a;for(c=[];b.parent;)c.push(b),b=b.parent;return c.reverse()}a.closed=!0;for(var g=astar.neighbors(b,a,d),h=0,k=g.length;h<k;h++){var j=g[h];if(!j.closed&&!j.isWall){var l=a.g+j.cost,m=j.visited;if(!m||l<j.g)j.visited=!0,j.parent=a,j.h=j.h||e(j,c),j.g=l,j.f=j.g+j.h,m?f.rescoreElement(j):f.push(j)}}}return[]},manhattan:function(b,a){var c=Math.abs(a.x-b.x),d=Math.abs(a.y-b.y);return c+d},neighbors:function(b,a,c){var d=
[],e=a.x;a=a.y;b[e-1]&&b[e-1][a]&&d.push(b[e-1][a]);b[e+1]&&b[e+1][a]&&d.push(b[e+1][a]);b[e]&&b[e][a-1]&&d.push(b[e][a-1]);b[e]&&b[e][a+1]&&d.push(b[e][a+1]);c&&(b[e-1]&&b[e-1][a-1]&&d.push(b[e-1][a-1]),b[e+1]&&b[e+1][a-1]&&d.push(b[e+1][a-1]),b[e-1]&&b[e-1][a+1]&&d.push(b[e-1][a+1]),b[e+1]&&b[e+1][a+1]&&d.push(b[e+1][a+1]));return d}};function BinaryHeap(b){this.content=[];this.scoreFunction=b}
BinaryHeap.prototype={push:function(b){this.content.push(b);this.sinkDown(this.content.length-1)},pop:function(){var b=this.content[0],a=this.content.pop();0<this.content.length&&(this.content[0]=a,this.bubbleUp(0));return b},remove:function(b){for(var a=this.content.length,c=0;c<a;c++)if(this.content[c]==b){var d=this.content.pop();c!=a-1&&(this.content[c]=d,this.scoreFunction(d)<this.scoreFunction(b)?this.sinkDown(c):this.bubbleUp(c));return}throw Error("Node not found.");},size:function(){return this.content.length},
rescoreElement:function(b){this.sinkDown(this.content.indexOf(b))},sinkDown:function(b){for(var a=this.content[b];0<b;){var c=Math.floor((b+1)/2)-1,d=this.content[c];if(this.scoreFunction(a)<this.scoreFunction(d))this.content[c]=a,this.content[b]=d,b=c;else break}},bubbleUp:function(b){for(var a=this.content.length,c=this.content[b],d=this.scoreFunction(c);;){var e=2*(b+1),f=e-1,g=null;if(f<a){var h=this.scoreFunction(this.content[f]);h<d&&(g=f)}if(e<a&&this.scoreFunction(this.content[e])<(null==
g?d:h))g=e;if(null!=g)this.content[b]=this.content[g],this.content[g]=c,b=g;else break}}};var order={TYPES:{action:0,buildThatHere:1,buy:2,cancelConstruction:3,chat:4,diplomacy:5},dispatchReceivedOrder:function(b,a,c){switch(a){case 0:this.convertDestinationToOrder(b,c[0],c[1],c[2]);break;case 1:this.buildThatHere(b,c[0],c[1],c[2],c[3]);break;case 2:this.buy(b,c[0],c[1]);break;case 3:this.cancelConstruction(b,c[0]);break;case 4:this.receiveChatMessage(b,c[0],c[1]);break;case 5:this.updateDiplomacy(b,c[0],c[1],c[2])}},buildThatHere:function(b,a,c,d,e){a=tools.getGameElementsFromIds(b,a);
c=new gameData.Building(c,d,e,a[0].o,!1);production.startConstruction(b,c);this.build(b,a,c)},buy:function(b,a,c){a=tools.getGameElementsFromIds(b,a);production.buyElement(b,a,c)},cancelConstruction:function(b,a){var c=tools.getGameElementsFromIds(b,[a]);production.cancelConstruction(b,c[0])},updateRallyingPoint:function(b,a,c,d){for(var e in a){var f=a[e];0<gameData.ELEMENTS[f.f][f.r][f.t].buttons.length&&(f.rp={x:c,y:d});tools.addUniqueElementToArray(b.modified,f)}},attack:function(b,a,c){for(var d in a){var e=
a[d];e.pa=null;e.a=c;tools.addUniqueElementToArray(b.modified,e)}},build:function(b,a,c){for(var d in a){var e=a[d];e.pa=null;e.a=c;tools.addUniqueElementToArray(b.modified,e)}},move:function(b,a,c,d){for(var e in a){var f=a[e];f.pa=null;f.a=null;f.mt={x:c,y:d};tools.addUniqueElementToArray(b.modified,f)}},gather:function(b,a,c){for(var d in a){var e=a[d];e.a=c;e.pa=c;tools.addUniqueElementToArray(b.modified,e)}},receiveChatMessage:function(b,a,c){b.chat.push({o:a,text:c})},updateDiplomacy:function(b,
a,c,d){b.players[a].ra[c]=d},convertDestinationToOrder:function(b,a,c,d){a=tools.getGameElementsFromIds(b,a);if(!(0==a.length||c>=b.grid[0].length||d>=b.grid.length))if(a[0].f==gameData.FAMILIES.building)this.updateRallyingPoint(b,a,c,d);else{var e=tools.getElementUnder(b,c,d);if(null!=e)if(e.f==gameData.FAMILIES.unit){if(!rank.isAlly(b.players,a[0].o,e)){this.attack(b,a,e);return}}else{if(e.f==gameData.FAMILIES.building){if(rank.isAlly(b.players,a[0].o,e))for(var f in a){var g=a[f];gameData.ELEMENTS[g.f][g.r][g.t].isBuilder?
order.build(b,[g],e):order.move(b,[g],c,d)}else order.attack(b,a,e);return}if(e.f==gameData.FAMILIES.terrain&&0<=gameData.ELEMENTS[e.f][0][e.t].resourceType){for(f in a)g=a[f],gameData.ELEMENTS[g.f][g.r][g.t].isBuilder?(order.gather(b,[g],e),g.a=e):order.move(b,[g],c,d);return}}order.move(b,a,c,d)}}};var production={RESOURCE_AMOUNT_PER_GATHERING_ACTION:2,BUILDINGS_QUEUE_MAX_SIZE:5,REPAIRING_SPEED:5,startConstruction:function(b,a){var c=gameData.ELEMENTS[a.f][a.r][a.t];this.canBuyIt(b.players,a.o,c)&&(this.paysForElement(b,a.o,c),b.newBuildings.push(a))},updateConstruction:function(b,a){a.cp+=100/gameData.ELEMENTS[a.f][a.r][a.t].timeConstruction;100<=a.cp&&this.finishConstruction(b,a);tools.addUniqueElementToArray(b.modified,a)},cancelConstruction:function(b,a){null!=a&&100>a.cp&&(this.sellsElement(b,
a.o,gameData.ELEMENTS[a.f][a.r][a.t]),a.l=0)},finishConstruction:function(b,a){a.cp=100;0<gameData.ELEMENTS[a.f][a.r][a.t].pop&&(b.players[a.o].pop.max+=gameData.ELEMENTS[a.f][a.r][a.t].pop);stats.updateField(b,a.o,"buildingsCreated",1)},repairBuilding:function(b,a){var c=b.players[a.o].re;0<c[gameData.RESOURCES.wood.id]&&0<c[gameData.RESOURCES.gold.id]&&(c[gameData.RESOURCES.gold.id]--,c[gameData.RESOURCES.wood.id]--,a.l+=this.REPAIRING_SPEED,tools.addUniqueElementToArray(b.modified,a))},removeBuilding:function(b,
a){0<gameData.ELEMENTS[a.f][a.r][a.t].pop&&100==a.cp&&(b.players[a.o].pop.max-=gameData.ELEMENTS[a.f][a.r][a.t].pop);null!=a.murderer&&stats.updateField(b,a.murderer,"buildingsDestroyed",1)},gatherResources:function(b,a,c){if(null==a.ga||a.ga.t!=gameData.ELEMENTS[c.f][c.r][c.t].resourceType)a.ga={t:gameData.ELEMENTS[c.f][c.r][c.t].resourceType,amount:0};var d=Math.min(gameData.ELEMENTS[a.f][a.r][a.t].maxGathering-a.ga.amount,this.RESOURCE_AMOUNT_PER_GATHERING_ACTION,c.ra);a.ga.amount+=d;c.ra-=d;tools.addUniqueElementToArray(b.modified,
c);a.ga.amount==gameData.ELEMENTS[a.f][a.r][a.t].maxGathering?(b=mapLogic.getNearestBuilding(b,a,gameData.ELEMENTS[gameData.FAMILIES.building][b.players[a.o].r][0].t),a.a=b):0==c.ra&&AI.searchForNewResources(b,a,a,gameData.ELEMENTS[a.pa.f][a.pa.r][a.pa.t].resourceType)},getBackResources:function(b,a){b.players[a.o].re[a.ga.t]+=a.ga.amount;stats.updateField(b,a.o,"resources",a.ga.amount);a.ga=null;null!=a.pa&&(0==a.pa.ra?AI.searchForNewResources(b,a,a.pa,gameData.ELEMENTS[a.pa.f][a.pa.r][a.pa.t].resourceType):
a.a=a.pa)},buyElement:function(b,a,c){for(var d in a){var e=a[d];e.t==a[0].t&&(100==e.cp&&e.q.length<this.BUILDINGS_QUEUE_MAX_SIZE&&this.canBuyIt(b.players,e.o,c))&&(this.paysForElement(b,e.o,c),e.q.push(c.t),tools.addUniqueElementToArray(b.modified,e))}},updateQueueProgress:function(b,a){a.qp+=100/(gameLogic.FREQUENCY*gameData.ELEMENTS[gameData.FAMILIES.unit][a.r][a.q[0]].timeConstruction);if(100<=a.qp){var c=!0;(c=this.createNewUnit(b,a.q[0],a))?(a.qp=0,a.q.splice(0,1)):a.qp=99}tools.addUniqueElementToArray(b.modified,
a)},createNewUnit:function(b,a,c){a=gameData.ELEMENTS[gameData.FAMILIES.unit][c.r][a];var d=tools.getTilesAroundElements(b,c),e=b.players[c.o].pop;return 0<d.length&&e.current+a.pop<=e.max?(a.isBuilder?stats.updateField(b,c.o,"buildersCreated",1):stats.updateField(b,c.o,"unitsCreated",1),d=d[d.length-1],a=new gameData.Unit(a,d.x,d.y,c.o),b.players[c.o].pop.current+=gameData.ELEMENTS[a.f][a.r][a.t].pop,gameCreation.addGameElement(b,a),null!=c.rp&&order.convertDestinationToOrder(b,[a.id],c.rp.x,c.rp.y),
!0):!1},removeUnit:function(b,a){0<gameData.ELEMENTS[a.f][a.r][a.t].pop&&(b.players[a.o].pop.current-=gameData.ELEMENTS[a.f][a.r][a.t].pop);null!=a.murderer&&(stats.updateField(b,a.murderer,"killed",1),stats.updateField(b,a.o,"lost",1))},canBuyIt:function(b,a,c){for(var d in c.needs){var e=c.needs[d];if(e.value>b[a].re[e.t])return!1}return!0},paysForElement:function(b,a,c){for(var d in c.needs){var e=c.needs[d];b.players[a].re[e.t]-=e.value}},sellsElement:function(b,a,c){for(var d in c.needs){var e=
c.needs[d];b.players[a].re[e.t]+=parseInt(e.value/2)}},getWhatCanBeBought:function(b,a,c){var d=[],e;for(e in c){var f=c[e];f.isEnabled=this.canBuyIt(b,a,f);d.push(f)}return d}};var rank={isEnemy:function(b,a,c){return b[a].ra[c.o]==gameData.RANKS.enemy?!0:!1},canBeAttacked:function(b,a,c){return b[a].ra[c.o]==gameData.RANKS.enemy||b[a].ra[c.o]==gameData.RANKS.neutral?!0:!1},isAlly:function(b,a,c){return b[a].ra[c.o]==gameData.RANKS.me||b[a].ra[c.o]==gameData.RANKS.ally?!0:!1}};var stats={UPDATE_FREQUENCY:100,init:function(b){for(var a in b.players)b.stats.push({pop:[],killed:0,lost:0,buildingsDestroyed:0,unitsCreated:0,resources:0,buildersCreated:0,buildingsCreated:0})},update:function(b){if(0==b.iterate%this.UPDATE_FREQUENCY)for(var a in b.players)b.stats[a].pop.push(b.players[a].pop.current)},updateField:function(b,a,c,d){b.stats[a][c]+=d}};var tools={getPositionsDistance:function(b,a){return Math.max(Math.abs(b.x-a.x),Math.abs(b.y-a.y))},getElementsDistance:function(b,a){var c=1E4;if(null!=a){var d=gameData.ELEMENTS[a.f][a.r][a.t].shape,e;for(e in d)for(var f in d[e]){var g=this.getPositionsDistance(b.p,this.getPartPosition(a,e,f));g<c&&(c=g);if(1==c)return c}}return c},getClosestPart:function(b,a){var c=1E4,d,e=gameData.ELEMENTS[a.f][a.r][a.t].shape,f;for(f in e)for(var g in e[f]){var h=this.getPositionsDistance(b.p,this.getPartPosition(a,
f,g));h<c&&(c=h,d=this.getPartPosition(a,f,g));if(1==c)return d}return d},getPartPosition:function(b,a,c){var d=null,d=null==b.shape?gameData.ELEMENTS[b.f][b.r][b.t].shape:b.shape;return{x:parseInt(b.p.x+parseInt(a)-parseInt(d[0].length/2)),y:parseInt(b.p.y+parseInt(c)-parseInt(d.length/2))}},isElementThere:function(b,a){var c=gameData.ELEMENTS[b.f][b.r][b.t].shape,d;for(d in c)for(var e in c[d])if(0<c[d][e]){var f=this.getPartPosition(b,d,e);if(f.x==a.x&&f.y==a.y)return!0}return!1},getTilesAroundElements:function(b,
a){var c=[],d=gameData.ELEMENTS[a.f][a.r][a.t].shape,e;for(e in d)for(var f in d[e])if(0<d[e][f]){var g=this.getPartPosition(a,e,f),g=astar.neighbors(b.grid,b.grid[g.x][g.y],!0),h;for(h in g){var k=g[h];k.isWall||c.push({x:k.x,y:k.y})}}return c},getElementUnder:function(b,a,c){for(var d in b.gameElements){var e=b.gameElements[d];if(tools.isElementThere(e,{x:a,y:c}))return e}return null},getGameElementsFromIds:function(b,a){var c=[],d;for(d in b.gameElements){var e=b.gameElements[d],f;for(f in a)if(e.id==
a[f]){c.push(e);if(c.length==a.length)return c;break}}return c},addUniqueElementToArray:function(b,a){-1==b.indexOf(a)&&b.push(a)},clone:function(b){var a={},c;for(c in b)b.hasOwnProperty(c)&&"a"!=c&&(a[c]=b[c]);return a}};gameData.Building=function(b,a,c,d,e){this.id=gameData.createUniqueId();this.f=gameData.FAMILIES.building;this.t=b.t;this.o=d;this.r=b.r;this.p={x:a,y:c};this.cp=e?100:0;this.rp=null;this.q=[];this.qp=0;this.l=b.l};gameData.Game=function(){this.stats=[];this.players=[];this.gameElements=[];this.modified=[];this.added=[];this.removed=[];this.newBuildings=[];this.orders=[];this.chat=[];this.grid=[];this.iterate=-1;this.update=function(){this.iterate=100<this.iterate?0:this.iterate+1;return gameLogic.update(this)}};gameData.Map=function(b,a,c,d){this.t=b;this.size=a;this.ve=c;this.ir=d};gameData.Player=function(b,a,c){this.pid=b;this.o=a;this.r=c;this.n="";this.re=[];this.ra=[];this.s=gameData.PLAYER_STATUSES.ig;this.tec=[];this.pop={max:0,current:0};for(var d in gameData.BASECAMPS[this.r].buildings)b=gameData.BASECAMPS[this.r].buildings[d],0<b.pop&&(this.pop.max+=b.pop);for(d in gameData.BASECAMPS[this.r].units)b=gameData.BASECAMPS[this.r].units[d],0<b.pop&&(this.pop.current+=b.pop)};gameData.Terrain=function(b,a,c){this.id=gameData.createUniqueId();this.f=gameData.FAMILIES.terrain;this.t=b.t;this.r=0;this.p={x:a,y:c};this.ra=b.ra};gameData.Unit=function(b,a,c,d){this.id=gameData.createUniqueId();this.f=gameData.FAMILIES.unit;this.t=b.t;this.r=b.r;this.o=d;this.p={x:a,y:c};this.mt={x:null,y:null};this.a=null;this.fr=0;this.pa=this.ga=null;this.l=b.l;this.toJSON=function(){var a=null;null!=this.a&&(a=tools.clone(this.a));return{id:this.id,f:this.f,t:this.t,r:this.r,o:this.o,p:this.p,mt:this.mt,fr:this.fr,ga:this.ga,pa:this.pa,l:this.l,a:a}}};
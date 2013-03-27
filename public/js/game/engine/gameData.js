var gameData = {}

/**
*	Ids to categorize the different game elements.
*/
gameData.FAMILIES = {
	unit : 0,
	building : 1,
	terrain : 2
}

gameData.ELEMENTS = [[], [] ,[]];

/**
*	Statuses ids of units and buildings' owners.
*/
gameData.RANKS = {
	me : 0,
	ally : 1,
	neutral : 2,
	enemy : 3
}


/**
* unitId : Global variable to get a unique id for each game element.
*/
gameData.unitId = 0;


/**
*	Creates a unique id for every unit and building.
*/
gameData.createUniqueId = function () {
	this.unitId += 1;
	var m = new Date().getMilliseconds();
	return m + 'i' + this.unitId;
}

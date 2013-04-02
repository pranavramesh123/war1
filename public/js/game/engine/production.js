var production = {};


/**
*	The user has chosen where to build the structure.
*/
production.startConstruction = function (building) {
	var buildingData = gameData.ELEMENTS[building.f][building.r][building.t];
	if (this.canBuyIt(building.o, buildingData)) {
		this.paysForElement(building.o, buildingData);
		gameLogic.newBuildings.push(building);
	}
}


/**
*	A builder has done a build action on this building, its progress is updated.
*/
production.updateConstruction = function (building) {
	building.cp += 100 / gameData.ELEMENTS[building.f][building.r][building.t].timeConstruction;
	building.c = gameData.ELEMENTS[building.f][building.r][building.t].constructionColors[parseInt((gameData.ELEMENTS[building.f][building.r][building.t].constructionColors.length - 1) * building.cp / 100)];
	if(building.cp >= 100) {
		this.finishConstruction(building);
	}
	gameLogic.addUniqueElementToArray(gameLogic.modified, building);
}


/**
*	The user cancels the construction of a building.
*/
production.cancelConstruction = function (building) {
	if (building != null && building.cp < 100) {
		building.l = 0;
		this.sellsElement(building.o, gameData.ELEMENTS[building.f][building.r][building.t]);
	}
}


/**
*	A building has just been finished to construct.
*/
production.finishConstruction = function (building) {
	building.cp = 100;
	if(gameData.ELEMENTS[building.f][building.r][building.t].pop > 0) {
		gameLogic.players[building.o].pop.max += gameData.ELEMENTS[building.f][building.r][building.t].pop;
	}
}


/**
*	A building has been destroyed / cancelled
*/
production.removeBuilding = function (building) {
	if(gameData.ELEMENTS[building.f][building.r][building.t].pop > 0 && building.cp == 100) {
		gameLogic.players[building.o].pop.max -= gameData.ELEMENTS[building.f][building.r][building.t].pop;
	}
}


/**
*	A builder is gathering resources.
*/
production.gatherResources = function (builder, resource) {
	//reset resources if different from previous one
	if (builder.ga == null || builder.ga.t != gameData.ELEMENTS[resource.f][resource.r][resource.t].resourceType) {
		builder.ga = {t : gameData.ELEMENTS[resource.f][resource.r][resource.t].resourceType, amount : 0};
	}

	var amount = Math.min(gameData.ELEMENTS[builder.f][builder.r][builder.t].maxGathering - builder.ga.amount, 5, resource.ra);
	builder.ga.amount += amount;
	resource.ra -= amount;

	if (builder.ga.amount == gameData.ELEMENTS[builder.f][builder.r][builder.t].maxGathering) {
		var closestTownHall = mapLogic.getNearestBuilding(builder, gameData.ELEMENTS[gameData.FAMILIES.building][gameLogic.players[builder.o].r][0].t);
		builder.a = closestTownHall;
	} else if (resource.ra == 0) {
		AI.searchForNewResources(builder, builder, gameData.ELEMENTS[builder.pa.f][builder.pa.r][builder.pa.t].resourceType);
	}
}


/**
*	A builder is coming back to a building with some resources
*/
production.getBackResources = function (builder) {
	gameLogic.players[builder.o].re[builder.ga.t] += builder.ga.amount;
	builder.ga = null;
	if(builder.pa != null) {
		if(builder.pa.ra == 0) {
			//gather closest resource if this one is finished
			AI.searchForNewResources(builder, builder.pa, gameData.ELEMENTS[builder.pa.f][builder.pa.r][builder.pa.t].resourceType);
		} else {
			builder.a = builder.pa;
		}
	}
}


/**
*	Starts a unit construction, or a research
*/
production.buyElement = function (buildings, elementData) {
	for(var i in buildings) {
		var building = buildings[i];
		if(building.t == buildings[0].t
			&& building.cp == 100
			&& building.q.length < 5
			&& this.canBuyIt(building.o, elementData)) {
				this.paysForElement(building.o, elementData);
				building.q.push(elementData.t);
				gameLogic.addUniqueElementToArray(gameLogic.modified, building);
		}
	}

}


/**
*	Update the queue and the progression of what the building is creating.
*/
production.updateQueueProgress = function (building) {
	building.qp += 100 / (gameLoop.FREQUENCY * gameData.ELEMENTS[gameData.FAMILIES.unit][building.r][building.q[0]].timeConstruction);
	if(building.qp >= 100) {
		var canGoToNext = true;
		if(gameData.ELEMENTS[gameData.FAMILIES.unit][building.r][building.q[0]].speed > 0) {
			//unit
			canGoToNext = this.createNewUnit(building.q[0], building);	
		}


		if (canGoToNext) {
			//element is ready
			building.qp = 0;
			
			//update queue
			building.q.splice(0, 1);
		} else {
			building.qp = 100;
		}
		
	}
	gameLogic.addUniqueElementToArray(gameLogic.modified, building);
}


/**
*	The unit just pops up from the factory if there is place and population is not exceeding.
*/
production.createNewUnit = function (unitType, factory) {
	var unit = gameData.ELEMENTS[gameData.FAMILIES.unit][factory.r][unitType];
	var possiblePositions = tools.getTilesAroundElements(factory);
	var playerPopulation = gameLogic.players[factory.o].pop;
	if(possiblePositions.length > 0 && playerPopulation.current + unit.pop <= playerPopulation.max) {
		var position = possiblePositions[possiblePositions.length - 1];
		unit = new gameData.Unit(unit, position.x, position.y, factory.o);

		//updates population
		gameLogic.players[factory.o].pop.current += gameData.ELEMENTS[unit.f][unit.r][unit.t].pop;

		mapLogic.addGameElement(unit);

		//moves the unit to the rallying point
		if(factory.rp != null) {
			order.convertDestinationToOrder([unit.id], factory.rp.x, factory.rp.y);
		}

		return true;
	} else {
		return false;	
	}
}


/**
* 	A unit has just been killed / cancelled
*/
production.removeUnit = function (unit) {
	if(gameData.ELEMENTS[unit.f][unit.r][unit.t].pop > 0) {
		gameLogic.players[unit.o].pop.current -= gameData.ELEMENTS[unit.f][unit.r][unit.t].pop;
	}
}


/**
*	Check if we can afford this element.
*/
production.canBuyIt = function (owner, element) {
	for(var i in element.needs) {
		var need = element.needs[i];
		if(need.value > gameLogic.players[owner].re[need.t]) {
			return false;
		}
	}
	return true;
}


/**
*	Pays for the element.
*/
production.paysForElement = function (owner, element) {
	for(var i in element.needs) {
		var need = element.needs[i];
		gameLogic.players[owner].re[need.t] -= need.value;
	}
}


/**
*	Sells the element.
*/
production.sellsElement = function (owner, element) {
	for(var i in element.needs) {
		var need = element.needs[i];
		gameLogic.players[owner].re[need.t] += parseInt(need.value / 2);
	}
}


/**
*	Filters the list of things which can be bought depending 
*	on its needs (resources, researchs, etc...).
*/
production.getWhatCanBeBought = function (owner, elements) {
	var array = [];
	for(var key in elements) {
		var element = elements[key];
		element.isEnabled = this.canBuyIt(owner, element);
		array.push(element);
	}
	return array;
}
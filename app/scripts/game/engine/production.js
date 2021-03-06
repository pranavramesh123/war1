var production = {};


/**
*	CONSTANTS
*/
production.RESOURCE_AMOUNT_PER_GATHERING_ACTION = 1;
production.BUILDINGS_QUEUE_MAX_SIZE = 5;
production.REPAIRING_SPEED = 5;


/**
*	The user has chosen where to build this structure.
*/
production.startConstruction = function (game, building) {
	var buildingData = tools.getElementData(building);

	if (this.canBuyIt(game.players, building.o, buildingData)) {

		this.paysForElement(game, building.o, buildingData);
		game.newBuildings.push(building);

	}
}


/**
*	A builder has done a build action on this building, its progress is updated.
*/
production.updateConstruction = function (game, building) {
	var buildingData = tools.getElementData(building);

	building.cp += 100 / buildingData.timeConstruction;
	building.l += parseInt(buildingData.l / buildingData.timeConstruction);
	building.l = Math.min(buildingData.l, building.l);
	
	if(building.cp >= 100) {
		this.finishConstruction(game, building);

	}

	tools.addUniqueElementToArray(game.modified, building);

}


/**
*	The user cancels the construction of a building.
*/
production.cancelConstruction = function (game, building) {

	if (building != null && building.cp < 95) {
		var buildingData = tools.getElementData(building);
		this.sellsElement(game, building.o, buildingData);
		this.removeBuilding(game, building);
		for (var i in game.gameElements.unit) {
			if (game.gameElements.unit[i].a != null && game.gameElements.unit[i].a.id == building.id) {
				order.goToElementNextOrder(game, game.gameElements.unit[i]);
			}
		}

		game.cancelBuildings.push(building);
		delete game.gameElements.building[building.id];

	}

}


/**
*	The user cancels the construction of a unit or a research.
*/
production.cancel = function (game, building, index) {
	var family = null;
	if (building.q[index] >=0) {
		family = gameData.FAMILIES.unit;
	} else {
		family = gameData.FAMILIES.research;
		game.players[building.o].tecC.splice(game.players[building.o].tecC.indexOf(index));
	}
	this.sellsElement(game, building.o, tools.getElementDataFrom(family, building.r, building.q[index]));
	building.q.splice(index, 1);
	if (index == 0) { 
		building.qp = 0;
	}
	tools.addUniqueElementToArray(game.modified, building);
}


/**
*	A building has just been finished to construct.
*/
production.finishConstruction = function (game, building) {

	var buildingData = tools.getElementData(building);

	building.cp = 100;
	building.l = buildingData.l;

	// add tech
	game.players[building.o].tec.push(buildingData.key);

	// updates player's max population
	if(buildingData.pop > 0) {
		game.players[building.o].pop.max += buildingData.pop;
	}

	stats.updateField(game, building.o, 'buildingsCreated', 1);

}


/**
*	A builder is repairing the building.
*/
production.repairBuilding = function (game, building) {

	var playerResources = game.players[building.o].re;

	if (playerResources[gameData.RESOURCES.wood.id] > 0 && playerResources[gameData.RESOURCES.gold.id] > 0) {

		playerResources[gameData.RESOURCES.gold.id]--;
		playerResources[gameData.RESOURCES.wood.id]--;
		building.l += this.REPAIRING_SPEED;
		building.l = Math.min(building.l, tools.getElementData(building).l);

		tools.addUniqueElementToArray(game.modified, building);

	}

}


/**
*	A building has been destroyed / cancelled
*/
production.removeBuilding = function (game, building) {

	var buildingData = tools.getElementData(building);

	if(buildingData.pop > 0 && building.cp == 100) {

		game.players[building.o].pop.max -= buildingData.pop;

		// remove tech
		game.players[building.o].tec.splice(game.players[building.o].tec.indexOf(buildingData.key));

	}

	for (var i in building.q) {
		this.cancel(game, building, i);
	}

	if (building.murderer != null) {

		stats.updateField(game, building.murderer, 'buildingsDestroyed', 1);

	}
}


/**
*	A builder is gathering resources.
*/
production.gatherResources = function (game, builder, resource) {

	var resourceData = tools.getElementData(resource);
	var builderData = tools.getElementData(builder);

	// reset resources if different from previous one
	if (builder.ga == null || builder.ga.t != resourceData.resourceType) {

		builder.ga = {t : resourceData.resourceType, amount : 0};

	}

	var amount = Math.min(builderData.maxGathering - builder.ga.amount, this.RESOURCE_AMOUNT_PER_GATHERING_ACTION, resource.ra);
	builder.ga.amount += amount;
	resource.ra -= amount;

	tools.addUniqueElementToArray(game.modified, resource);

	if (builder.ga.amount == builderData.maxGathering) {

		// the builder is full of resources, get resources back
		var closestTownHall = tools.getNearestStuff(game, builder, gameData.FAMILIES.building, gameData.ELEMENTS[gameData.FAMILIES.building][builder.r].hq.t, gameData.RANKS.me, true);
		if (closestTownHall != null) {// Yes, it happens...
 			builder.a = new gameData.Order(action.ACTION_TYPES.gather, null, closestTownHall.id, resourceData.resourceType);
			builder.pa = [new gameData.Order(action.ACTION_TYPES.gather, null, resource.id, resourceData.resourceType)];
		}
		else {
			builder.a = null;
			builder.pa = [];
		}	
	}

	if (resource.ra <= 0) {

		// remove resource
		gameCreation.removeGameElement(game, resource);
		delete game.gameElements.land[resource.id];

		// the resource is now empty, searching a new resource of the same type
		AI.searchForNewResources(game, builder, resourceData.resourceType);

	}

}


/**
*	A builder is coming back to a building with some resources.
*/
production.getBackResources = function (game, builder) {

	var resourceType = builder.ga.t;

	game.players[builder.o].re[builder.ga.t] += builder.ga.amount;
	stats.updateField(game, builder.o, 'resources', builder.ga.amount);
	builder.ga = null;

	if(builder.pa.length > 0 && builder.pa[0].type == action.ACTION_TYPES.gather) {

		var resource = tools.getElementById(game, builder.pa[0].id);

		if(resource == null || resource.ra <= 0) {

			// gather closest resource if this one is finished
			AI.searchForNewResources(game, builder, resourceType);

		} else {

			// go back to resource
			builder.a = builder.pa[0];

		}
	}

	builder.pa = [];

}


/**
*	Starts a unit construction, or a research.
*/
production.buyElement = function (game, buildings, elementData) {
	for(var i in buildings) {
		var building = buildings[i];
		if(building.t == buildings[0].t
			&& building.cp == 100
			&& building.q.length < this.BUILDINGS_QUEUE_MAX_SIZE
			&& this.canBuyIt(game.players, building.o, elementData)) {
				this.paysForElement(game, building.o, elementData);
				building.q.push(elementData.t);
				tools.addUniqueElementToArray(game.modified, building);
				if (elementData.t >= 0) {
					// unit
				} else {
					// research
					game.players[building.o].tecC.push(elementData.t);
					return;
				}
		}
	}

}


/**
*	Update the queue and the progression of what the building is creating.
*/
production.updateQueueProgress = function (game, building) {
	var elementData;
	if (building.q[0] >= 0) {
		// unit
		elementData = tools.getElementDataFrom(gameData.FAMILIES.unit, building.r, building.q[0]);
	} else {
		// research
		elementData = tools.getElementDataFrom(gameData.FAMILIES.research, building.r, building.q[0]);
	}
	building.qp += Math.max(1, parseInt(100 / (gameLogic.FREQUENCY * elementData.timeConstruction)));
	if(building.qp >= 100) {
		var canGoToNext = true;
		if (building.q[0] >= 0) {
			// check if the unit can be released
			canGoToNext = this.createNewUnit(game, building.q[0], building);	
		} else {
			// add research to player
			canGoToNext = true;
			game.players[building.o].tec.push(building.q[0]);
			game.players[building.o].tecC.splice(game.players[building.o].tecC.indexOf(building.q[0]));
		}

		if (canGoToNext) {
			//element is ready, go to next one
			building.qp = 0;
			building.q.splice(0, 1);
		} else {
			//element cannot be released, wait until it can
			building.qp = 99;
		}
		
	}
	tools.addUniqueElementToArray(game.modified, building);
}


/**
*	The unit just pops up from the factory if there is place and population is not exceeding.
*/
production.createNewUnit = function (game, unitType, factory) {
	var unitData = tools.getElementDataFrom(gameData.FAMILIES.unit, factory.r, unitType);
	var possiblePositions = tools.getFreeTilesAroundElements(game, factory);
	var playerPopulation = game.players[factory.o].pop;
	if(possiblePositions.length > 0 && playerPopulation.current + unitData.pop <= playerPopulation.max) {
		
		if (unitData.isBuilder) {
			stats.updateField(game, factory.o, 'buildersCreated', 1);
		} else {
			stats.updateField(game, factory.o, 'unitsCreated', 1);
		}

		var position = possiblePositions[possiblePositions.length - 1];
		var unit = new gameData.Unit(unitData, position.x, position.y, factory.o);

		//updates population
		game.players[factory.o].pop.current += unitData.pop;

		gameCreation.addGameElement(game, unit);

		//moves the unit to the rallying point
		if(factory.rp != null) {
			order.convertDestinationToOrder(game, [unit.id], factory.rp.x, factory.rp.y);
		}

		return true;
	}

	return false;
}


/**
* 	A unit has just been killed / cancelled
*/
production.removeUnit = function (game, unit) {
	var elementData = tools.getElementData(unit);
	if(elementData.pop > 0) {
		game.players[unit.o].pop.current -= elementData.pop;
	}

	if (unit.murderer != null) {
		stats.updateField(game, unit.murderer, 'killed', 1);
		stats.updateField(game, unit.o, 'lost', 1);
	}
}


/**
*	Check if we can afford this element.
*/
production.canBuyIt = function (players, owner, element) {
	for(var i in element.needs) {
		var need = element.needs[i];
		if(need.t >= 0) {
			// resources
			if (need.value > players[owner].re[need.t]) {
				return false;
			}
		} else {
			// buildings / researchs
			if (players[owner].tec.indexOf(need.t) == -1) {
				return false;
			}
		}
	}
	return true;
}


/**
*	Pays for the element.
*/
production.paysForElement = function (game, owner, element) {
	for(var i in element.needs) {
		var need = element.needs[i];
		if (need.t >= 0) {
			game.players[owner].re[need.t] -= need.value;
		}
	}
}


/**
*	Sells the element.
*/
production.sellsElement = function (game, owner, element) {
	if (element != null) {
		for(var i in element.needs) {
			var need = element.needs[i];
			if (need.t >= 0) {
				game.players[owner].re[need.t] += parseInt(need.value / 2);
			}
		}
	}
}


/**
*	Filters the list of things which can be bought depending 
*	on its needs (resources, researchs, etc...).
*/
production.getWhatCanBeBought = function (players, owner, elements) {
	var array = [];
	for(var key in elements) {
		var element = elements[key];

		// remove already done researches
		if (element.t >= 0 || players[owner].tec.indexOf(element.t) == -1 && players[owner].tecC.indexOf(element.t) == -1) {
			element.isEnabled = this.canBuyIt(players, owner, element);
			element.id = '' + element.f + element.r + element.t;
			array.push(element);
		}
	}

	// add back button
	if (elements.house != null) {
		array.splice(0, 0, gameData.BUTTONS.back);
	}

	return array;
}

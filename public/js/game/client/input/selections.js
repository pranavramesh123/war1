/**
*		CONSTANTS
*/
userInput.SELECTION_RECTANGLE_THRESHOLD = 8; //in pixels


/**
*	The user is clicking on the screen to select / unselect some elements.
* 	@param (x, y) : coordinates of the click
*/
userInput.clickToSelect = function (x, y) {
	//click on minimap
	if (x > window.innerWidth - 85 && y > window.innerHeight - 85) {
		return;
	}

	this.leaveConstructionMode();

	//reset selected array
	gameSurface.unselectAll();
	gameContent.selected = [];

	//reset the selection rectangle
	gameContent.selectionRectangle = [];

	var intersect = gameSurface.getFirstIntersectObject(x, y);
	if (intersect != null) {

		if (intersect.object.elementId != null) {
			gameContent.selected.push(intersect.object.elementId);
			gameSurface.selectElement(intersect.object.elementId);
		}

		gameContent.selectionRectangle[0] = parseInt(intersect.point.x / gameSurface.PIXEL_BY_NODE);
		gameContent.selectionRectangle[1] = parseInt(intersect.point.y / gameSurface.PIXEL_BY_NODE);
		gameSurface.updateSelectionRectangle(-1, -1, -1, -1);
	}

}


/**
* 	The user is drawing a selection rectangle to select some elements.
* 	@param (x, y) : current coordinates of the mouse
*/
userInput.selectGroup = function (x, y) {
	if(gameContent.selectionRectangle.length > 0 
		&& Math.abs(x - gameContent.selectionRectangle[0]) > this.SELECTION_RECTANGLE_THRESHOLD
		&& Math.abs(y - gameContent.selectionRectangle[1]) > this.SELECTION_RECTANGLE_THRESHOLD) {

			//unselect the previous selected elements
			gameSurface.unselectAll();
			gameContent.selected = [];

			var unitSelected = false;

			var position = gameSurface.getAbsolutePositionFromPixel(x, y);
			if (position.x < 0 || position.y < 0) {
				return;
			}

			//get the last coordinates of the selection rectangle
			gameContent.selectionRectangle[2] = position.x;
			gameContent.selectionRectangle[3] = position.y;
			gameSurface.updateSelectionRectangle(gameContent.selectionRectangle[0], gameContent.selectionRectangle[1], gameContent.selectionRectangle[2], gameContent.selectionRectangle[3]);

			for(var i in gameContent.gameElements) {
				var element = gameContent.gameElements[i].s;
	  			if(rank.isAlly(gameContent.players, gameContent.myArmy, element)
	  				&& element.f != gameData.FAMILIES.terrain
	  				&& (gameContent.selectionRectangle[0] - gameContent.selectionRectangle[2] < 0 
			  		&& element.p.x <= gameContent.selectionRectangle[2]
			  		&& element.p.x >= gameContent.selectionRectangle[0]
			  		|| element.p.x >= gameContent.selectionRectangle[2]
			  		&& element.p.x <= gameContent.selectionRectangle[0])
			  		&& (gameContent.selectionRectangle[1] - gameContent.selectionRectangle[3] < 0 
			  		&& element.p.y <= gameContent.selectionRectangle[3]
			  		&& element.p.y >= gameContent.selectionRectangle[1]
			  		|| element.p.y >= gameContent.selectionRectangle[3]
			  		&& element.p.y <= gameContent.selectionRectangle[1])) {
				  		gameContent.selected.push(element.id);
			  	  		gameSurface.selectElement(element.id);
				  		if(element.f == gameData.FAMILIES.unit) {
				  			unitSelected = true;
				  		}
			  	}
			}

			//unselect the buildings if one or more units are selected
			if(unitSelected) {
				var len = gameContent.selected.length;
				while(len--) {
					var element = gameContent.gameElements[gameContent.selected[len]].s;
					if(element.f == gameData.FAMILIES.building) {
						gameContent.selected.splice(len, 1);
				  		gameSurface.unselectElement(element.id);
					}
				}
			}

		}
}


/**
*	Removes the selection rectangle.
*/
userInput.removeSelectionRectangle = function () {
	gameContent.selectionRectangle = [];
	gameSurface.updateSelectionRectangle(-1, -1, -1, -1);
}


/**
*	Selects all similar ally units.
*/
userInput.doubleClickToSelect = function (x, y) {
	if(gameContent.selected.length > 0 && rank.isAlly(gameContent.players, gameContent.myArmy, gameContent.gameElements[gameContent.selected[0]].s)) {
		var selected = gameContent.gameElements[gameContent.selected[0]].s;
		for(var i in gameContent.gameElements) {
			var element = gameContent.gameElements[i].s;
		  	if(element.f == selected.f && rank.isAlly(gameContent.players, gameContent.myArmy, element)
		  		&& element.t == selected.t) {
		  		//select the clicked element
		  		gameContent.selected.push(element.id);
	  	  		gameSurface.selectElement(element.id);
		  	}
		}
	}
}
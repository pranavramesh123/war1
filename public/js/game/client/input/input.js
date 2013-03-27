var input = {};


/**
*	Initializes the different inputs methods.
*/
input.initInputs = function () {
	this.initMouse();
	this.initKeyboard();
}


/**
*	Stores the mouse position.
*/	
input.mousePosition = {
	x : 0,
	y : 0
}


/**
*	Binds the different mouse inputs needed to the events
*/
input.initMouse = function () {

	document.onmousedown = function (event) {
	  return input.onLeftClick(event);
	}

	document.oncontextmenu = function (event) {
	  return input.onRightClick(event);
	}

	document.onmousemove = function (event) {
		return input.onMouseMove(event); 
	}

	document.onmouseup = function (event) {
	  return input.onMouseUp(event);
	}

	document.onmousewheel = function (event) {
	  return input.onMouseWheel(event);
	}

	document.ondblclick = function (event) {
		return input.onDoubleClick(event);
	}

}


/**
*	Stores the list of shortcuts keys.
*/
input.TOOLBAR_KEYBOARD_SHORTCUTS = [81, 87, 69, 82, 65, 83, 68, 70];


/**
*	Binds the different keyboard inputs needed to the events
*/
input.initKeyboard = function () {
	
	document.onkeydown = function (event) {
  		return input.onKeyDown(event);
	}

	document.onkeyup = function (event) {
	  	return input.onKeyUp(event);
	}

}

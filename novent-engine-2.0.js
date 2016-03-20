/**
* Novent Reading Engine based on CreateJS
* @author: Shanira
*/

if(typeof NoventEngine == "undefined") {
	var NoventEngine = new Object();
	
	/**
	 * Novent Class definition, root element containing the novent pages, materials & events
	 * @constructor
	 * @param {string} canvasId Id of the canvas DOM object to use.
	 * @param {number} width Width of the Novent.
	 * @param {number} height Height of the Novent.
	 * @param {object} buttonDescriptor Object describing the button to use in the novent.
	 */
	NoventEngine.Novent = function(canvasId, width, height, buttonDescriptor) {
		var novent = this;
		
		//Setting constructor params:
		novent.canvas = document.getElementById(canvasId);
		novent.width = novent.canvas.width = width;
		novent.height = novent.canvas.height = height;
		
		window.onresize = function() {
			resize(novent.canvas);
		}
		resize(novent.canvas);
		
		novent.button = new NoventEngine.Button(novent, buttonDescriptor);
		novent.buttonVisible = false;
		
		novent.showButton = function() {
			createjs.Tween.get(novent.button.graphics).to({alpha: 1}, 2000).call(function() {
				novent.buttonVisible = true;
			});
		}
		
		novent.hideButton = function() {
			createjs.Tween.get(novent.button.graphics).to({alpha: 0}, 2000).call(function() {
				novent.buttonVisible = false;
			});;
		}
		
		//Creating stage : root level container for the novent:
		novent.stage = new createjs.Stage(novent.canvas);
		var loadQueue = new createjs.LoadQueue(true);
		
		novent.button.addToLoadQueue(loadQueue);		
		loadQueue.load();
		
		loadQueue.on("complete", function() {
			novent.button.appendToNovent();

			novent.button.graphics.addEventListener("click", function() {
				if(novent.pages[novent.index - 1].waiting && novent.buttonVisible) {
					novent.pages[novent.index - 1].readEvent();
					novent.hideButton();
				}
			});
		});
		
		novent.index = 0;
		novent.pages = new Array();
		novent.addPage = function(pageDescriptor) {
			novent.pages.push(new NoventEngine.Page(novent, pageDescriptor));
			return novent.pages[novent.pages.length - 1];
		}
		
		novent.nextPage = function() {
			if(novent.index != novent.pages.length - 1)
				return novent.pages[novent.index + 1];
		}
		
		novent.previousPage = function() {
			if(novent.index != 0)
				return novent.pages[novent.index - 1];
		}
		
		novent.read = function(index) {
			if(index != undefined && index < novent.pages.length)
				novent.index = index;
			
			
			var queue = new createjs.LoadQueue();
			novent.pages[novent.index].addToLoadQueue(queue);
			
			queue.on("complete", function() {
				console.log("complete")
				novent.readPage();
			});
			
			queue.load();
		}
		
		novent.readPage = function() {
			if(novent.index != novent.pages.length) {
				novent.pages[novent.index].read();
				novent.index++;
			}
		}
		
		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener("tick", novent.stage);
		
		return novent;
	}
	
	
	NoventEngine.Button = function(novent, buttonDescriptor) {
		var button = this;
		
		button.novent = novent;
		button.id = "button";
		button.src = buttonDescriptor.src;
		
		//button.animation = (typeof _animation === 'undefined') ? false : _animation;
		
		button.addToLoadQueue = function(queue) {
			//Adding src to novent global load queue
			queue.loadFile({id:button.id, src: button.src});
			
			//When this file has finished loading : retreiving DOM element and creating graphic element
			queue.on("fileload", function(event) {
				if(event.item.id == button.id) {
					button.element = event.result;
					button.graphics = new createjs.Bitmap(event.result);
					
					//Setting the properties of the graphical object (x, y, ...)
					for(key in buttonDescriptor) {
						if(key != undefined)
							button.graphics[key] = buttonDescriptor[key];
					}
					
					button.graphics.alpha = 0;
				}
			});
		}
		
		//Adding button to the novent canvas
		button.appendToNovent = function() {
			if(button.graphics != undefined)
				button.novent.stage.addChild(button.graphics);
		}
		
		return button;
	}
	
	NoventEngine.Page = function(novent, pageDescriptor) {
		var page = this;
		
		page.novent = novent;
		page.name = pageDescriptor.name;
		
		page.events = new Array();
		page.addEvent = function(funct) {
			page.events.push(new NoventEngine.Event(page, funct));
			return page.events[page.events.length - 1];
		}
		
		page.container = new createjs.Container();
		
		page.materials = new Map();
		
		page.get = function(targetName) {
			console.log(targetName);
			console.log(page.materials.get(targetName));
			console.log(page.materials.get(targetName).graphics);
			return createjs.Tween.get(page.materials.get(targetName).graphics)
		}
		
		pageDescriptor.materials.images.forEach(function(e) {
			page.materials.set(e.name, new NoventEngine.Image(page, e))
		});
		
		pageDescriptor.materials.animations.forEach(function(e) {
			page.materials.set(e.name, new NoventEngine.Animation(page, e))
		});
		
		pageDescriptor.materials.videos.forEach(function(e) {
			page.materials.set(e.name, new NoventEngine.Video(page, e))
		});
		
		pageDescriptor.materials.sounds.forEach(function(e) {
			page.materials.set(e.name, new NoventEngine.Sound(page, e))
		});
		
		pageDescriptor.materials.texts.forEach(function(e) {
			page.materials.set(e.name, new NoventEngine.Text(page, e))
		});
		
		page.addToLoadQueue = function(queue) {
			console.log("page:addToLoadQueue")
			for(var m of page.materials.values()) {
				console.log("load")
				m.addToLoadQueue(queue);
			}
		}
		
		page.appendToNovent = function() {
			page.novent.stage.addChild(page.container);
		}
		
		page.removeFromNovent = function() {
			page.novent.stage.removeChild(page.container);
		}
		
		page.waiting = false;
		page.index = 0;
		page.events = new Array();
		page.addEvent = function(funct) {
			page.events.push(new NoventEngine.Event(page, funct));
			return page.events[page.events.length - 1];
		}
		
		page.nextEvent = function() {
			if(page.index != page.events.length - 1) {
				return page.events[page.index + 1];
			}
		}
		
		page.previousEvent = function() {
			if(page.index != 0) {
				return page.events[page.index - 1];
			}
		}
		
		page.read = function() {
			var queue = new createjs.LoadQueue();
			var nextPage = page.novent.nextPage();
			if(nextPage) {
				nextPage.addToLoadQueue(queue);
				queue.load();
			}
			
			page.appendToNovent();
			page.readEvent();
		}
		
		page.readEvent = function() {
			if(page.index != page.events.length) {
				page.events[page.index].read();
				page.index++;
			}
			else {
				page.novent.readPage();
			}
		}
		
		return page;
	}
	
	NoventEngine.Event = function(page, funct) {
		var event = this;
		
		event.page = page;
		event.funct = funct;
		
		event.read = function() {
			event.funct(page, function() {
				if(page.index != page.events.length) {
					event.page.waiting = true;
					event.page.novent.showButton();
				}
				else {
					event.page.novent.readPage();
				}
			});
		}
		
		return event;
	}
	
	NoventEngine.Image = function(page, imageDescriptor) {
		var image = this;
		
		image.page = page;
		image.name = imageDescriptor.name;
		image.id = page.name + ":" + image.name;
		image.src = imageDescriptor.src;
		
		image.addToLoadQueue = function(queue) {
			console.log("image.load")
			//Adding src to novent global load queue
			queue.loadFile({id:image.id, src: image.src});
			
			//When this file has finished loading : retreiving DOM element and creating graphic element
			queue.on("fileload", function(event) {
				console.log("fileload");
				if(event.item.id == image.id) {
					image.element = event.result;
					image.graphics = new createjs.Bitmap(event.result);
					
					//Setting the properties of the graphical object (x, y, ...)
					for(key in imageDescriptor) {
						if(key != undefined)
							image.graphics[key] = imageDescriptor[key];
					}
					
					//Adding image to the page container
					image.page.container.addChild(image.graphics);
				}
			});
		}
		
		return image;
	}
	
	NoventEngine.Video = function(page, videoDescriptor) {
		var video = this;
		
		video.page = page;
		video.name = videoDescriptor.name;
		video.id = page.name + ":" + video.name;
		video.src = videoDescriptor.src;
		
		video.addToLoadQueue = function(queue) {
			//Adding src to novent global load queue
			queue.loadFile({id:video.id, src: video.src});
			
			//When this file has finished loading : retreiving DOM element and creating graphic element
			queue.on("fileload", function(event) {
				if(event.item.id == video.id) {
					video.element = event.result;
					video.graphics = new createjs.Bitmap(event.result);
					
					//Setting the properties of the graphical object (x, y, ...)
					for(key in videoDescriptor) {
						if(key != undefined)
							video.graphics[key] = videoDescriptor[key];
					}
					
					video.page.container.addChild(video.graphics);
				}
			});
		}
		
		video.play = function(type, callback) {
			video.element.addEventListener('ended', function () {
				if(type == "loop") {
					
					this.currentTime = 0;
					this.play();
					console.log("readyState:" + video.graphics.image.readyState)
					video.graphics.image.readyState = 4;
				}
				else if(type == "remove") {
					video.page.container.removeChild(video.graphics);
					if(callback != undefined)
						callback();
				}
				else if(type == "stop") {
					if(callback != undefined)
						callback();
				}
			}, false);
			video.element.play();
		}
		
		return video;
	}
	
	NoventEngine.Animation = function(page, animationDescriptor) {
		var animation = this;
		
		animation.page = page;
		animation.name = animationDescriptor.name;
		animation.id = page.name + ":" + animation.name;
		animation.src = animationDescriptor.src;
		animation.height = animationDescriptor.height;
		animation.width = animationDescriptor.width;
		animation.framerate = animationDescriptor.framerate;
		animation.frames = animationDescriptor.frames;
		
		animation.addToLoadQueue = function(queue) {
			//Adding src to novent global load queue
			queue.loadFile({id:animation.id, src: animation.src});
			
			queue.on("fileload", function(event) {
				if(event.item.id == animation.id) {
					animation.element = event.result;
					animation.spriteSheet = new createjs.SpriteSheet({
						framerate: animation.framerate,
						images: [animation.element],
						frames: {width: animation.width, height: animation.height},
						animations: {
							animation: [0, animation.frames - 1]
						}
					});
					
					animation.graphics = new createjs.Sprite(animation.spriteSheet);
					
					//Setting the properties of the graphical object (x, y, ...)
					for(key in animationDescriptor) {
						if(key != undefined)
							animation.graphics[key] = animationDescriptor[key];
					}
					
					animation.page.container.addChild(animation.graphics);
				}
			});
		}
		
		animation.play = function(type, callback) {
			animation.graphics.addEventListener('animationend', function () {
				if(type == "remove") {
					animation.graphics.stop();
					animation.page.container.removeChild(animation.graphics);
					if(callback != undefined)
						callback();
				}
				else if(type == "stop") {
					animation.graphics.stop();
					if(callback != undefined)
						callback();
				}
			});
			animation.graphics.gotoAndPlay("animation");
		}
		
		return animation;
	}
	
	NoventEngine.Text = function(page, textDescriptor) {
		var text = this;
		
		text.page = page;
		text.name = textDescriptor.name;
		text.id = page.name + ":" + text.name;
		text.content = textDescriptor.content;
		text.align = textDescriptor.align;
		text.font = textDescriptor.size + " " + textDescriptor.font;
		text.lineHeight = textDescriptor.lineHeight;
		text.width = textDescriptor.width;
		text.color = textDescriptor.color;
		
		text.addToLoadQueue = function(queue) {
			console.log("text")
			text.graphics = new createjs.Container();
			
			if(text.align != "justify") {
				var textGraphic = new createjs.Text(text.content, text.font, text.color);
				textGraphic.lineHeight = text.lineHeight;
				textGraphic.lineWidth = text.width;
				textGraphic.textAlign = text.align;
				
				text.graphics.addChild(textGraphic);
			}
			else {
				console.log("jystify")
				text.graphics = justifyText(text.graphics, text.content, text.font, text.lineHeight, text.width, text.color);
			}
			
			//Setting the properties of the graphical object (x, y, ...)
			for(key in textDescriptor) {
				if(key != undefined)
					text.graphics[key] = textDescriptor[key];
			}
			console.log(text.graphics);
			text.page.container.addChild(text.graphics);
		}
		
		return text;
	}
	
	NoventEngine.Sound = function(page, soundDescriptor) {
		var sound = this;
		return sound;
	}
	
	NoventEngine.NoventDefinitionError = function(message) {
		this.name = "NoventDefinitionError";
		this.message = message;
	}
	
	function resize(canvasElement) {
		canvasElement.style.position = "fixed";
		canvasElement.style.top = 0;
		canvasElement.style.left = 0;
		canvasElement.style.bottom = 0;
		canvasElement.style.right = 0;
		canvasElement.style.margin = "auto";
		
		var width = window.innerWidth;
        var height = window.innerHeight;
		
		var screenRatio = height/width;
		var canvasRatio = canvasElement.height/canvasElement.width;
		
		if(screenRatio <= canvasRatio) {
			width = height / canvasRatio;
		} else {
			height = width * canvasRatio;
		}
		
		canvasElement.style.width = width + "px";
		canvasElement.style.height = height + "px";
	}
	
	function justifyText(container, content, font, lineHeight, width, color) {
		var words = content.split(' ');
		console.log(words)
		console.log(width);
		var line = '';
		var x = 0;
		var y = 0;
			
		for(var n = 0; n < words.length; n++) {
			console.log(line);
			var testLine;
			if(n == 0) {
				testLine = words[0];
			}
			else {
				testLine = line + ' ' + words[n];
			}
			
			var testTextContainer = new createjs.Text(testLine, font, color);
			var testWidth = testTextContainer.getMeasuredWidth();
			console.log("mesure: " + testTextContainer.getMeasuredLineHeight())
			
			
			console.log(testWidth > width);
			if (testWidth > width && n > 0) {
				container = justifyLine(container, line, font, color, width, x, y);
				
				line = words[n];
				if(lineHeight)
					y += lineHeight;
				else
					y += testTextContainer.getMeasuredLineHeight();
			}
			else {
				line = testLine;
			}
		}
		
		if(line != '') {
			var lastLine = new createjs.Text(line, font, color);
			lastLine.x = x;
			lastLine.y = y;
			
			container.addChild(lastLine);
		}
		
		return container;
	}
	
	function justifyLine(container, line, font, color, width, x, y) {
		var words = line.split(' ');
		var lineWithoutSpace = new createjs.Text(line.replace(/ /g, ""), font, color);
		
		var spaceWidth = (width - lineWithoutSpace.getMeasuredWidth())/(words.length - 1);
		var lineX = x;
		
		for(var n = 0; n < words.length; n++) {
			var word = new createjs.Text(words[n], font, color);
			word.x = lineX;
			word.y = y;
			
			container.addChild(word);
			lineX = lineX + word.getMeasuredWidth() + spaceWidth;
		}
		
		return container;
	}
}
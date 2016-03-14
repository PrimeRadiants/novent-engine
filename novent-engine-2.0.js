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
		novent.button = new NoventEngine.Button(novent, buttonDescriptor);
		
		//Creating stage : root level container for the novent:
		novent.stage = new createjs.Stage(novent.canvas);
		novent.loadQueue = new createjs.LoadQueue(true);
		
		novent.button.addToLoadQueue();
		
		p = new NoventEngine.Page(novent, {name:"test"});
		v = new NoventEngine.Video(p, {src: "videos/AB.mp4"});
		p.materials.videos.set(v.id, v);
		p.addToLoadQueue();
		
		novent.loadQueue.load();
		
		novent.loadQueue.on("complete", function() {
			novent.button.appendToNovent();
			p.appendToNovent();
			v.play("loop");
			console.log(v.element);
			
			console.log(v.graphics.isVisible.toString());
			createjs.Tween.get(novent.button.graphics).wait(1000).to({alpha: 1}, 2000);
		});
		
		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener("tick", novent.stage);
		
		createjs.Ticker.addEventListener("tick",function() {
			console.log(v.graphics.image.readyState);
			v.graphics.image.readyState = 4;
		});
		
		return novent;
	}
	
	
	NoventEngine.Button = function(novent, buttonDescriptor) {
		var button = this;
		
		button.novent = novent;
		button.id = "button";
		button.src = buttonDescriptor.src;
		
		//button.animation = (typeof _animation === 'undefined') ? false : _animation;
		
		button.addToLoadQueue = function() {
			//Adding src to novent global load queue
			button.novent.loadQueue.loadFile({id:button.id, src: button.src});
			
			//When this file has finished loading : retreiving DOM element and creating graphic element
			button.novent.loadQueue.on("fileload", function(event) {
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
		page.addEvent = function(event) {
			
		}
		
		page.container = new createjs.Container();
		
		page.materials = new Object();
		page.materials.images = new Map();
		page.materials.videos = new Map();
		page.materials.animations = new Map();
		page.materials.texts = new Map();
		page.materials.sounds = new Map();
		
		page.materials.get = function(target) {
			return createjs.Tween.get(target.graphics)
		}
		
		page.addToLoadQueue = function() {
			for(var image of page.materials.images.values())
				image.addToLoadQueue();
			
			for(var video of page.materials.videos.values())
				video.addToLoadQueue();
			
			for(var animation of page.materials.animations.values())
				animation.addToLoadQueue();
			
			for(var text of page.materials.texts.values())
				text.addToLoadQueue();
			
			for(var image of page.materials.sounds.values())
				sound.addToLoadQueue();
		}
		
		page.appendToNovent = function() {
			page.novent.stage.addChild(page.container);
		}
		
		page.removeFromNovent = function() {
			page.novent.stage.removeChild(page.container);
		}
		
		return page;
	}
	
	NoventEngine.Event = function() {
		var event = this;
		return event;
	}
	
	NoventEngine.Image = function(page, imageDescriptor) {
		var image = this;
		
		image.page = page;
		image.name = imageDescriptor.name;
		image.id = page.name + ":" + image.name;
		image.src = imageDescriptor.src;
		
		image.addToLoadQueue = function() {
			//Adding src to novent global load queue
			image.novent.loadQueue.loadFile({id:image.id, src: image.src});
			
			//When this file has finished loading : retreiving DOM element and creating graphic element
			image.novent.loadQueue.on("fileload", function(event) {
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
		
		video.addToLoadQueue = function() {
			//Adding src to novent global load queue
			video.page.novent.loadQueue.loadFile({id:video.id, src: video.src});
			
			//When this file has finished loading : retreiving DOM element and creating graphic element
			video.page.novent.loadQueue.on("fileload", function(event) {
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
		
		//video.play = function(type, callback) {
			//console.log(type === "loop");
			//if(video.element != undefined) {
				//if(type === "loop") {
					//video.element.loop = true;
				/*}
				else if(type === "remove") {
					video.element.addEventListener('ended', function () {
						video.page.container.removeChild(video.graphics);
						if(callback != undefined)
							callback();
					});
				}
				else if(type === "stop") {
					if(callback != undefined) {
						video.element.addEventListener('ended', function () {
							callback();
						});
					}
				}*/
				
				//video.element.play();
			//}
		//}
		
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
		return animation;
	}
	
	NoventEngine.Text = function(page, textDescriptor) {
		var text = this;
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
}
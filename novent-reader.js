/* Dependency: canvasengine.js */

if(typeof NoventEngine == "undefined") {
	var NoventEngine = {
		
		Novent: function(canvasId, buttonObj) {
			var novent = this;
			
			novent.canvas = CE.defines(canvasId).extend(Animation);
			novent.button = buttonObj;
			
			novent.Pages = new Object();
			novent.Pages.list = new Array();
			novent.Pages.get = function(index) {return novent.Pages.list[index]};
			novent.Pages.New = function(pageObj) {
				novent.Pages.list.push(new NoventEngine.Page(novent, pageObj));
				return novent.Pages.get(novent.Pages.list.length - 1);
			}
			novent.Pages.read = function(index) {
				novent.canvas.Scene.call(novent.Pages.get(index).name);
			}
			novent.Pages.index = 0;
			
			novent.start = function() {
				novent.canvas.ready(function() { 
					novent.Pages.read(novent.Pages.index);
				});
			}
			
			return novent;
		},
		
		Page: function(novent, pageObj) {
			var page = this;
			
			page.novent = novent;
			page.name = pageObj.name;
			
			page.Events = new Object();
			page.Events.list = new Array();
			page.Events.get = function(index) {return page.Events.list[index]};
			page.Events.New = function(funct) {
				page.Events.list.push(new NoventEngine.Event(page, funct));
				return page.Events.get(page.Events.list.length - 1);
			}
			page.Events.index = -1;
			
			function playEvent(canvas, readyObj) {
				if(page.Events.index < page.Events.list.length - 1) {
					canvas.Timeline.new(readyObj.button).to({opacity: 0}, 60, Ease.easeInQuad).call();
					
					page.Events.index++;
					if(page.Events.index != page.Events.list.length - 1) {
						page.Events.get(page.Events.index).play(canvas, readyObj, function() {
							canvas.Timeline.new(readyObj.button).to({opacity: 1}, 60, Ease.easeInQuad).call();
						});
					}
					else {
						page.Events.get(page.Events.index).play(canvas, readyObj, function() {
							if(page.novent.Pages.index < page.novent.Pages.list.length - 1) {
								page.novent.Pages.index++
								page.novent.Pages.read(page.novent.Pages.index);
							}
						});
					}
				}
			};
			
			var sceneImages = new Object();
			var sceneSounds = new Object();
			var sceneVideos = new Object();
			
			if(pageObj.materials.images != undefined) {
				Object.keys(pageObj.materials.images).forEach(function(e) {
					sceneImages[e] = pageObj.materials.images[e].src;
				});
			}
			
			if(pageObj.materials.sounds != undefined) {
				Object.keys(pageObj.materials.sounds).forEach(function(e) {
					sceneSounds[e] = pageObj.materials.sounds[e].src;
				});
			}
			
			if(pageObj.materials.animations != undefined) {
				Object.keys(pageObj.materials.animations).forEach(function(e) {
					sceneImages[e] = pageObj.materials.animations[e].src;
				});
			}
			
			if(pageObj.materials.videos != undefined) {
				Object.keys(pageObj.materials.videos).forEach(function(e) {
					sceneVideos[e] = pageObj.materials.videos[e].src;
				});
			}
						
			page.scene = page.novent.canvas.Scene.New({
				name: page.name,
				materials: {
					images: sceneImages,
					sounds: sceneSounds,
					fonts: pageObj.materials.fonts,
					videos: sceneVideos
				},
				ready: function(stage, params) {
					
					//Set scene size to be fullscreen
					var _canvas = this.getCanvas();
					_canvas.setSize("browser", "fit");
					
					var readyObj = this;
					readyObj.stage = stage;
					readyObj.params = params;

					readyObj.materials = new Object();
					readyObj.materials.images = new Object();
					readyObj.materials.animations = new Object();
					readyObj.materials.videos = new Object();
					readyObj.materials.texts = new Object();
					readyObj.materials.wiggles = new Object();
					
					//Adding all the predifined images to the scene
					if(pageObj.materials.images != undefined) {
						Object.keys(pageObj.materials.images).forEach(function(e) {
							readyObj.materials.images[e] = readyObj.createElement(pageObj.materials.images[e].width, pageObj.materials.images[e].height);
							readyObj.materials.images[e].x = pageObj.materials.images[e].x;
							readyObj.materials.images[e].y = pageObj.materials.images[e].y;
							readyObj.materials.images[e].opacity = pageObj.materials.images[e].opacity;
							readyObj.materials.images[e].drawImage(e);
							
							readyObj.stage.append(readyObj.materials.images[e]);
							readyObj.materials.images[e].zIndex(pageObj.materials.images[e].index);
						});
					}
					
					//Same for animations
					if(pageObj.materials.animations != undefined) {
						Object.keys(pageObj.materials.animations).forEach(function(e) {
							readyObj.materials.animations[e] = new NoventEngine.Animation(page.novent.canvas, readyObj, e, pageObj.materials.animations[e]);
						});
					}
					
					//and videos
					if(pageObj.materials.videos != undefined) {
						Object.keys(pageObj.materials.videos).forEach(function(e) {
							readyObj.materials.videos[e] = new NoventEngine.Video(page.novent.canvas, readyObj, e, pageObj.materials.videos[e]);
						});
					}
					
					//And text elements
					if(pageObj.materials.texts != undefined) {
						Object.keys(pageObj.materials.texts).forEach(function(e) {							
							readyObj.materials.texts[e] = readyObj.createElement();
							readyObj.materials.texts[e].x = pageObj.materials.texts[e].x;
							readyObj.materials.texts[e].y = pageObj.materials.texts[e].y;
							readyObj.materials.texts[e].opacity = pageObj.materials.texts[e].opacity;
							
							var textElementModel = readyObj.createElement();
							textElementModel.font = pageObj.materials.texts[e].size + " " + pageObj.materials.texts[e].font;
							textElementModel.fillStyle = pageObj.materials.texts[e].color;
							
							wrapText(_canvas, readyObj, readyObj.materials.texts[e], pageObj.materials.texts[e])
							
							stage.append(readyObj.materials.texts[e]);
							readyObj.materials.texts[e].zIndex(pageObj.materials.texts[e].index);
						});
					}
					
					//Setting all sounds volume
					if(pageObj.materials.sounds != undefined) {
						Object.keys(pageObj.materials.sounds).forEach(function(e) {
							page.novent.canvas.Sound.fadeTo(e, 1, pageObj.materials.sounds[e].volume);
						});
					}
					
					readyObj.button = readyObj.createElement(page.novent.button.width, page.novent.button.height);
					var button = readyObj.button;
					button.x = page.novent.button.x;
					button.y = page.novent.button.y;
					button.opacity = 0;
					button.fillStyle = "transparent";
					button.fillRect(0, 0, page.novent.button.width, page.novent.button.height);
					button.drawImage("button");
										
					readyObj.stage.append(button);
					
					button.on("click", function() {
						if(button.opacity == 1) {
							playEvent(page.novent.canvas, readyObj);
							button.zIndex(1000);
						}
					});
					
					playEvent(page.novent.canvas, readyObj);
					button.zIndex(1000);
					
					readyObj.wiggle = function(id, type, obj, propertyName, amplitude, frequency, ease) {
						var wiggle = this;
						var minValue;
						var originValue;
						var playing = false;

						wiggle.stop = function() {
							playing = false;
						};
						
						function loop() {
							if(playing) {
								var value = minValue + Math.random()*2*amplitude;
								
								var change = new Object();
								change[propertyName] = value;
								page.novent.canvas.Timeline.new(readyObj.materials[type][obj]).to(change, frequency, Ease[ease]).call(function() {
									loop();
								});
							}
							else {
								var change = new Object();
								change[propertyName] = originValue;
								page.novent.canvas.Timeline.new(readyObj.materials[type][obj]).to(change, frequency, Ease[ease]).call();
							}
						}

						wiggle.start = function() {
							originValue = readyObj.materials[type][obj][propertyName];
							minValue = readyObj.materials[type][obj][propertyName] - amplitude;
							playing = true;
							readyObj.materials.wiggles[id] = wiggle;
							loop();
						};

						return wiggle;
					}
				},
				render: function(stage) {
					stage.refresh();
				}
			});
			
			page.scene.materials.images.button = page.novent.button.src;
			
			function wrapText(_canvas, readyObj, element, textObj) {
				var words = textObj.text.split(' ');
				var line = '';
			
				for(var n = 0; n < words.length; n++) {
				  var testLine;
				  if(n == 0) {
					  testLine = words[0];
				  }
				  else {
					  testLine = line + ' ' + words[n];
				  }
				  var metrics = _canvas.measureText(testLine, textObj.size, textObj.font);
				  var testWidth = metrics.width;
				  
				  var x = 0;
				  var y = 0;
				  var font = textObj.size + " " + textObj.font;
				  var color = textObj.color;
				  
				  if (testWidth > textObj.width && n > 0) {
					if(textObj.align == "justify") {					
						justifyLine(_canvas, readyObj, element, line, x, y, textObj);
					}
					else if(textObj.align == "center") {
						var el = readyObj.createElement();
						el.font = font;
						el.fillStyle = color;
						el.textAlign = "center";
						el.fillText(line, x + textObj.width/2, y);
						element.append(el);
					}
					else if(textObj.align == "right") {
						var el = readyObj.createElement();
						el.font = font;
						el.fillStyle = color;
						el.textAlign = "right";
						el.fillText(line, x + textObj.width, y);
						element.append(el);
					}
					else {
						var el = readyObj.createElement();
						el.font = font;
						el.fillStyle = color;
						el.fillText(line, x, y);
						element.append(el);
					}
						
					line = words[n];
					y += textObj.lineHeight;
				  }
				  else {
					line = testLine;
				  }
				}
				
				
				if(textObj.align == "center") {
					var el = readyObj.createElement();
					el.font = font;
					el.fillStyle = color;
					el.textAlign = "center";
					el.fillText(line, x + textObj.width/2, y);
					element.append(el);
				}
				else if(textObj.align == "right") {
					var el = readyObj.createElement();
					el.font = font;
					el.fillStyle = color;
					el.textAlign = "right";
					el.fillText(line, x + textObj.width, y);
					element.append(el);
				}
				else {
					var el = readyObj.createElement();
					el.font = font;
					el.fillStyle = color;
					el.fillText(line, x, y);
					element.append(el);
				}
			}

			function justifyLine(_canvas, readyObj, element, line, x, y, textObj) {
				var font = textObj.size + " " + textObj.font;
				var color = textObj.color;
				var words = line.split(' ');
				
				var spaceWidth = (textObj.width - _canvas.measureText(line.replace(/ /g, ""), textObj.size, textObj.font).width)/(words.length - 1);
				var lineX = x;
				
				for(var n = 0; n < words.length; n++) {
					var wordWidth = _canvas.measureText(words[n], textObj.size, textObj.font).width;
					var el = readyObj.createElement();
					el.font = font;
					el.fillStyle = color;
					el.fillText(words[n], lineX, y);
					element.append(el);
					lineX = lineX + wordWidth + spaceWidth;
				}	
			}
		},
		
		Event: function(page, funct) {
			var event = this;
			
			event.page = page;
			event.funct = funct;
			
			event.play = function(canvas, readyObj, callback) {
				event.funct(canvas, readyObj, callback);
			}
		},
		
		Animation: function(canvas, readyObj, name, animationObj) {
			var self = this;
			
			self.element = readyObj.createElement();
			self.element.x = animationObj.x;
			self.element.y = animationObj.y;
			
			readyObj.stage.append(self.element);
			self.element.zIndex(animationObj.index);			
			
			self.element.play = function(type, callback) {
				self.animation = canvas.Animation.new({
					images: name,
					animations: {
						animation: {
							frames: [0, animationObj.frames - 1],
							size: {
								width: animationObj.width,
								height: animationObj.height
							},
							frequence: animationObj.frequency,
							finish: callback
						}
					}
				});
			
				self.animation.add(self.element);
				self.animation.play("animation", type);
			}
			
			return self.element;
		},
		
		Video: function(canvas, readyObj, name, videoObj) {
			var self = this;
			
			self.element = readyObj.createElement(videoObj.width, videoObj.height);
			self.element.x = videoObj.x;
			self.element.y = videoObj.y;
			self.element.opacity = videoObj.opacity;
			self.element.drawImage(name);
			readyObj.stage.append(self.element);
			self.element.zIndex(videoObj.index);
			var video = canvas.Materials.get(name, "video");
			video.autobuffer = "autobuffer";
			
			self.element.play = function(type, callback) {
				
				video.addEventListener('ended', function () {
					if(type == "loop") {
						this.currentTime = 0;
						this.play();
					}
					else if(type == "remove") {
						self.element.remove();
						if(callback != undefined && callback != null)
							callback();
					}
					else if(type == "stop") {
						if(callback != undefined && callback != null)
							callback();
					}
				}, false);
				video.play();
			}
			
			return self.element;
		}
	};
}
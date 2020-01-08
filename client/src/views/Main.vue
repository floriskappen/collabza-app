<template>
	<div class="main" @mousemove="handleMouseMove($event)">
		<transition name="fade">
			<div
				class="modules-wrapper"
				v-if="showOverlays"
				@mouseenter="overlaysHovered = true"
				@mouseleave="overlaysHovered = false"
			>
				<div class="module module-draw" @mouseleave="showColorPicker = false">
					<div class="title">Draw</div>
					<div class="split"></div>
					<div class="top-row">
						<div class="drawing-control draw active">
							<i class="lni-pencil"></i>
						</div>
						<div class="drawing-control erase">
							<i class="lni-eraser"></i>
						</div>
					</div>
					<div class="split"></div>
					<div class="bottom-row">
						<div class="color recent" @click="updateStrokeColor({ hex8: recentColors[2] }, true)" :style="{backgroundColor: recentColors[2]}"></div>
						<div class="color recent" @click="updateStrokeColor({ hex8: recentColors[1] }, true)" :style="{backgroundColor: recentColors[1]}"></div>
						<div class="color recent" @click="updateStrokeColor({ hex8: recentColors[0] }, true)" :style="{backgroundColor: recentColors[0]}"></div>
						<div class="custom" @click="showColorPicker = !showColorPicker">
							<i class="lni-color-pallet"></i>
						</div>
						<chrome-color-picker v-if="showColorPicker && overlaysHovered" class="color-picker" :value="strokeColor" @input="updateStrokeColor"></chrome-color-picker>
					</div>
					<div class="split"></div>
					<div class="stroke-preview">
						<div class="stroke" id="stroke" :style="{backgroundColor: strokeColor}"></div>
						<input v-model="strokeWidth" type="range" class="stroke-width" min="1" max="50" step="1"/>
					</div>
				</div>
			</div>
		</transition>
		<transition name="fade">
			<div
				class="layers-wrapper"
				v-if="showOverlays"
				@mouseenter="overlaysHovered = true"
				@mouseleave="overlaysHovered = false"
			>
				<div class="title">Layers</div>
				<div class="split"></div>
				<div class="layers">
					<draggable v-model="layers" handle=".handle" ghostClass="ghost" @end="handleLayerOrderChange">
						<div
							class="layer"
							v-for="(layer, index) in layers"
							:key="index"
							@click="selectLayer(layer)"
							:class="{'selected': layer.data.selected}"
						>
							<div class="option dropdown" @click.stop="layer.data.open = !layer.data.open, $forceUpdate()">
								<i class="lni-chevron-right" v-if="!layer.data.open"></i>
								<i class="lni-chevron-down" v-else></i>
							</div>
							<div
								class="option select"
								@click.stop="layer.activate(), $forceUpdate()"
								:class="{ 'active': paper.project.activeLayer.id === layer.id}"
							>
								<i class="lni-check-mark-circle"></i>
							</div>
							<div class="name">
								<input
									v-if="layer.data.edittingName"
									@blur="layer.data.edittingName = false, $forceUpdate()"
									@keypress.enter="layer.data.edittingName = false, $forceUpdate()"
									v-model="layer.data.name" type="text"
								>
								<span v-else @dblclick="layer.data.edittingName = true, $forceUpdate()">{{layer.data.name}}</span>
							</div>
							<div 
								class="option lock"
								:class="{ 'active': layer.locked}"
								@click.stop="layer.locked = !layer.locked, $forceUpdate()"
							>
								<i class="lni-unlock" v-if="!layer.locked"></i>
								<i class="lni-lock" v-else></i>
							</div>
							<div class="option visibility" @click.stop="layer.visible = !layer.visible, $forceUpdate()">
								<i class="lni-eye" v-if="layer.visible"></i>
								<i class="lni-close" v-else></i>
							</div>
							<div class="option drag handle">
								<i class="lni-hand"></i>
							</div>
						</div>
					</draggable>
				</div>
				<div class="split"></div>
				<div class="bottom-icons">
					<!-- New layer -->
					<div class="icon new" @click="createNewLayer()">
						<i class="lni-add-file"></i>
					</div>

					<!-- Copy layer -->
					<div class="icon copy">
						<i class="lni-files"></i>
					</div>

					<!-- Remove layer -->
					<div class="icon remove" @click="removeSelectedLayers()" :class="{'active': layersAreSelected}">
						<i class="lni-trash"></i>
					</div>
				</div>
			</div>
		</transition>
		<canvas id="canvas"></canvas>
	</div>
</template>

<style lang="scss" scoped>
.main {
	width: 100vw;
	height: 100vh;
	color: white;

	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.2s;
	}
	.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
		opacity: 0;
	}

	.modules-wrapper {
		width: 150px;
		height: 90vh;
		margin-left: 5vh;
		margin-top: 10vh;
		position: fixed;
		color: #1b2136;

		.module {
			background-color: #ffffff;
			box-shadow: -5px 5px 20px #1f1f1f27;
			width: 120px;
			border-radius: 5px;
			padding: 10px 20px;
			transition: height 0.2s;
			height: 30px;
			overflow: hidden;

			.split {
				width: 100%;
				height: 0px;
				border-bottom: 1px solid rgba(0, 0, 0, 0.062);
				margin: 10px 0px;
			}

			&:hover {
				height: 200px;
			}

			.title {
				font-size: 20px;
				margin-top: 5px;
				margin-bottom: 15px;
			}

			&.module-draw {
				.top-row {
					display: flex;
					justify-content: space-between;

					.drawing-control {
						width: 30px;
						height: 30px;
						border-radius: 5px;
						color: black;
						display: flex;
						justify-content: center;
						align-items: center;
						cursor: pointer;
						transition: background-color 0.2s, color 0.2s;

						&:hover {
							color: white;
							background-color: #02976c;
						}

						&.active {
							color: white;
							background-color: #02976c;
						}
					}
				}

				.bottom-row {
					display: flex;
					justify-content: space-between;
					.color {
						flex-shrink: 0;
						width: 20px;
						height: 20px;
						background-color: rgb(0, 0, 0);
						cursor: pointer;
					}

					.custom {
						cursor: pointer;
						font-size: 20px;
					}

					.color-picker {
						position: absolute;
						left: 100%;
					}
				}

				.stroke-preview {
					width: 100%;
					display: flex;
					align-items: center;
					flex-direction: column;
					.stroke {
						width: 80%;
						height: 2px;
						background-color: rgb(0, 0, 0);
					}

					// .color-code {
					// 	margin-top: 10px;
					// 	border-radius: 5px;
					// 	outline: none;
					// 	border: 2px solid #02976d50;
					// 	padding: 5px;
					// 	width: 80%;
					// 	color: #1b2136;

					// 	&:focus {
					// 		border: 2px solid #02976db0;
					// 	}
					// }
				}
			}
		}
	}

	.layers-wrapper {
		position: fixed;
		background-color: blue;
		right: 30px;
		bottom: 30px;
		color: #1b2136;
		width: 150px;
		height: 0px;
		padding: 0px 30px;
		padding-top: 15px;
		padding-bottom: 40px;
		border-radius: 5px;
		transition: height 0.2s, width 0.2s;
		overflow: hidden;
		background-color: #ffffff;
		box-shadow: -5px 5px 20px #1f1f1f27;

		&:hover {
			height: 400px;
			width: 320px;
		}

		.title {
			font-size: 20px;
			margin-bottom: 20px;
		}

		.split {
			width: 100%;
			height: 0px;
			border-bottom: 1px solid rgba(0, 0, 0, 0.062);
			margin: 10px 0px;
		}

		.layers {
			width: 100%;
			height: 300px;

			.layer {
				display: flex;
				padding: 0px 10px;
				transition: background-color 0.2s;
				border: 1px solid #02976d21;
				margin-bottom: 5px;
				border-radius: 5px;

				&.ghost {
					background-color: #dfdfdf;
				}

				&:hover {
					background-color: #0000000a;
				}

				&.selected {
					background-color: #00000015;
				}

				.option {
					width: 25px;
					height: 30px;
					flex-shrink: 0;
					display: flex;
					align-items: center;
					cursor: pointer;

					transition: color 0.2s;

					&:hover {
						color: #22cf9e;
					}

					&.select, &.lock {
						color: #bdbdbd;
					}

					&.active {
						color: #22cf9e;
					}
				}

				.name {
					flex-shrink: 0;
					width: 180px;
					text-align: left;

					span {
						transform: translateY(7px);
						width: 100%;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					input {
						// transform: translateY(5px);
						position: absolute;
						padding: 5px 10px;
						width: 150px;
						font-size: 16px;
						border: 1px solid #c0c0c0;
						outline: none;
						border-radius: 5px;
					}
				}
			}
		}

		.bottom-icons {
			position: absolute;
			top: 390px;
			height: 30px;
			width: calc(100% - 60px);
			display: flex;
			justify-content: space-between;
			font-size: 24px;

			.icon {
				width: 40px;
				height: 40px;
				margin: 0 auto;
				display: flex;
				justify-content: center;
				align-items: center;
				border-radius: 5px;
				cursor: pointer;
				transition: color 0.2s, background-color 0.2s;

				&:hover {
					color: white;
					background-color: #02976c;
				}

				&.remove {
					color: #b1b1b1;
					cursor: default;

					&:hover {
						background-color: white;
					}

					&.active {
						color: black;
						cursor: pointer;
						
						&:hover { 
							color: white;
							background-color: #02976c;
						}
					}
				}
			}
		}
	}

	#canvas {
		width: 100%;
		height: 100%;
		background-color: #ffffff;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
	}
}
</style>

<script>
import io from "socket.io-client";
import paper from "paper";
import draggable from "vuedraggable";
import { Chrome } from "vue-color"

const paths = {}
let timeOut = null;

let strokeColor = '#418225'
let strokeWidth = 5

export default {
	components: {
		draggable,
		'chrome-color-picker': Chrome
	},
	data() {
		return {
			paper: null,

			strokeWidth: 5,
			strokeColor: '#418225',
			strokeColorToUpdateTo: '#000000',
			recentColors: [
				'blue',
				'black',
				'yellow'
			],

			showOverlays: false,
			overlaysHovered: false,
			mouseMovedTimeout: null,
			manualTimeout: false,
			showColorPicker: false,

			layersAreSelected: false,
			layers: [],

			mousePosition: {
				x: 0,
				y: 0
			},
		};
	},
	mounted() {
		const canvas = document.getElementById("canvas");
		this.paper = paper.setup(canvas);

		let socket = io.connect("localhost:3000");
		
		function handleMouseDown(event, id) {
			paths[id] = new paper.Path();
			paths[id].strokeColor = strokeColor;
			paths[id].strokeWidth = strokeWidth;
		}
		function handleMouseDrag(event, id) {
			if (paths[id]) {
				paths[id].add(event.point);
				paths[id].smooth(100);
			}
		}
		function handleMouseUp(event, id) {
			paths[id].simplify(0);
		}

		function sendDataInstantly() {
			clearInterval(timeOut);
			if (!paths["me"].segments || !paths["me"].segments.length) {
				return;
			}

			socket.emit("send_full_drawing", paths["me"]);
		}
		function sendDataSlowly() {
			timeOut = setInterval(() => {
				socket.emit("send_temp_drawing", paths["me"]);
			}, 50);
		}

		const currentTool = new paper.Tool()

		currentTool.minDistance = 5;

		currentTool.onKeyDown = function(event) {
			if (event.key == "right") {
				this.paper.view.center = this.paper.view.center - 500;
			}
		};

		currentTool.onMouseDown = function(event) {
			if (paper.project.activeLayer.locked) {
				return
			}
			sendDataSlowly();
			handleMouseDown(event, "me");
		};


		currentTool.onMouseDrag = function(event) {
			if (paper.project.activeLayer.locked) {
				return
			}
			handleMouseDrag(event, "me");
		};

		currentTool.onMouseUp = function(event) {
			if (paper.project.activeLayer.locked) {
				return
			}
			handleMouseUp(event, "me");
			sendDataInstantly();
		};

		socket.on("get_full_drawing", data => {
			if (!paths[data.id]) {
				paths[data.id] = {};
			}
			if (paths[data.id].temp) {
				paths[data.id].temp.removeSegments();
			}
			if (!paths[data.id].full) {
				paths[data.id].full = [];
			}
			let index = 0;
			if (paths[data.id].full.length) {
				index = paths[data.id].full.length + 1;
			} else {
				index = 1;
			}
			paths[data.id].full[index] = new paper.Path();
			paths[data.id].full[index].strokeColor = "black";
			paths[data.id].full[index].insertSegments(0, data[1].segments);
		});

		socket.on("get_temp_drawing", data => {
			if (!paths[data.id]) {
				paths[data.id] = {};
			}
			if (!paths[data.id].temp) {
				paths[data.id].temp = new paper.Path();
				paths[data.id].temp.strokeColor = "black";
			}
			paths[data.id].temp.removeSegments();
			paths[data.id].temp.insertSegments(0, data[1].segments);
		});

		const uiInterval = setInterval(() => {
			if (
				!this.overlaysHovered &&
				this.showOverlays &&
				!this.manualTimeout
			) {
				this.showOverlays = false;
			}
		}, 1000);

		window.addEventListener("wheel", e => {
			const point = new paper.Point(
				this.mousePosition.x,
				this.mousePosition.y
			);
			if (e.deltaY > 0 && this.paper.view.zoom > 0.5) {
				this.paper.view.scale(0.9, point);
			} else if (e.deltaY < 0 && this.paper.view.zoom < 2) {
				this.paper.view.scale(1.1, point);
			}
		});

		for (let index = 0; index < 3; index++) {
			this.layers.push(new paper.Layer())
			this.layers[index].data = {
				name: `Layer ${index + 1}`,
				edittingName: false,
				open: false,
				selected: false
			}
		}

		this.layers[0].bringToFront()
		this.layers[2].sendToBack()

		this.layers[0].activate()
	},
	watch: {
		strokeWidth(value) {
			strokeWidth = value
		},
		showColorPicker(value) {
			if (value === false) {
				if (this.strokeColor !== this.strokeColorToUpdateTo) {					
					this.recentColors[2] = this.recentColors[1]
					this.recentColors[1] = this.recentColors[0]
					this.recentColors[0] = this.strokeColor
				}
				this.strokeColor = this.strokeColorToUpdateTo
				strokeColor = this.strokeColorToUpdateTo
			}
		},
		overlaysHovered(value) {
			if (value === false) {
				this.layers.forEach(layer => {
					layer.data.edittingName = false
				})

				this.$forceUpdate()
			}
		},
		selectedLayers(value) {
			if (value.length) {
				this.layersAreSelected = true
			} else {
				this.layersAreSelected = false
			}
		}
	},
	computed: {
		areLayersSelected() {
			this.layers.forEach(layer => {
				if (layer.data.selected) {
					return true
				}
			})
			return false
		}
	},
	methods: {
		handleMouseMove(e) {
			this.mousePosition.x = e.clientX;
			this.mousePosition.y = e.clientY;
			if ((e.movementX > 5 || e.movementY > 5) && e.buttons != 1) {
				if (this.mouseMovedTimeout) {
					clearTimeout(this.mouseMovedTimeout);
				}
				(this.showOverlays = true), (this.manualTimeout = true);

				const mouseMovedTimeout = setTimeout(() => {
					if (!this.overlaysHovered) {
						this.showOverlays = false;
						this.manualTimeout = false;
					} else {
						this.mouseMovedTimeout = mouseMovedTimeout;
					}

				}, 1000);
				this.mouseMovedTimeout = mouseMovedTimeout;
			}
		},
		updateStrokeColor(value, isFromRecentColor) {
			this.strokeColorToUpdateTo = value.hex8

			if (isFromRecentColor) {
				if (this.strokeColor !== this.strokeColorToUpdateTo) {					
					this.recentColors[2] = this.recentColors[1]
					this.recentColors[1] = this.recentColors[0]
					this.recentColors[0] = this.strokeColor
				}
				this.strokeColor = this.strokeColorToUpdateTo
				strokeColor = this.strokeColorToUpdateTo
			}
		},
		handleLayerOrderChange(e) {
			const reversedLayers = this.layers.slice().reverse()
			if (e.newIndex >= this.layers.length - 1) {
				this.layers[e.newIndex].sendToBack()
			} else if (e.newIndex > 0) {
				this.layers[e.newIndex].insertAbove(reversedLayers[e.newIndex - 1])
			} else {
				this.layers[e.newIndex].bringToFront()
			}
		},
		createNewLayer() {
			this.layers.unshift(new paper.Layer())

			const layer = this.layers[0]

			layer.bringToFront()
			layer.data = {
				name: `Layer ${layer._id}`,
				edittingName: false,
				open: false,
				selected: false
			}
			console.log(this.layers)

			this.$forceUpdate()
		},
		selectLayer(layer) {
			if (layer.data.selected) {
				layer.data.selected = false
				let isAnyLayerStillSelected = false
				this.layers.forEach(layer => {
					if (layer.data.selected) {
						isAnyLayerStillSelected = true
					}
				})
				if (!isAnyLayerStillSelected) this.layersAreSelected = false
				this.$forceUpdate()
				return
			}

			layer.data.selected = true
			this.layersAreSelected = true
			this.$forceUpdate()
		},
		removeSelectedLayers() {
			if (!this.layersAreSelected) return

			let indexToRemove = []
			// this.layers.forEach((layer, index) => {
			// 	console.log(layer._id)
				// if (layer.data.selected && !layer.locked) {
				// 	layer.remove()
				// 	this.layers.splice(index, 1)
				// 	hasRemoved = true
				// }
			// })

			for (let i = 0; i < this.layers.length; i++) {
				const layer = this.layers[i]
				console.log(layer._id)
				if (layer.data.selected && !layer.locked) {
					layer.remove()
					indexToRemove.push(i)
				}
			}

			if (indexToRemove.length) {
				this.layers = this.layers.filter((value, index) => {
					return indexToRemove.indexOf(index) == -1
				})
				this.$forceUpdate()
			}
		}
	},
	directives: {
		focus: {
			inserted (el) {
				el.focus()
			}
		}
	}
};
</script>

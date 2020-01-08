<template>
	<div class="main" @mousemove="handleMouseMove($event)">
		<transition name="fade">
			<div
				class="modules-wrapper"
				@mouseenter="overlaysHovered = true"
				@mouseleave="overlaysHovered = false"
			>
				<div class="module module-draw" :class="{'active': drawingModulePinned}" @mouseleave="showColorPicker = false">
					<div class="title">
						<span>Drawing</span>
						<i class="lni-pin-alt" :class="{'active': drawingModulePinned}" @click="drawingModulePinned = !drawingModulePinned"></i>
					</div>
					<div class="split"></div>
					<div class="top-row">
						<div 
							class="drawing-control draw"
							@click="tools[0].activate(), currentTool = 0"
							:class="{'active': currentTool === 0}"
						>
							<i class="lni-pencil"></i>
						</div>
						<div 
							class="drawing-control erase"
							@click="tools[1].activate(), currentTool = 1"
							:class="{'active': currentTool === 1}"
						>
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
						<div class="stroke-wrapper">
							<div class="stroke" id="stroke" :style="{'background-color': strokeColor, 'height': `${strokeWidth}px`}"></div>
						</div>
						<vue-slider v-model="strokeWidth" class="stroke-width" :min="1" :max="50" width="120px" :interval="1" ></vue-slider>
					</div>
				</div>
			</div>
		</transition>
		<transition name="fade">
			<div
				class="layers-wrapper"
				@mouseenter="overlaysHovered = true"
				@mouseleave="overlaysHovered = false"
				:class="{'active': layersComponentPinned}"
			>
				<div class="title">
					<span>Layers</span>
					<i class="lni-pin-alt" :class="{'active': layersComponentPinned}" @click="layersComponentPinned = !layersComponentPinned"></i>
				</div>
				<div class="split"></div>
				<div class="layers">
					<draggable v-model="layers" handle=".handle" ghostClass="ghost" @end="handleLayerOrderChange">
						<div
							class="layer"
							v-for="(layer, index) in layers"
							:key="index"
							:class="{'selected': layer.data.selected, 'open': layer.data.open}"
						>
							<div class="layer-controls" @click="selectLayer(layer)">
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
								<div class="name" @dblclick="layer.data.edittingName = true, $forceUpdate()">
									<input
										@click.stop
										v-if="layer.data.edittingName"
										@blur="layer.data.edittingName = false, $forceUpdate()"
										@keypress.enter="layer.data.edittingName = false, $forceUpdate()"
										v-model="layer.data.name" type="text"
									>
									<span v-else>{{layer.data.name}}</span>
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
							<div class="layer-children">
								<div class="children-filters">
									<div 
										class="filter all"
										:class="{'active': !layer.data.filter}"
										@click="layer.data.filter = false, $forceUpdate()"
									>
										<i class="lni-ban"></i>
									</div>
									<div 
										class="filter path"
										:class="{'active': layer.data.filter === 'path'}"
										@click="layer.data.filter = 'path', $forceUpdate()"
									>
										<i class="lni-brush-alt"></i>
									</div>
									<div 
										class="filter shape"
										:class="{'active': layer.data.filter === 'shape'}"
										@click="layer.data.filter = 'shape', $forceUpdate()"
									>
										<i class="lni-stop"></i>
									</div>
									<div 
										class="filter text"
										:class="{'active': layer.data.filter === 'text'}"
										@click="layer.data.filter = 'text', $forceUpdate()"
									>
										<i class="lni-text-format"></i>
									</div>
									<div 
										class="filter raster"
										:class="{'active': layer.data.filter === 'raster'}"
										@click="layer.data.filter = 'raster', $forceUpdate()"
									>
										<i class="lni-image"></i>
									</div>
								</div>
								<div class="children">
									<div 
										class="child"
										v-for="(child, index) in getLayerChildren(layer)"
										:key="index"
										@click="child.selected = !child.selected, $forceUpdate()"
										:class="{'selected': child.selected}"
									>
										<div class="option type">
											<i class="lni-brush-alt"></i>
										</div>
										<div class="name" @dblclick="child.data.edittingName = true, $forceUpdate()">
											<input
												@click.stop
												v-if="child.data.edittingName"
												@blur="child.data.edittingName = false, $forceUpdate()"
												@keypress.enter="child.data.edittingName = false, $forceUpdate()"
												v-model="child.data.name" type="text"
											>
											<span v-else>{{child.data.name}}</span>
										</div>
										<div class="option lock" :class="{'active': child.locked}" @click.stop="child.locked = !child.locked, $forceUpdate()">
											<i class="lni-unlock" v-if="!child.locked"></i>
											<i class="lni-lock" v-else></i>
										</div>
										<div class="option visibility" :class="{'active': child.visible}" @click.stop="hideChildLayer(child)">
											<i class="lni-eye"></i>
										</div>
										<div class="option remove" @click="removeChildLayer(child)">
											<i class="lni-close"></i>
										</div>
									</div>
									<div class="no-children" v-if="!getLayerChildren(layer).length">
										Nothing to show
									</div>
								</div>
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
					<div class="icon copy" @click="copySelectedLayers()" :class="{'active': layersAreSelected}">
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
		height: fit-content;
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
			height: 84px;
			
			overflow: hidden;

			.split {
				width: 100%;
				height: 0px;
				border-bottom: 1px solid rgba(0, 0, 0, 0.062);
				margin: 10px 0px;
			}

			.title {
				font-size: 20px;
				display: flex;
				justify-content: space-between;
				margin-top: 5px;
				margin-bottom: 15px;

				i {
					cursor: pointer;
					color: #b1b1b1;
					transition: transform .2s;

					&.active {
						color: black;
						transform: rotate(45deg);
					}
				}
			}

			&.module-draw {
				&:hover {
					height: 250px;
				}

				&.active {
					height: 250px;
				}


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
						border-radius: 15px;
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
					.stroke-wrapper {
						width: 100%;
						display: flex;
						justify-content: center;
						align-items: center;
						height: 50px;
						.stroke {
							width: 80%;
							height: 5px;
							background-color: rgb(0, 0, 0);
						}
					}
					.stroke-width {
						margin-top: 20px;
					}
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
		padding-top: 15px;
		padding-bottom: 40px;
		border-radius: 5px;
		transition: height 0.2s, width 0.2s;
		overflow: hidden;
		background-color: #ffffff;
		box-shadow: -5px 5px 20px #1f1f1f27;

		&:hover {
			height: 400px;
			width: 360px;
		}

		&.active {
			min-height: 400px;
			min-width: 360px;
		}

		.title {
			padding: 0px 30px;
			font-size: 20px;
			margin-bottom: 20px;
			text-align: left;
			display: flex;
			justify-content: space-between;

			i {
				cursor: pointer;
				color: #b1b1b1;
				transition: transform .2s;

				&.active {
					color: black;
					transform: rotate(45deg);
				}
			}
		}

		.split {
			padding: 0px 30px;
			width: 100%;
			height: 0px;
			border-bottom: 1px solid rgba(0, 0, 0, 0.062);
			margin: 10px 0px;
		}

		.layers {
			padding: 0px 30px;
			width: calc(100% - 60px);
			height: 300px;
			overflow: auto;

			.layer {
				padding: 0px 10px;
				transition: background-color 0.2s;
				width: 280px;
				height: 30px;
				border: 1px solid #02976d21;
				margin-bottom: 5px;
				border-radius: 5px;
				overflow: hidden;

				&:hover {
					background-color: #0000000a;
				}

				&.selected {
					background-color: #00000015;
				}

				&.ghost {
					background-color: #dfdfdf;
				}

				&.open {
					height: fit-content;
				}

				.layer-controls {
					display: flex;
	
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
							color: black;
						}
					}
	
					.name {
						flex-shrink: 0;
						width: 160px;
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
							// position: absolute;
							padding: 5px 10px;
							width: 130px;
							font-size: 16px;
							border: 1px solid #c0c0c0;
							outline: none;
							border-radius: 5px;
						}
					}
				}

				.layer-children {
					margin: 10px 0px 5px 0px;
					background-color: white;
					border-radius: 5px;
					border: 1px solid #02976d21;
					.children-filters {
						display: flex;
						justify-content: space-between;
						padding: 5px 10px;
						
						.filter {
							width: 35px;
							height: 35px;
							display: flex;
							justify-content: center;
							align-items: center;
							cursor: pointer;
							color: #b1b1b1;
							border-radius: 5px;
							transition: color .2s, background-color .2s;
							
							&:hover {
								background-color: #02976c;
								color: white;
							}

							&.active {
								background-color: white;
								color: black;
								cursor: default;
							}
						}
					}
					.children {
						margin-top: 10px;

						.child {
							padding: 0px 10px 0px 20px;
							display: flex;
							align-items: center;

							&:hover {
								background-color: #0000000a;
							}

							&.selected {
								background-color: #00000015;
							}

							.name {
								flex-shrink: 0;
								width: 145px;
								text-align: left;
			
								span {
									transform: translateY(3px);
									width: 100%;
									white-space: nowrap;
									overflow: hidden;
									text-overflow: ellipsis;
								}
			
								input {
									// transform: translateY(5px);
									// position: absolute;
									padding: 5px 10px;
									width: 130px;
									font-size: 16px;
									border: 1px solid #c0c0c0;
									outline: none;
									border-radius: 5px;
								}
							}

							.option {
								width: 25px;
								height: 30px;
								flex-shrink: 0;
								display: flex;
								align-items: center;
								cursor: pointer;
								transition: color .2s;
			
								&.lock, &.visibility {
									color: #bdbdbd;
								}
			
								&.active {
									color: black;
								}

								&:hover {
									color: #22cf9e;
								}

								&.type {
									cursor: default;
									&:hover {
										color: black;
									}
								}
							}
						}

						.no-children {
							text-align: left;
							margin-left: 20px;
							margin-bottom: 10px;
							font-size: 14px;
							color: #b1b1b1;
						}
					}
				}
			}
		}

		.bottom-icons {
			padding: 0px 30px;
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

				&.remove, &.copy {
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
import VueSlider from 'vue-slider-component'
import '../custom-component-css/vue-slider-component/material.css'

const paths = {}
let timeOut = null;

let strokeColor = '#418225'
let strokeWidth = 15

export default {
	components: {
		draggable,
		'chrome-color-picker': Chrome,
		'vue-slider': VueSlider
	},
	data() {
		return {
			paper: null,

			strokeWidth: 15,
			strokeColor: '#02976c',
			strokeColorToUpdateTo: '#000000',
			recentColors: [
				'#971d02',
				'#976802',
				'#360297'
			],

			showOverlays: false,
			overlaysHovered: false,
			mouseMovedTimeout: null,
			manualTimeout: false,
			showColorPicker: false,
			currentTool: 0,

			layersComponentPinned: false,
			drawingModulePinned: false,

			layersAreSelected: false,
			layers: [],

			tools: [],

			mousePosition: {
				x: 0,
				y: 0
			},
		};
	},
	mounted() {
		const canvas = document.getElementById("canvas");
		this.paper = paper.setup(canvas);

		const socket = io.connect("localhost:3000");
		
		let currentActivePathID = null
		function handleMouseDown(event, id) {
			const path = new paper.Path();
			path.data = {
				name: `Path ${paper.project.activeLayer.children.length}`,
				owner: 'me'
			}
			// paths[id].onMouseDrag = function(event) {
			// 	const point = event.nearestPoint

			// }
			path.strokeColor = strokeColor;
			path.strokeWidth = strokeWidth;

			currentActivePathID = path.id
			paper.project.activeLayer.addChild(path)
		}
		function handleMouseDrag(event, id) {
			const path = paper.project.activeLayer.getItem({id: currentActivePathID})
			if (path) {
				path.add(event.point);
				path.smooth(100);
			}
		}
		function handleMouseUp(event, id) {
			const path = paper.project.activeLayer.getItem({id: currentActivePathID})
			path.simplify(0.5);
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

		const drawingTool = new paper.Tool()
		drawingTool.minDistance = 5;
		drawingTool.onKeyDown = function(event) {
			if (event.key == "right") {
				this.paper.view.center = this.paper.view.center - 500;
			}
		};
		drawingTool.onMouseDown = function(event) {
			if (paper.project.activeLayer.locked) {
				return
			}
			// sendDataSlowly();
			handleMouseDown(event, "me");
		};
		drawingTool.onMouseDrag = function(event) {
			if (paper.project.activeLayer.locked) {
				return
			}
			handleMouseDrag(event, "me");
		};
		drawingTool.onMouseUp = function(event) {
			if (paper.project.activeLayer.locked) {
				return
			}
			handleMouseUp(event, "me");
			// sendDataInstantly();
		};

		const eraseTool = new paper.Tool()
		eraseTool.minDistance = 5
		let eraser = null
		eraseTool.onMouseDown = function(event) {
			eraser = new paper.Path.Circle({
				center: event.point,
				radius: 10,
				fillColor: '#f32d2d5b',
				locked: true,
				data: {
					isEraser: true
				}
			})
		}
		eraseTool.onMouseDrag = function(event) {
			eraser.position = event.point

			if (event.item) {
				const item = paper.project.activeLayer.getItem({id: event.item.id})
				if (!item) return
				const nearestLocation = item.getNearestLocation(event.point)
				if (nearestLocation) {
					const otherHalf = item.splitAt(nearestLocation.offset)
					if (otherHalf) {
						otherHalf.removeSegment(0)

						if (otherHalf.segments.length < 2) {
							otherHalf.remove()
						}
						console.log(item.segments.length, otherHalf.segments.length)

					} else {
						console.log(item.segments.length)
					}
				}

				console.log(item.length, item.segments.length, item)

				if (item.length > 100) {
					item.removeSegment(item.segments.length - 1)
					if (item.segments[item.segments.length - 1]) {
						item.segments[item.segments.length - 1].remove()
						item.segments.slice(item.segments.length - 1, 1)
					}
				} else {
					console.log('hey')
					item.removeSegments()
					item.remove()
				}
			}

		}
		eraseTool.onMouseUp = function(event) {
			eraser.remove()
		}

		this.tools.push(drawingTool)
		this.tools.push(eraseTool)
		this.tools[0].activate()
		console.log(paper.tool)

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
			if (this.overlaysHovered) return
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
				selected: false,
				filter: false
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
		getLayerChildren(layer) {
			if (!layer.data.filter) {
				return layer.children
			} else if (layer.data.filter === 'path') {
				const childrenToReturn = []
				layer.children.forEach(child => {
					if (child.className === 'Path') childrenToReturn.push(child)
				})
				return childrenToReturn
			} else if (layer.data.filter === 'shape') {
				const childrenToReturn = []
				layer.children.forEach(child => {
					if (child.className === 'Shape') childrenToReturn.push(child)
				})
				return childrenToReturn
			} else if (layer.data.filter === 'text') {
				const childrenToReturn = []
				layer.children.forEach(child => {
					if (child.className === 'PointText') childrenToReturn.push(child)
				})
				return childrenToReturn
			} else if (layer.data.filter === 'raster') {
				const childrenToReturn = []
				layer.children.forEach(child => {
					if (child.className === 'Raster') childrenToReturn.push(child)
				})
				return childrenToReturn
			} else {
				return []
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
			let layerIsActive = false
			if (this.layers[e.newIndex].id === paper.project.activeLayer.id) layerIsActive = true
			console.log(this.layers[e.newIndex].id, paper.project.activeLayer.id)
			const reversedLayers = this.layers.slice().reverse()
			if (e.newIndex >= this.layers.length - 1) {
				this.layers[e.newIndex].bringToFront()
			} else if (e.newIndex > 0) {
				this.layers[e.newIndex].insertAbove(reversedLayers[e.newIndex - 1])
			} else {
				this.layers[e.newIndex].sendToBack()
			}

			if (layerIsActive) this.layers[e.newIndex].activate()
		},
		createNewLayer() {
			this.layers.unshift(new paper.Layer())

			const layer = this.layers[0]

			layer.bringToFront()
			layer.data = {
				name: `Layer ${paper.project.layers.length}`,
				edittingName: false,
				open: false,
				selected: false,
				filter: false
			}
			layer.activate()

			this.$forceUpdate()
		},
		selectLayer(layer) {
			console.log(layer)
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
		copySelectedLayers() {
			if (!this.layersAreSelected) return

			let newLayers = []
			for (let i = 0; i < this.layers.length; i++) {
				const layer = this.layers[i]

				if (layer.data.selected) {
					const newLayer = layer.copyTo(this.paper.project)
					newLayer.data.name = `Copy of ${newLayer.data.name}`
					newLayer.insertAbove(layer)
					newLayers.push([i, layer._id, newLayer])
					layer.data.selected = false
				}
			}

			if (newLayers.length) {
				newLayers.forEach((newLayer, index) => {
					let oldLayerIndex = -1
					this.layers.forEach((layer, index) => {
						if (layer._id === newLayer[1]) oldLayerIndex = index
					})

					if (oldLayerIndex >= 0) {
						this.layers.splice(oldLayerIndex, 0, newLayer[2])
					}
				})
				this.$forceUpdate()
			}
		},
		removeSelectedLayers() {
			if (!this.layersAreSelected) return

			let indexToRemove = []
			let lockedSelectedLayers = false

			for (let i = 0; i < this.layers.length; i++) {
				const layer = this.layers[i]
				if (layer.data.selected) {
					if (layer.locked) {
						lockedSelectedLayers = true
						continue
					}
					layer.remove()
					indexToRemove.push(i)
				}
			}

			if (indexToRemove.length) {
				this.layers = this.layers.filter((value, index) => {
					return indexToRemove.indexOf(index) == -1
				})
				if (!lockedSelectedLayers) this.layersAreSelected = false
				this.$forceUpdate()
			}
		},
		hideChildLayer(child) {
			if (child.locked) return
			child.visible = !child.visible
			this.$forceUpdate()

		},
		removeChildLayer(child) {
			if (child.locked) return
			child.remove()
			this.$forceUpdate()
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

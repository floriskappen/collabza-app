<template>
	<div class="main" @mousemove="handleMouseMove($event)">
		<transition name="fade">
			<div
				class="modules-wrapper"
				v-if="showOverlays"
				@mouseenter="overlaysHovered = true"
				@mouseleave="overlaysHovered = false"
			>
				<div class="module module-draw">
					<div class="title">Draw</div>
					<div class="split"></div>
					<div class="top-row">
						<div class="drawing-control draw">
							<i class="lni-pencil"></i>
						</div>
						<div class="drawing-control erase">
							<i class="lni-eraser"></i>
						</div>
					</div>
					<div class="split"></div>
					<div class="bottom-row">
						<div class="color recent"></div>
						<div class="color recent"></div>
						<div class="color recent"></div>
						<div class="custom">
							<i class="lni-color-pallet"></i>
						</div>
					</div>
					<div class="split"></div>
					<div class="stroke-preview">
						<div class="stroke"></div>
						<input type="text" class="color-code" value="#000000" />
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
					<draggable v-model="layers" handle=".handle" ghostClass="ghost">
						<div class="layer" v-for="(layer, index) in layers" :key="index">
							<div class="option visibility">
								<i class="lni-close"></i>
							</div>
							<div class="option dropdown">
								<i class="lni-chevron-right"></i>
							</div>
							<div class="option icon">
								<i class="lni-layers"></i>
							</div>
							<div class="name">
								<span>{{layer.name}}</span>
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
					<div class="icon new">
						<i class="lni-add-file"></i>
					</div>

					<!-- Copy layer -->
					<div class="icon copy">
						<i class="lni-files"></i>
					</div>

					<!-- Remove layer -->
					<div class="icon remove">
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
					}
				}

				.bottom-row {
					display: flex;
					justify-content: space-between;
					.color {
						flex-shrink: 0;
						width: 20px;
						height: 20px;
						background-color: blue;
						cursor: pointer;
					}

					.custom {
						cursor: pointer;
						font-size: 20px;
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
						background-color: blue;
					}

					.color-code {
						margin-top: 10px;
						border-radius: 5px;
						outline: none;
						border: 2px solid #02976d50;
						padding: 5px;
						width: 80%;
						color: #1b2136;

						&:focus {
							border: 2px solid #02976db0;
						}
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

				.option {
					width: 30px;
					height: 30px;
					flex-shrink: 0;
					display: flex;
					align-items: center;
					cursor: pointer;

					transition: color 0.2s;

					&:hover {
						color: #22cf9e;
					}
				}

				.name {
					flex-shrink: 0;
					width: 190px;
					text-align: left;

					span {
						transform: translateY(7px);
						width: 100%;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
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

export default {
	components: {
		draggable
	},
	data() {
		return {
			showOverlays: false,
			overlaysHovered: false,
			mouseMovedTimeout: null,
			manualTimeout: false,
			layers: [
				{
					name: "Layer one"
				},
				{
					name: "Really long layer name"
				},
				{
					name: "Really long layer name 2"
				},
				{
					name: "Really long layer name"
				},
				{
					name: "Really long layer name"
				},
				{
					name: "Really long layer name"
				},
				{
					name: "Really long layer name"
				}
			],
			mousePosition: {
				x: 0,
				y: 0
			}
		};
	},
	mounted() {
		let socket = io.connect("localhost:3000");

		let paths = {};
		let timeOut = null;

		function handleMouseDown(event, id) {
			paths[id] = new paper.Path();
			paths[id].strokeColor = "black";
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

		var canvas = document.getElementById("canvas");
		paper.setup(canvas);

		const tool = new paper.Tool();
		tool.minDistance = 5;

		tool.onKeyDown = function(event) {
			if (event.key == "right") {
				paper.view.center = paper.view.center - 500;
			}
		};

		tool.onMouseDown = function(event) {
			sendDataSlowly();
			handleMouseDown(event, "me");
		};

		tool.onMouseDrag = function(event) {
			handleMouseDrag(event, "me");
		};

		tool.onMouseUp = function(event) {
			handleMouseUp(event, "me");
			sendDataInstantly();
		};

		// const zoomTool = new paper.Tool();
		// zoomTool.onMouseDrag = function(event) {
		// 	var offset = event.downPoint - event.point;
		// 	paper.view.center = paper.view.center + offset;
		// };

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
			// console.log(point);
			// console.log(paper.view.translate);
			if (e.deltaY > 0 && paper.view.zoom > 0.5) {
				paper.view.scale(0.9, point);
			} else if (e.deltaY < 0 && paper.view.zoom < 2) {
				paper.view.scale(1.1, point);
			}
		});
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
		}
	}
};
</script>

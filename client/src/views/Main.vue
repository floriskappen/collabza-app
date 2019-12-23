<template>
    <div class="main" @mousemove="handleMouseMove($event)">
        <transition name="fade">
            <div class="modules-wrapper" v-if="showOverlays">
                <div class="module module-draw">
                    <div class="title">Draw</div>
                    <div class="top-row">
                        <div class="drawing-control draw"></div>
                        <div class="drawing-control erase"></div>
                    </div>
                    <div class="bottom-row">
                        <div class="recent-colors">
                            <div class="color recent"></div>
                            <div class="color recent"></div>
                            <div class="color recent"></div>
                        </div>
                        <div class="color custom"></div>
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
        margin-top: 5vh;
        position: fixed;

        .module {
            background-color: #272a38;
            width: 130px;
            height: 130px;
            border-radius: 5px;
            padding: 10px;

            .title {
                font-size: 20px;
            }

            .module-draw {
                .title {
                }
            }
        }
    }

    #canvas {
        width: 2000px;
        height: 2000px;
        background-color: #ffffff;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
}
</style>

<script>
import io from 'socket.io-client'
import paper from 'paper'

let socket = io.connect('localhost:3000')

export default {
    data() {
        return {
            showOverlays: false,
            mouseMovedTimeout: null
        }
    },
    mounted() {
        let paths = {}

        let timeOut = null

        function handleMouseDown(event, id) {
            paths[id] = new paper.Path()
            paths[id].strokeColor = 'black'
        }
        function handleMouseDrag(event, id) {
            paths[id].add(event.point)
        }
        function handleMouseUp(event, id) {
            paths[id].simplify(50)
        }

        function sendDataInstantly() {
            clearInterval(timeOut)
            if (!paths['me'].segments) {
                return
            }
            socket.emit('send_full_drawing', paths['me'])
        }
        function sendDataSlowly() {
            timeOut = setInterval(() => {
                socket.emit('send_temp_drawing', paths['me'])
            }, 50)
        }

        var canvas = document.getElementById('canvas')
        paper.setup(canvas)

        const tool = new paper.Tool()
        tool.onMouseDown = function(event) {
            handleMouseDown(event, 'me')
            sendDataSlowly()
        }

        tool.onMouseDrag = function(event) {
            handleMouseDrag(event, 'me')
        }

        tool.onMouseUp = function(event) {
            handleMouseUp(event, 'me')
            sendDataInstantly()
        }

        socket.on('get_full_drawing', data => {
            if (!paths[data.id]) {
                paths[data.id] = {}
            }
            if (paths[data.id].temp) {
                paths[data.id].temp.removeSegments()
            }
            if (!paths[data.id].full) {
                paths[data.id].full = []
            }
            let index = 0
            if (paths[data.id].full.length) {
                index = paths[data.id].full.length + 1
            } else {
                index = 1
            }
            // console.log(index)
            paths[data.id].full[index] = new paper.Path()
            paths[data.id].full[index].strokeColor = 'black'
            paths[data.id].full[index].insertSegments(0, data[1].segments)
        })

        socket.on('get_temp_drawing', data => {
            if (!paths[data.id]) {
                paths[data.id] = {}
            }
            if (!paths[data.id].temp) {
                paths[data.id].temp = new paper.Path()
                paths[data.id].temp.strokeColor = 'black'
            }
            paths[data.id].temp.removeSegments()
            paths[data.id].temp.insertSegments(0, data[1].segments)
        })
    },
    methods: {
        handleMouseMove(e) {
            if ((e.movementX > 5 || e.movementY > 5) && e.buttons != 1) {
                if (this.mouseMovedTimeout) {
                    clearTimeout(this.mouseMovedTimeout)
                }
                this.showOverlays = true
                this.mouseMovedTimeout = setTimeout(() => {
                    this.showOverlays = false
                }, 1000)
            }
        }
    }
}
</script>

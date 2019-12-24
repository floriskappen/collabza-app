<template>
    <div class="view loading">
        LOADING
    </div>
</template>

<script>
import io from 'socket.io-client'
import axios from 'axios'

export default {
    async created() {
        let socket = await io.connect('localhost:3000')
        socket.on('connect', async () => {
            axios.post('http://localhost:3000/room', {
                socketID: socket.id
            }).then((response) => {
                console.log(response)
            })

        })
    },
}
</script>
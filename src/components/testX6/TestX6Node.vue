<template>
  <div>
    <div style="width:100%; height:100%">
      <div id="container" style="width: 1000px;height: 1000px"></div>
      <TeleportContainer/>
    </div>
  </div>
</template>

<script>
import {defineComponent} from 'vue'
import CustomNode1 from './CustomNode1.vue'
import {Graph} from '@antv/x6'
import {register, getTeleport} from '@antv/x6-vue-shape'

register({
  shape: 'custom-vue-node',
  width: 200,
  height: 100,
  component: CustomNode1,
})
const TeleportContainer = getTeleport()



export default defineComponent({
  name: 'App',
  components: {
    TeleportContainer,
  },
  mounted() {
    const graph = new Graph({
      container: document.getElementById('container'),
      background:
          {
            color: '#F2F7FA',
          }
      ,
      autoResize: true,
    })

    const node = graph.addNode({
      shape: 'custom-vue-node',
      x: 100,
      y: 60,
      data:{
        name: 1
      }
    })

    setInterval(() => {
      const { a } = node.getData()
      node.setData({
        a: (a + 10),
      })
    }, 2000)

  },
})
</script>

<style scoped>

</style>

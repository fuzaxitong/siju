<template>
  <div style="width: 100%;height: 100%">
    <div>
      <el-button type="primary" @click="switchNodeTemp">切换节点样式</el-button>
      <el-button type="primary" @click="showProjList">项目列表</el-button>
      <el-button type="primary"  @click="mergeCal" style="float: right">汇聚计算</el-button>
      <div id="container" style="width: 98vw;height: 91vh"></div>
      <div id="minimap" style="border: 1px ;position: absolute;bottom: 30px;right: 50px;"></div>
      <TeleportContainer />
      <ElDrawer v-model="nodeDialog" :close-on-click-modal="true" close-on-press-escape :size="300">
        <ElForm :model="form">
          <ElFormItem label="节点名">
            <ElInput v-model="form.name"></ElInput>
          </ElFormItem>

          <ElFormItem label="当前值">
            <ElInput v-model="form.nodeVal"></ElInput>
          </ElFormItem>

          <ElFormItem label="目标值">
            <ElInput v-model="form.targetVal"></ElInput>
          </ElFormItem>

          <ElFormItem label="基线值">
            <ElInput v-model="form.baseVal"></ElInput>
          </ElFormItem>

          <ElFormItem label="自身值">
            <ElInput v-model="form.selfVal"></ElInput>
          </ElFormItem>

          <el-form-item>
            <div style="width: 100%;">            <el-button style="float:right;" type="primary" @click="onSave">保存</el-button></div>
          </el-form-item>
        </ElForm>
      </ElDrawer>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import { Selection } from '@antv/x6-plugin-selection'
import {Graph} from '@antv/x6'
import dagre from 'dagre'
import insertCss from 'insert-css'

import CustomNode1 from './CustomNode1.vue'
import {register, getTeleport} from '@antv/x6-vue-shape'
import axios from "axios";

import emitter from "@/bus";
import { Keyboard } from '@antv/x6-plugin-keyboard'
import {ElMessage, ElMessageBox} from "element-plus";
import {Scroller} from "@antv/x6-plugin-scroller";
import {MiniMap} from "@antv/x6-plugin-minimap";

const nodeDialog = ref(false)

const curNodeData = ref()

const form = ref({
  id: '',
  name: '',
  nodeVal: 0,
  targetVal: 0,
  baseVal: 0,
  selfVal: 0,
})

const onSave = ()=>{
  console.log('save',form.value)
  let d = form.value
  axios.put('http://8.134.83.254:18180/jeecg-boot/ext/tNode/edit',d).then(res=>{
    console.log('res',res)
    nodeDialog.value = false

    let node = nodes.value.find(i=>i.id==d.id);
    if(node){
      node.setData({
        nodeName: d.name,
        num1: d.nodeVal,
        num2: d.targetVal,
        num3: d.baseVal,
        num4: d.selfVal
      })
    }

  })

}

function uuid() {
  var d = new Date().getTime();
  if (window.performance && typeof window.performance.now === "function") {
    d += performance.now(); //use high-precision timer if available
  }
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;    // d是随机种子
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid.replaceAll("-","");
}

emitter.on("removeNode",(id)=>{
  console.log("removeNode",id)
  if(id==0){
    return
  }
  // return;
  axios.delete('http://8.134.83.254:18180/jeecg-boot/biz1/tNode/delete?id='+id).then(res=>{
    console.log('res',res)
    graph.value.removeNode(id)
    layout()
  })
})

emitter.on("overEdit",(nodeData)=>{
  let d = nodeData
  axios.put('http://8.134.83.254:18180/jeecg-boot/biz1/tNode/edit',d).then(res=>{
    console.log('res',res)
  })
})

// emitter.on("customNode:dblClick",(node)=>{
//   nodeDialog.value = true
//   curNodeData.value = node
//   let d = node.store.data.data
//   form.value.id = d.nodeId
//   form.value.name = d.nodeName
//   form.value.nodeVal = d.num1 || 0
//   form.value.targetVal = d.num2 || 0
//   form.value.baseVal = d.num3 || 0
//   form.value.selfVal = d.num4 || 0
//   console.log('node',node)
// })

emitter.on("add",(id)=>{
  console.log("add",id)

  let d = {id:uuid(),name:'test',pid:id}

  // return;
  axios.post('http://8.134.83.254:18180/jeecg-boot/biz1/tNode/add',d).then(res=>{
    console.log('res',res)
    let nodeData = {
      nodeId: d.id,
      nodeName: d.name,
      pid: d.pid
    }

    let nodeNew = createNode(nodeData);
    let edgeNew = createEdge(d.pid,d.id)
    nodes.value.push(nodeNew)
    edges.value.push(edgeNew)
    graph.value.addCell([nodeNew, edgeNew])
    layout()
  })
})

register({
  shape: 'custom-vue-node',
  width: 250,
  height: 100,
  component: CustomNode1,
})
const TeleportContainer = getTeleport()

const nodes = ref([])
const edges = ref([])

const temp = ref('temp1')

const graph = ref()

// const remove = ()=>{
//   console.log('rrrr')
// }

const mergeCal = () =>{
  axios.post('http://8.134.83.254:18180/jeecg-boot/ext/tNode/mergeCal',{projId:null}).then(res=>{
    refresh()
  })
}

const showProjList = ()=>{
  console.log('showProjList')
}

const switchNodeTemp = () => {
  if (temp.value == 'temp1') {
    temp.value = 'temp2'
  } else {
    temp.value = 'temp1'
  }
  nodes.value.forEach(i => i.setData({
    temp: temp.value,
  }))
}

function createNode(nodeData) {
  console.log('nodeData', nodeData)
  return graph.value.addNode({
    id: nodeData.nodeId,
    shape: 'custom-vue-node',
    data: nodeData,
  })

  // return graph.createNode({
  //   shape: 'org-node',
  //   attrs: {
  //     '.image': { xlinkHref: image },
  //     '.rank': {
  //       text: Dom.breakText(rank, { width: 160, height: 45 }),
  //     },
  //     '.name': {
  //       text: Dom.breakText(name, { width: 160, height: 45 }),
  //     },
  //   },
  // })
}

function createEdge(sourceId, targetId) {
  return graph.value.createEdge({
    shape: 'org-edge',
    source: {cell: sourceId},
    target: {cell: targetId},
  })
}

// 开启边的运行动画
const executeAnimate = () => {
  graph.value.getEdges().forEach((edge) => {
    edge.attr({
      line: {
        stroke: '#3471F9',
      },
    })
    edge.attr('line/strokeDasharray', 4)
    edge.attr('line/style/animation', 'running-line 30s infinite linear')
  })
}

// 布局方向
const dir = 'LR' // LR RL TB BT

// 自动布局
function layout() {
  let nodes1 = graph.value.getNodes()
  let edges1 = graph.value.getEdges()
  const g = new dagre.graphlib.Graph()
  g.setGraph({rankdir: dir, nodesep: 16, ranksep: 16})
  g.setDefaultEdgeLabel(() => ({}))

  const width = 400
  const height = 120
  nodes1.forEach((node) => {
    g.setNode(node.id, {width, height})
  })

  edges1.forEach((edge) => {
    const source = edge.getSource()
    const target = edge.getTarget()
    g.setEdge(source.cell, target.cell)
  })

  dagre.layout(g)

  g.nodes().forEach((id) => {
    const node = graph.value.getCellById(id)
    if (node) {
      const pos = g.node(id)
      node.position(pos.x, pos.y)
    }
  })

  edges1.forEach((edge) => {
    const source = edge.getSourceNode()
    const target = edge.getTargetNode()
    const sourceBBox = source.getBBox()
    const targetBBox = target.getBBox()

    if ((dir === 'LR' || dir === 'RL') && sourceBBox.y !== targetBBox.y) {
      const gap =
          dir === 'LR'
              ? targetBBox.x - sourceBBox.x - sourceBBox.width
              : -sourceBBox.x + targetBBox.x + targetBBox.width
      const fix = dir === 'LR' ? sourceBBox.width : 0
      const x = sourceBBox.x + fix + gap / 2
      edge.setVertices([
        {x, y: sourceBBox.center.y},
        {x, y: targetBBox.center.y},
      ])
    } else if (
        (dir === 'TB' || dir === 'BT') &&
        sourceBBox.x !== targetBBox.x
    ) {
      const gap =
          dir === 'TB'
              ? targetBBox.y - sourceBBox.y - sourceBBox.height
              : -sourceBBox.y + targetBBox.y + targetBBox.height
      const fix = dir === 'TB' ? sourceBBox.height : 0
      const y = sourceBBox.y + fix + gap / 2
      edge.setVertices([
        {x: sourceBBox.center.x, y},
        {x: targetBBox.center.x, y},
      ])
    } else {
      edge.setVertices([])
    }
  })
}
const refresh = async ()=>{
  await axios.post('http://8.134.83.254:18180/jeecg-boot/ext/tNode/selAll').then(res => {
    console.log('res', res)
    let d = res.data.result
    console.log('d', d)
    nodes.value = d.map(i => {
      return createNode({
        nodeId: i.id,
        nodeName: i.name,
        num1: i.nodeVal,
        num2: i.targetVal,
        num3: i.baseVal,
        num4: i.selfVal,
      })
    })

    d.forEach(i => {
      if (i.pid && i.pid != "0") {
        edges.value.push(createEdge(i.pid, i.id))
      }
    })

  })

  graph.value.resetCells([...nodes.value, ...edges.value])
  layout()
  graph.value.zoomTo(0.8)
  graph.value.centerContent()
  setup()

  setTimeout(() => {
    executeAnimate()
  }, 0)
}

// 监听自定义事件
function setup() {
  // graph.value.on('node:add', ({e, node}) => {
  //   e.stopPropagation()
  //   const member = createNode(
  //       {nodeId: node.id, nodeName: node.name}
  //   )
  //   graph.value.addCell([member, createEdge(node, member)])
  //   layout()
  // })

  graph.value.on('node:delete', ({e, node}) => {
    e.stopPropagation()
    graph.value.removeCell(node)
    layout()
  })

  graph.value.on("node:dblclick",({ e, x, y, node, view })=>{
    nodeDialog.value = true
    curNodeData.value = node
    let d = node.store.data.data
    console.log('d222222',d)
    form.value.id = d.nodeId
    form.value.name = d.nodeName
    form.value.nodeVal = d.num1 || 0
    form.value.targetVal = d.num2 || 0
    form.value.baseVal = d.num3 || 0
    form.value.selfVal = d.num4 || 0
    console.log('node',node)
  })

  graph.value.bindKey('delete', () => {
    const cells = graph.value.getSelectedCells()
    if (cells.length) {
      ElMessageBox.alert('是否确认？', '确认删除', {
        // if you want to disable its autofocus
        // autofocus: false,
        confirmButtonText: 'OK',
        callback: (action) => {
          let idList = cells.map(i => i.id)
          let ids = idList.join(',')
          axios.delete('http://8.134.83.254:18180/jeecg-boot/biz1/tNode/deleteBatch?ids='+ids).then(res=>{
            console.log('res',res)
            idList.forEach(i=>graph.value.removeNode(i))
            layout()
          })

          ElMessage({
            type: 'info',
            message: `action: ${action}`,
          })
        },
      })
    }
    return false
  })

  graph.value.bindKey('tab', () => {
    const cells = graph.value.getSelectedCells()
    console.log('cells',cells)
    if (cells.length == 1) {
      let d = {id:uuid(),name:'test',pid:cells[0].id}
      console.log('dddd',d)
      // return;
      axios.post('http://8.134.83.254:18180/jeecg-boot/biz1/tNode/add',d).then(res=>{
        console.log('res',res)
        let nodeData = {
          nodeId: d.id,
          nodeName: d.name,
          pid: d.pid
        }

        let nodeNew = createNode(nodeData);
        let edgeNew = createEdge(d.pid,d.id)
        nodes.value.push(nodeNew)
        edges.value.push(edgeNew)
        graph.value.addCell([nodeNew, edgeNew])
        layout()
      })
    }
    return false
  })

}

onMounted(async () => {

// 定义样式
  insertCss(`

  @keyframes running-line {
    to {
      stroke-dashoffset: 1000;
    }
  }

  .x6-cell {
    cursor: default;
  }
  .x6-node .btn {
    cursor: pointer;
  }
`)

// 自定义节点
  Graph.registerNode(
      'org-node',
      {
        width: 260,
        height: 88,
        markup: [
          {
            tagName: 'rect',
            attrs: {
              class: 'card',
            },
          },
          {
            tagName: 'image',
            attrs: {
              class: 'image',
            },
          },
          {
            tagName: 'text',
            attrs: {
              class: 'rank',
            },
          },
          {
            tagName: 'text',
            attrs: {
              class: 'name',
            },
          },
          {
            tagName: 'g',
            attrs: {
              class: 'btn add',
            },
            children: [
              {
                tagName: 'circle',
                attrs: {
                  class: 'add',
                },
              },
              {
                tagName: 'text',
                attrs: {
                  class: 'add',
                },
              },
            ],
          },
          {
            tagName: 'g',
            attrs: {
              class: 'btn del',
            },
            children: [
              {
                tagName: 'circle',
                attrs: {
                  class: 'del',
                },
              },
              {
                tagName: 'text',
                attrs: {
                  class: 'del',
                },
              },
            ],
          },
        ],
        attrs: {
          '.card': {
            rx: 10,
            ry: 10,
            refWidth: '100%',
            refHeight: '100%',
            fill: '#5F95FF',
            stroke: '#5F95FF',
            strokeWidth: 1,
            pointerEvents: 'visiblePainted',
          },
          '.image': {
            x: 16,
            y: 16,
            width: 56,
            height: 56,
            opacity: 0.7,
          },
          '.rank': {
            refX: 0.95,
            refY: 0.5,
            fill: '#fff',
            fontFamily: 'Courier New',
            fontSize: 13,
            textAnchor: 'end',
            textVerticalAnchor: 'middle',
          },
          '.name': {
            refX: 0.95,
            refY: 0.7,
            fill: '#fff',
            fontFamily: 'Arial',
            fontSize: 14,
            fontWeight: '600',
            textAnchor: 'end',
          },
          '.btn.add': {
            refDx: -16,
            refY: 16,
            event: 'node:add',
          },
          '.btn.del': {
            refDx: -44,
            refY: 16,
            event: 'node:delete',
          },
          '.btn > circle': {
            r: 10,
            fill: 'transparent',
            stroke: '#fff',
            strokeWidth: 1,
          },
          '.btn.add > text': {
            fontSize: 20,
            fontWeight: 800,
            fill: '#fff',
            x: -5.5,
            y: 7,
            fontFamily: 'Times New Roman',
            text: '+',
          },
          '.btn.del > text': {
            fontSize: 28,
            fontWeight: 500,
            fill: '#fff',
            x: -4.5,
            y: 6,
            fontFamily: 'Times New Roman',
            text: '-',
          },
        },
      },
      true,
  )

// 自定义边
  Graph.registerEdge(
      'org-edge',
      {
        zIndex: -1,
        attrs: {
          line: {
            strokeWidth: 2,
            stroke: '#A2B1C3',
            sourceMarker: null,
            targetMarker: null,
          },
        },
      },
      true,
  )



// 创建画布
  graph.value = new Graph({
    container: document.getElementById('container'),
    scroller: true,
    interacting: false,
    mousewheel: {
      enabled: true,
      modifiers: 'Ctrl',
      maxScale: 5,
      minScale: 0.05,
    },
    selecting: {
      enabled: true,
      rubberband: true, // 启用框选
    },
  })

  graph.value.use(
      new Selection({
        enabled: true,
        multiple: true,
        rubberband: true,
        movable: true,
        showNodeSelectionBox: true,
        multipleSelectionModifiers: 'ctrl',
        modifiers: 'ctrl'
      }),
  )

  graph.value.use(
      new Scroller({
        enabled: true,
        pannable: true,
      }),
  )

  graph.value.use(new Keyboard({
    enabled: true,
    global: true
  }))

  graph.value.use(
      new MiniMap({
        container: document.getElementById('minimap'),
      }),
  )

  refresh()
})
</script>

<style scoped>

</style>

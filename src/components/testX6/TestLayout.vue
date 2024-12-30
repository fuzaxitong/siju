<!--测试布局-->
<template>
  <div>
    <div>
      <ElButton @click="autoLayout(null)">自动布局</ElButton>
    </div>
    <div>
      <div id="container" style="width: 1000px;height: 1000px">

      </div>
    </div>
  </div>

</template>

<script>
import {Graph} from "@antv/x6";

let calMaxChildSize= (node)=>{
  let childNodes = node.child
  let nodeBox = node.getBBox()
  let nodeHeight = nodeBox.height
  let gap = 20

  // 所有子节点的高度加上之间gap的高度
  let totalHeight = 0
  for(let i=0;i<childNodes.length;i++){
    totalHeight += calMaxChildSize(childNodes[i])
    if(i!=0){
      totalHeight += gap
    }
  }

  node.trueHeight = Math.max(totalHeight,nodeHeight)
  return node.trueHeight
}

export default {
  name: "TestLayout",
  data() {
    return{
      graph: null,
      nodes: [],
      edges: []
    }
  },
  methods:{
    calTrueSize(){
      // 根据parentId将列表组成树
      this.nodes.forEach(i=>{
        i.child = []
      })

      let root;
      this.nodes.forEach(i=>{
        if(i.store.data.parentId==0){
          root = i
          return
        }
        let parent = this.nodes.find(j=>j.id==i.store.data.parentId)
        parent.child.push(i)
      })

      calMaxChildSize(root)
    },
    autoLayout(rootNode){

      // 先计算所有节点的trueHeight和trueWidth
      if(!rootNode){
        this.calTrueSize()
      }

      // 找根节点，没有起始边的
      console.log('this.nodes',this.nodes)
      if(!rootNode){
        rootNode = this.nodes.find(i=>i.store.data.parentId==0);
      }
      console.log('rootNode111111111111111',rootNode)
      // 找子节点
      let childNodes = this.nodes.filter(i=>i.store.data.parentId==rootNode.id);
      console.log('childNodes',childNodes)

      let gap = 20

      let totalChildHeight = 0
      // 父元素真实高度和所有子元素真实高度+gap高度中最小的一个
      let minHeight = rootNode.trueHeight

      for(let i=0;i<childNodes.length;i++){
        totalChildHeight += childNodes[i].trueHeight
        if(i!==0){
          totalChildHeight += gap
        }
      }

      if(totalChildHeight<minHeight && totalChildHeight!=0){
        minHeight = totalChildHeight
        // console.log('22222222222222222222',totalChildHeight,minHeight)
      }

      // 往父节点中心向上偏移半个高度
      let offset = -minHeight/2
      // 父节点的中心位置
      let parentCy = (rootNode.getBBox().y + rootNode.getBBox().y + rootNode.getBBox().height)/2
      for(let i=0;i<childNodes.length;i++){
        let topY = parentCy + offset
        let y = (topY+(topY+childNodes[i].trueHeight))/2
        childNodes[i].setPosition(rootNode.getBBox().x+rootNode.getBBox().width+40,y-childNodes[i].getBBox().height/2)
        offset += childNodes[i].trueHeight + gap
      }

      // 移除以该节点为起始的所有边
      console.log('this.edges',this.edges)
      this.edges = this.edges.filter(i=>i.store.data.source.cell!=rootNode.id)
      // this.edges = this.edges.filter(i=>false)
      const edges = this.graph.getEdges();
      edges.forEach(i=>{
        if(this.edges.indexOf(i)<0){
          this.graph.removeEdge(i)
        }
      })
      for(let i=0;i<childNodes.length;i++){
        let edge = this.graph.addEdge({
          source: {
            cell: rootNode.id,
            anchor: {
              name: 'midSide',
              args: {
                dx: 0,
              },
            },
          },
          target: {
            cell: childNodes[i].id,
            anchor: {
              name: 'midSide',
              args: {
                dx: 0,
              },
            },
         },
          connector: {
            name: 'normal',
          },
          vertices: [
            {x:(rootNode.getBBox().x+rootNode.getBBox().width)+20,y:rootNode.getBBox().y+rootNode.getBBox().height/2},
            {x:(rootNode.getBBox().x+rootNode.getBBox().width)+20,y:childNodes[i].getBBox().y+childNodes[i].getBBox().height/2},
          ],
          attrs: {
            line: {
              sourceMarker: null,
              targetMarker: null,
              stroke: '#8f8f8f',
              strokeWidth: 1,
            },
          }
        })

        this.edges.push(edge)
      }

      for(let i=0;i<childNodes.length;i++){
        //递归下一层
        this.autoLayout(childNodes[i])
      }
    }
  },
  mounted() {
    this.graph = new Graph(
        {
          container: document.getElementById('container'),
          background: {
            color: '#F2F7FA',
          },
          // 可拖拽
          interactive: true,
          // 可平移
          panning: true,
          autoResize: true,
          mousewheel: true,
          grid: true
        }
    )

    let root = this.graph.addNode({
      id: 'id0',
      x: 500,
      y: 500,
      width: 100,
      height: 70,
      attrs: {
        body: {
          stroke: '#8f8f8f',
          strokeWidth: 1,
          fill: '#fff',
          rx: 6,
          ry: 6,
        },
      },
      label: '根节点',
      parentId: '0'
    })

    this.nodes = [root]

    for(let i=1;i<500;i++){
      let pid = "id"+Math.floor(Math.random()*i)
      if(pid=="id"+i){
        pid = "id"+(i-1)
      }
      let node = this.graph.addNode({
        id: 'id'+i,
        x: 0,
        y: 0,
        width: 100 + Math.floor(Math.random()*300),
        height: 70 + + Math.floor(Math.random()*300),
        attrs: {
          body: {
            stroke: '#8f8f8f',
            strokeWidth: 1,
            fill: '#fff',
            rx: 6,
            ry: 6,
          },
        },
        label: '节点'+i,
        parentId: pid
      })
      this.nodes.push(node)
    }

    // // 添加节点
    // let node1 = this.graph.addNode({
    //   id: '1',
    //   x: 500,
    //   y: 500,
    //   width: 100,
    //   height: 70,
    //   attrs: {
    //     body: {
    //       stroke: '#8f8f8f',
    //       strokeWidth: 1,
    //       fill: '#fff',
    //       rx: 6,
    //       ry: 6,
    //     },
    //   },
    //   label: '节点1',
    //   parentId: '0'
    // })
    //
    //
    // let node2 = this.graph.addNode({
    //   id: '2',
    //   x: 0,
    //   y: 0,
    //   width: 100,
    //   height: 55,
    //   attrs: {
    //     body: {
    //       stroke: '#8f8f8f',
    //       strokeWidth: 1,
    //       fill: '#fff',
    //       rx: 6,
    //       ry: 6,
    //     },
    //   },
    //   label: '节点2',
    //   parentId: node1.id
    // })
    //
    // let node3 = this.graph.addNode({
    //   id: '3',
    //   x: 0,
    //   y: 0,
    //   width: 300,
    //   height: 50,
    //   attrs: {
    //     body: {
    //       stroke: '#8f8f8f',
    //       strokeWidth: 1,
    //       fill: '#fff',
    //       rx: 6,
    //       ry: 6,
    //     },
    //   },
    //   label: '节点3',
    //   parentId: node1.id
    // })
    //
    // let node4= this.graph.addNode({
    //   id: '4',
    //   x: 0,
    //   y: 0,
    //   width: 100,
    //   height: 40,
    //   attrs: {
    //     body: {
    //       stroke: '#8f8f8f',
    //       strokeWidth: 1,
    //       fill: '#fff',
    //       rx: 6,
    //       ry: 6,
    //     },
    //   },
    //   label: '节点4',
    //   parentId: node1.id
    // })
    //
    // let node5= this.graph.addNode({
    //   id: '5',
    //   x: 0,
    //   y: 0,
    //   width: 100,
    //   height: 300,
    //   attrs: {
    //     body: {
    //       stroke: '#8f8f8f',
    //       strokeWidth: 1,
    //       fill: '#fff',
    //       rx: 6,
    //       ry: 6,
    //     },
    //   },
    //   label: '节点5',
    //   parentId: node2.id
    // })
    //
    // this.nodes.push(node1,node2,node3,node4,node5)

    // let edge1 = this.graph.addEdge({
    //   source: {
    //     cell: node1.id,
    //     anchor: {
    //       name: 'midSide',
    //       args: {
    //         dx: 0,
    //       },
    //     },
    //   },
    //   target: {
    //     cell: node2.id,
    //     anchor: {
    //       name: 'midSide',
    //       args: {
    //         dx: 0,
    //       },
    //     },
    //   },
    //   vertices: [
    //     {x:(node1RightMiddle.x+node2LeftMiddle.x)/2,y:node1RightMiddle.y},
    //     {x:(node1RightMiddle.x+node2LeftMiddle.x)/2,y:node2LeftMiddle.y}
    //   ],
    //   attrs: {
    //     line: {
    //       stroke: '#8f8f8f',
    //       strokeWidth: 1,
    //     },
    //   },
    // })
    //
    // this.edges.push(edge1)
  }
}
</script>

<style scoped>

</style>

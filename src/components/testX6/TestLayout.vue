<!--测试布局-->
<template>
  <div>
    <div>
      <ElButton @click="autoLayout">自动布局</ElButton>
    </div>
    <div>
      <div id="container" style="width: 1000px;height: 1000px">

      </div>
    </div>
  </div>

</template>

<script>
import {Graph} from "@antv/x6";

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
    autoLayout(){
      // 找根节点，没有起始边的
      console.log('this.nodes',this.nodes)
      let rootNode = this.nodes.find(i=>i.store.data.parentId==0);
      // 找子节点
      let childNodes = this.nodes.filter(i=>i.store.data.parentId==rootNode.id);
      console.log('childNodes',childNodes)

      let gap = 20

      // 所有子节点的高度加上之间gap的高度
      let totalHeight = 0
      for(let i=0;i<childNodes.length;i++){
        let box = childNodes[i].getBBox()
        totalHeight += box.height
        if(i!=0){
          totalHeight += gap
        }
      }

      // 往父节点向上偏移超出父节点高度的1/2
      let offset =(totalHeight - rootNode.getBBox().height)/2
      console.log('totalHeight',totalHeight)
      console.log('offset',offset)

      let curHeight = 0
      for(let i=0;i<childNodes.length;i++){
        let box = childNodes[i].getBBox()
        let y = rootNode.getBBox().y - offset + curHeight
        curHeight += box.height + gap
        childNodes[i].setPosition(rootNode.getBBox().x+140,y)
      }
      // 移除所有边
      this.edges = []
      const edges = this.graph.getEdges();
      edges.forEach(i=>this.graph.removeEdge(i))
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
    }
  },
  mounted() {
    this.graph = new Graph(
        {
          container: document.getElementById('container'),
          background: {
            color: '#F2F7FA',
          },
          autoResize: true,
          mousewheel: true,
          grid: true
        }
    )

    // 添加节点
    let node1 = this.graph.addNode({
      id: '1',
      x: 0,
      y: 0,
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
      label: '节点1',
      parentId: '0'
    })


    let node2 = this.graph.addNode({
      id: '2',
      x: 0,
      y: 0,
      width: 100,
      height: 55,
      attrs: {
        body: {
          stroke: '#8f8f8f',
          strokeWidth: 1,
          fill: '#fff',
          rx: 6,
          ry: 6,
        },
      },
      label: '节点2',
      parentId: node1.id
    })

    let node3 = this.graph.addNode({
      id: '3',
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      attrs: {
        body: {
          stroke: '#8f8f8f',
          strokeWidth: 1,
          fill: '#fff',
          rx: 6,
          ry: 6,
        },
      },
      label: '节点3',
      parentId: node1.id
    })

    let node4= this.graph.addNode({
      id: '4',
      x: 0,
      y: 0,
      width: 100,
      height: 40,
      attrs: {
        body: {
          stroke: '#8f8f8f',
          strokeWidth: 1,
          fill: '#fff',
          rx: 6,
          ry: 6,
        },
      },
      label: '节点4',
      parentId: node1.id
    })

    this.nodes.push(node1,node2,node3,node4)


    const node1Box = node1.getBBox();
    const node2Box = node2.getBBox();

    // 获取node1的最右侧的中间位置
    const node1RightMiddle = {
      x: node1Box.x + node1Box.width,
      y: node1Box.y + node1Box.height / 2
    }

    const node2LeftMiddle = {
      x: node2Box.x,
      y: node2Box.y + node1Box.height / 2
    }

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

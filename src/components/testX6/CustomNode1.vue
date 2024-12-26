<template>
  <div>
    <div v-if="temp=='temp1'" style=" min-height:100px;display: flex; background-color: #e7e7e7; border-radius: 10px" @dblclick.capture="dbclick">
      <div>
        <div v-if="imgUrl" class="c1" :style="{backgroundImage: 'url(\''+imgUrl+'\')'}"></div>
      </div>
      <div style="width: 100%;margin: 5px 5px 10px 5px;display: flex;justify-content: center;flex-direction: column">
        <div v-if="inputForm=='text'" style="text-align: center;font-size: 20px;min-height: 20px" @dblclick.stop="changeInput" ref="nameInput">
          {{name}}
        </div>
        <div v-else @blur.capture="overEdit">
          <input v-model="name" style="width: 100%;height: 30px;border: none;border-radius: 5px;text-align: center">
        </div>
        <div style="text-align: center;font-size: 20px">
          <span style="color: royalblue">{{num1}}</span>
            /
          <span style="color: red">{{num2}}</span>
        </div>
      </div>
    </div>

    <div v-else-if="temp=='temp2'" style="min-height:100px;display: flex; background-color: #ececec; border-radius: 10px">
      <div style="width: 100%;">
        <div style="text-align: center;font-size: 20px">
          {{name}}
        </div>
        <div style="text-align: center;font-size: 20px">
          <el-progress :text-inside="true" :stroke-width="10" :percentage="70" />
        </div>
      </div>
    </div>

    <div v-if="temp=='temp3'" style="min-height:100px;display: flex; background-color: #e7e7e7; border-radius: 10px" @dblclick.capture="dbclick">
      <div>
        <div v-if="imgUrl" class="c1" :style="{backgroundImage: 'url(\''+imgUrl+'\')'}"></div>
      </div>
      <div style="width: 100%;margin: 5px 5px 10px 5px;display: flex;justify-content: center;flex-direction: column">
        <div v-if="inputForm=='text'" style="text-align: center;font-size: 20px;min-height: 20px" @dblclick.stop="changeInput" ref="nameInput">
          {{name}}
        </div>
        <div v-else @blur.capture="overEdit">
          <input v-model="name" style="width: 100%;height: 30px;border: none;border-radius: 5px;text-align: center">
        </div>
        <div style="display: flex;flex-direction: column;text-align: center;font-size: 20px">
          <div style="display: flex;justify-content: space-evenly">
            <div title="当前值" style="color: blue;min-width: 80px">{{ num1 }}</div>
            <div title="目标值" style="color: red;min-width: 80px">{{ num2 }}</div>
          </div>
          <div style="display: flex;justify-content: space-evenly">
            <div title="基线值" style="color: #f6872b;min-width: 80px">{{ num3 }}</div>
            <div title="自身值" style="color: green;min-width: 80px">{{ num4 }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import emitter from "@/bus";


export default defineComponent({
  name: 'CustomNode1',
  inject: ['getNode'],
  data() {
    return {
      temp: 'temp3',
      name: '',
      imgUrl: '',
      num1: 0,
      num2: 0,
      num3: 0,
      num4: 0,
      inputForm: 'text'
    }
  },
  methods:{
    dbclick(){
      emitter.emit('customNode:dblClick',this.getNode())
    },
    overEdit(){
      emitter.emit('overEdit',{id:this.getNode().id,name:this.name})
      this.inputForm='text'
    },
    changeInput(){
      if(this.inputForm == 'input'){
        this.inputForm = 'text'
      }else{
        this.inputForm = 'input'
      }
      console.log('this.$refs.nameInput',this.$refs.nameInput)
      this.$refs.nameInput.focus()
    },
    add(){
      emitter.emit("add",this.getNode().id)
    },
    remove(){
      console.log('remove')
      emitter.emit("removeNode",this.getNode().id)
    }
  },
  mounted() {
    try{
      const node = this.getNode()
      this.name = node.getData().nodeName
      // this.temp = node.getData().temp
      this.imgUrl = node.getData().imgUrl
      this.num1 = node.getData().num1 || 0
      this.num2 = node.getData().num2 || 0
      this.num3 = node.getData().num3 || 0
      this.num4 = node.getData().num4 || 0

      node.on('change:data', ({ current }) => {
        console.log('current',current)
        const { nodeName,temp,num1,num2,num3,num4 } = current
        if(nodeName){
          this.name = nodeName
        }
        if(temp){
          this.temp = temp
        }
        if(num1){
          this.num1=num1
        }
        if(num2){
          this.num2=num2
        }
        if(num3){
          this.num3=num3
        }
        if(num4){
          this.num4=num4
        }
      })
    }catch (e) {
      console.log()
    }
  },
})
</script>
<style scoped>
.c1{
  min-height: 100px;
  min-width: 100px;
  //background-image: url("https://mybk02.oss-cn-beijing.aliyuncs.com/fire.gif");
  background-size: cover;
}
</style>

# 本地文件操作

## 获取本地文件

### input file
```vue
<template>
  <a-card title="input 获取文件" style="width: 300px">
    <input type="file" ref="fileRef" multiple @change="handleFileChange" />
    <ul>
      <li v-for="(file, index) of fileList" :key="index">{{ file.name }}</li>
    </ul>
  </a-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      fileList: [],
    };
  },
  methods: {
    handleFileChange() {
      const fileRef = this.$refs.fileRef;
      this.fileList = fileRef?.files || [];
      console.log(fileRef, this.fileList);
    },
  },
});
</script>
```


### 拖拽
```vue
<template>
  <a-card title="拖拽 获取文件" style="width: 300px">
    <div @dragover="handleDragover" @drop="handleDrag" class="drag-area">
      拖拽到这
    </div>
    <ul>
      <li v-for="(file, index) of fileList" :key="index">{{ file.name }}</li>
    </ul>
  </a-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      fileList: [],
    };
  },
  methods: {
    handleDrag(evt) {
      evt.preventDefault();
      this.fileList = evt?.dataTransfer?.files || [];
    },
    handleDragover(evt) {
      evt.preventDefault();
    },
  },
});
</script>
```


### showOpenFilePicker
#### 兼容性

 <img :src="$withBase('/images/showOpenFilePicker.png')" alt="dock">

```vue
<template>
  <a-card title="filePicker 获取文件" style="width: 300px">
    <a-button type="primary" @click="handleOpenFilePicker">打开文件</a-button>
    <img
      v-for="(dataUrl, index) of imgList"
      :key="index"
      width="200"
      height="200"
      :src="dataUrl"
      alt=""
    />
  </a-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      imgList: [],
    };
  },
  methods: {
    async handleOpenFilePicker() {
      const pickerOpts = {
        types: [
          {
            description: "Images",
            accept: {
              "image/*": [".png", ".gif", ".jpeg", ".jpg"],
            },
          },
        ],
        excludeAcceptAllOption: true,
        multiple: true,
      };
      const fileHandlers = await window.showOpenFilePicker(pickerOpts);
      this.imgList = [];
      for (const fileHandle of fileHandlers) {
        // 获取文件内容
        const fileData = await fileHandle.getFile();
        const fr = new FileReader();
        fr.readAsDataURL(fileData);
        fr.onload = () => this.imgList.push(fr.result);
      }
    },
  },
});
</script>
```
## 保存文件
#### 兼容性

 <img :src="$withBase('/images/showSaveFilePicker.png')" alt="dock">

 ```vue
<template>
  <a-card title="保存文件" style="width: 300px">
    <a-textarea v-model:value="text" :rows="4" />
    <a-button type="dashed" @click="handleSave">保存</a-button>
    <a-button type="primary" @click="handleSaveAs">另存为</a-button>
  </a-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      text: "",
      fileHandler: null,
    };
  },
  methods: {
    async showSaveFilePicker() {
      const options = {
        types: [
          {
            description: "Test files",
            accept: {
              "text/plain": [".txt"],
            },
          },
        ],
      };
      this.fileHandler = await window.showSaveFilePicker(options);
      return this.fileHandler
    },
    async handleSave(evt) {
      evt.preventDefault();
      this.fileHandler = this.fileHandler || await this.showSaveFilePicker()
      const writable = await this.fileHandler.createWritable();
      await writable.write(this.text);
      await writable.close();
    },
    async handleSaveAs(evt) {
      this.fileHandler = null;
      await this.handleSave(evt);
    },
  },
});
</script>
 ```

## canvas转换图片数据

```vue
<template>
  <a-card title="canvas转换图片数据" style="width: 300px">
    <canvas id="c1" width="200" height="200"></canvas>
  </a-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      fileList: [],
    };
  },
  mounted() {
    this.drawImage();
  },
  methods: {
    drawImage() {
      const c1 = document.getElementById("c1");
      const ctx = c1.getContext("2d");
      const img = new Image();
      img.src = "./img/img.png";
      img.onload = function () {
        ctx.drawImage(img, 0, 0, 200, 200);
        // 该api不接受file协议
        const imgData = ctx.getImageData(0, 0, 200, 200);
        for (let i = 0; i < imgData.data.length; i += 4) {
          imgData.data[i] = 255 - imgData.data[i];
          imgData.data[i + 1] = 255 - imgData.data[i + 1];
          imgData.data[i + 2] = 255 - imgData.data[i + 2];
          imgData.data[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
      };
    }
  },
});
</script>
```
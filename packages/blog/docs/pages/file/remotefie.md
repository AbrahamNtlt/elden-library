# 文件的上传与下载

示例源码: https://gitee.com/achieve502938049/apprentice-file.git

## 单文件上传

### 客户端
前端通过 `<input type="file">` 获取 `File` 对象，通过 `FormData` 二进制传输。
```html
<template>
  <el-button type='success' :icon='Search' @click='selectFile'>选择文件</el-button>
  <el-button type='primary' :disabled='disabled' @click='upload'>
    上传
    <el-icon class='el-icon--right'>
      <Upload />
    </el-icon>
  </el-button>
  <br />
  <el-tag type='info' v-if='file'>{{ file.name }}</el-tag>
  <input type='file' class='hidden' ref='fileEl' @change='fileChange' />
</template>
```
```js
const file = ref(null);
const disabled = computed(() => !file.value);
const fileEl = ref(null);
const selectFile = () => {
    fileEl.value.click();
};
const fileChange = () => {
    file.value = fileEl.value.files[0];
};

const upload = () => {
    if (!file.value) {
        return ElMessage.error('请选择文件');
    }
    singleUpload({ file: file.value }).then(res => {
        const data = res.data;
        ElMessage({
            message: `${data.filename} 上传成功!`,
            type: 'success'
        });
    });
};
```
### 服务端

借助 `multer` 中间件，会将文件暂缓存到指定目录中，再通过文件流写入指定路径。
```js
const multer = require('multer');
const upload = multer({
    dest: 'uploads/'
});
// router
router.post('/single', upload.single('file'), async function(req, res, next) {
    const file = req.file;
    const filename = file.originalname;
    const path = `${uploadDir}/${filename}`;
    try {
        await fileUtils.writeStream(file.path, path);
        res.send(ResponseVo.success({ path, filename }));
    } catch (err) {
        res.send(ResponseVo.error(err));
    }
});

// fileUtils
function writeStream(sourcePath, targetPath) {
    return new Promise((resolve, reject) => {
        try {
            const readStream = fs.createReadStream(sourcePath), writeStream = fs.createWriteStream(targetPath);
            readStream.pipe(writeStream);
            readStream.on('end', () => {
                resolve();
                fs.unlinkSync(sourcePath);
            });
        } catch (err) {
            reject(err);
        }
    });
}
```

## 多文件上传

 客户端中 `<input type="file" multiple>` 增加 `multiple` 属性能让浏览器一次性选取多个文件。

 服务端中再对接收的 `File` 数组对象依次进行单文件输入。

## Base64上传

### 客户端

将 `File` 对象转换为 `Base64`，以字符的方式传输。
```js
const fileChange = async () => {
    const file = fileEl.value.files[0];
    base64Str.value = await covertFile2Base64(file);
    filename = file.name;
};

const upload = () => {
    if (!base64Str.value) {
        return ElMessage.error('请选择文件');
    }
    base64Upload({ file: base64Str.value, filename }).then(res => {
        const data = res.data;
        ElMessage({
            message: `${data.filename} 上传成功!`,
            type: 'success'
        });
    });
};

function covertFile2Base64(file): Promise<String> {
    return new Promise(resolve => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = (ev) => {
            resolve(ev.target.result);
        };
    });
}
```

### 服务端
```js
router.post('/base64', upload.none(), async function(req, res, next) {
    const fileBuffer = bufferUtils.covertBase64ToFileBuffer(req.body.file), filename = req.body.filename,
        spark = new SparkMD5.ArrayBuffer(), suffix = shared.getFileExtendingName(filename);
    spark.append(fileBuffer);
    const path = `${uploadDir}/${spark.end()}.${suffix}`;
    const exists = fileUtils.fileExists(path);
    if (exists) {
        return res.send(ResponseVo.success({ path, filename }, 'exists'));
    }
    try {
        await fileUtils.writeFile(fileBuffer, path);
        res.send(ResponseVo.success({ path, filename }));
    } catch (err) {
        res.send(ResponseVo.error(err));
    }
});

// fileUtils
function writeFile(buffer, targetPath) {
    return new Promise((resolve, reject) => {
        fs.writeFile(targetPath, buffer, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
```

## 大文件分片上传

### 客户端
将文件分割成若干个小文件，并予以特定的命名，待小文件全部上传后在服务端中进行文件合并。
```typescript
const fileChange = async () => {
    file.value = fileEl.value.files[0];
    hash = `${file.value.name}_${Date.now()}`;
};

const upload = () => {
    if (!file.value) {
        return ElMessage.error('请选择文件');
    }
    const chunks = splitChunks(file.value);
    Promise.all(chunks.map(chunk => chunkUpload(chunk))).then(() => {
        mergeChunk({
            hash,
            filename: file.value.name
        }).then(res => {
            const data = res.data;
            ElMessage({
                message: `${data?.filename} 上传成功!`,
                type: 'success'
            });
        });
    });
};

interface IChunk {
    chunk: Blob,
        filename: String;
}

const splitChunks = (file): Array<IChunk> => {
    const chunkSize = 1024 * 1024 * 2,
        count = Math.ceil(file.size / chunkSize),
        chunks: Array<IChunk> = [];
    let index = 0;
    while (index < count) {
        chunks.push({
            chunk: file.slice(index * chunkSize, (index + 1) * chunkSize),
            filename: `${index}_${hash}`
        });
        index++;
    }
    return chunks;
};

```

### 服务端

```js
// 上传文件切片
router.post('/chunk', upload.single('chunk'), async function(req, res, next) {
    const file = req.file, buffer = bufferUtils.covertBase64ToFileBuffer(file), filenameStr = req.body.filename,
        spark = new SparkMD5.ArrayBuffer();
    const index = filenameStr.indexOf('_');
    const idx = filenameStr.slice(0, index);
    const filename = filenameStr.slice(index + 1, filenameStr.length);
    spark.append(buffer);
    const hash = spark.end();

    const dirPath = `${uploadDir}/${filename}`;
    fileUtils.mkDir(dirPath);

    const path = `${dirPath}/${idx}_${hash}`;
    const exists = fileUtils.fileExists(path);
    if (exists) {
        return res.send(ResponseVo.success({ path, filename: hash }, 'exists'));
    }
    try {
        await fileUtils.writeStream(file.path, path);
        res.send(ResponseVo.success());
    } catch (err) {
        res.send(ResponseVo.error(err));
    }
});

// 合并切片
router.post('/merge', upload.none(), async function(req, res, next) {
    const hash = req.body.hash;
    const filename = req.body.filename;
    const dirPath = `${uploadDir}/${hash}`;
    try {
        const fileList = fileUtils.readDir(dirPath).sort((a, b) => {
            function getSort(str) {
                return parseInt(str.split('_')[0]);
            }

            return getSort(a) - getSort(b);
        }).map(file => `${dirPath}/${file}`);
        const path = `${uploadDir}/${filename}`;
        fileUtils.mergeFile(path, fileList);
        fileUtils.removeDir(dirPath);
        res.send(ResponseVo.success({
            path, filename
        }));
    } catch (err) {
        res.send(ResponseVo.error(err));
    }
});

// fileUtils
function readDir(path) {
    if (!fs.existsSync(path)) return [];
    return fs.readdirSync(path);
}

function mergeFile(targetPath, fileList) {
    fileList.forEach(filePath => {
        fs.appendFileSync(targetPath, fs.readFileSync(filePath));
    });
}

function removeDir(path) {
    const list = readDir(path);
    list.forEach(file => {
        const filePath = `${path}/${file}`;
        fs.unlinkSync(filePath);
    });
    fs.rmdirSync(path);
}
```

## 文件下载

使用 `Express` 提供的 `res.download()` 可以很方便的自动识别文件类型，返回对应的格式。
```js
router.get('/', function(req, res, next) {
    const filename = req.query.file;
    const path = `${downloadDir}/${filename}`;
    const exists = fileUtils.fileExists(path);
    if (!exists) return res.send(ResponseVo.error('file is not exists'));
    try {
        res.download(path);
    } catch (err) {
        res.send(ResponseVo.error(err));
    }
});
```

## 二进制流下载

### 服务端
在响应头中设置 `application/octet-stream` 等特定的属性，即可让请求返回二进制流。
```js
router.get('/stream', async function(req, res, next) {
    const filename = req.query.file;
    const path = `${downloadDir}/${filename}`;
    const exists = fileUtils.fileExists(path);
    if (!exists) return res.send(ResponseVo.error('file is not exists'));
    try {
        const data = await fileUtils.readFile(path);
        res.set('Content-Type', 'application/octet-stream');
        res.set('Content-Disposition', `attachment;filename=${filename}`);
        res.end(data);
    } catch (err) {
        res.send(ResponseVo.error(err));
    }
});
```

### 客户端
客户端接收数据时需预先约定数据接方式，再通过 `a` 标签的 `download` 属性触发下载。

```js
// axios
export function streamDownload(filename) {
  return axios({
    url: `/download/stream?file=${filename}`, method: 'get', responseType: 'blob'
  });
}

// 数据拼装
const handleStreamDownload = () => {
    const filename = 'demo.xlsx';
    streamDownload(filename).then(res => {
        const objectUrl = URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
};
```# 文件的上传与下载


## 单文件上传

### 客户端
前端通过 `<input type="file">` 获取 `File` 对象，通过 `FormData` 二进制传输。
```html
<template>
  <el-button type='success' :icon='Search' @click='selectFile'>选择文件</el-button>
  <el-button type='primary' :disabled='disabled' @click='upload'>
    上传
    <el-icon class='el-icon--right'>
      <Upload />
    </el-icon>
  </el-button>
  <br />
  <el-tag type='info' v-if='file'>{{ file.name }}</el-tag>
  <input type='file' class='hidden' ref='fileEl' @change='fileChange' />
</template>
```
```js
const file = ref(null);
const disabled = computed(() => !file.value);
const fileEl = ref(null);
const selectFile = () => {
    fileEl.value.click();
};
const fileChange = () => {
    file.value = fileEl.value.files[0];
};

const upload = () => {
    if (!file.value) {
        return ElMessage.error('请选择文件');
    }
    singleUpload({ file: file.value }).then(res => {
        const data = res.data;
        ElMessage({
            message: `${data.filename} 上传成功!`,
            type: 'success'
        });
    });
};
```
### 服务端

借助 `multer` 中间件，会将文件暂缓存到指定目录中，再通过文件流写入指定路径。
```js
const multer = require('multer');
const upload = multer({
    dest: 'uploads/'
});
// router
router.post('/single', upload.single('file'), async function(req, res, next) {
    const file = req.file;
    const filename = file.originalname;
    const path = `${uploadDir}/${filename}`;
    try {
        await fileUtils.writeStream(file.path, path);
        res.send(ResponseVo.success({ path, filename }));
    } catch (err) {
        res.send(ResponseVo.error(err));
    }
});

// fileUtils
function writeStream(sourcePath, targetPath) {
    return new Promise((resolve, reject) => {
        try {
            const readStream = fs.createReadStream(sourcePath), writeStream = fs.createWriteStream(targetPath);
            readStream.pipe(writeStream);
            readStream.on('end', () => {
                resolve();
                fs.unlinkSync(sourcePath);
            });
        } catch (err) {
            reject(err);
        }
    });
}
```

## 多文件上传

客户端中 `<input type="file" multiple>` 增加 `multiple` 属性能让浏览器一次性选取多个文件。

服务端中再对接收的 `File` 数组对象依次进行单文件输入。

## Base64上传

### 客户端

将 `File` 对象转换为 `Base64`，以字符的方式传输。
```js
const fileChange = async () => {
    const file = fileEl.value.files[0];
    base64Str.value = await covertFile2Base64(file);
    filename = file.name;
};

const upload = () => {
    if (!base64Str.value) {
        return ElMessage.error('请选择文件');
    }
    base64Upload({ file: base64Str.value, filename }).then(res => {
        const data = res.data;
        ElMessage({
            message: `${data.filename} 上传成功!`,
            type: 'success'
        });
    });
};

function covertFile2Base64(file): Promise<String> {
    return new Promise(resolve => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = (ev) => {
            resolve(ev.target.result);
        };
    });
}
```

### 服务端
```js
router.post('/base64', upload.none(), async function(req, res, next) {
    const fileBuffer = bufferUtils.covertBase64ToFileBuffer(req.body.file), filename = req.body.filename,
        spark = new SparkMD5.ArrayBuffer(), suffix = shared.getFileExtendingName(filename);
    spark.append(fileBuffer);
    const path = `${uploadDir}/${spark.end()}.${suffix}`;
    const exists = fileUtils.fileExists(path);
    if (exists) {
        return res.send(ResponseVo.success({ path, filename }, 'exists'));
    }
    try {
        await fileUtils.writeFile(fileBuffer, path);
        res.send(ResponseVo.success({ path, filename }));
    } catch (err) {
        res.send(ResponseVo.error(err));
    }
});

// fileUtils
function writeFile(buffer, targetPath) {
    return new Promise((resolve, reject) => {
        fs.writeFile(targetPath, buffer, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
```

## 大文件分片上传

### 客户端
将文件分割成若干个小文件，并予以特定的命名，待小文件全部上传后在服务端中进行文件合并。
```typescript
const fileChange = async () => {
    file.value = fileEl.value.files[0];
    hash = `${file.value.name}_${Date.now()}`;
};

const upload = () => {
    if (!file.value) {
        return ElMessage.error('请选择文件');
    }
    const chunks = splitChunks(file.value);
    Promise.all(chunks.map(chunk => chunkUpload(chunk))).then(() => {
        mergeChunk({
            hash,
            filename: file.value.name
        }).then(res => {
            const data = res.data;
            ElMessage({
                message: `${data?.filename} 上传成功!`,
                type: 'success'
            });
        });
    });
};

interface IChunk {
    chunk: Blob,
        filename: String;
}

const splitChunks = (file): Array<IChunk> => {
    const chunkSize = 1024 * 1024 * 2,
        count = Math.ceil(file.size / chunkSize),
        chunks: Array<IChunk> = [];
    let index = 0;
    while (index < count) {
        chunks.push({
            chunk: file.slice(index * chunkSize, (index + 1) * chunkSize),
            filename: `${index}_${hash}`
        });
        index++;
    }
    return chunks;
};

```

### 服务端

```js
// 上传文件切片
router.post('/chunk', upload.single('chunk'), async function(req, res, next) {
    const file = req.file, buffer = bufferUtils.covertBase64ToFileBuffer(file), filenameStr = req.body.filename,
        spark = new SparkMD5.ArrayBuffer();
    const index = filenameStr.indexOf('_');
    const idx = filenameStr.slice(0, index);
    const filename = filenameStr.slice(index + 1, filenameStr.length);
    spark.append(buffer);
    const hash = spark.end();

    const dirPath = `${uploadDir}/${filename}`;
    fileUtils.mkDir(dirPath);

    const path = `${dirPath}/${idx}_${hash}`;
    const exists = fileUtils.fileExists(path);
    if (exists) {
        return res.send(ResponseVo.success({ path, filename: hash }, 'exists'));
    }
    try {
        await fileUtils.writeStream(file.path, path);
        res.send(ResponseVo.success());
    } catch (err) {
        res.send(ResponseVo.error(err));
    }
});

// 合并切片
router.post('/merge', upload.none(), async function(req, res, next) {
    const hash = req.body.hash;
    const filename = req.body.filename;
    const dirPath = `${uploadDir}/${hash}`;
    try {
        const fileList = fileUtils.readDir(dirPath).sort((a, b) => {
            function getSort(str) {
                return parseInt(str.split('_')[0]);
            }

            return getSort(a) - getSort(b);
        }).map(file => `${dirPath}/${file}`);
        const path = `${uploadDir}/${filename}`;
        fileUtils.mergeFile(path, fileList);
        fileUtils.removeDir(dirPath);
        res.send(ResponseVo.success({
            path, filename
        }));
    } catch (err) {
        res.send(ResponseVo.error(err));
    }
});

// fileUtils
function readDir(path) {
    if (!fs.existsSync(path)) return [];
    return fs.readdirSync(path);
}

function mergeFile(targetPath, fileList) {
    fileList.forEach(filePath => {
        fs.appendFileSync(targetPath, fs.readFileSync(filePath));
    });
}

function removeDir(path) {
    const list = readDir(path);
    list.forEach(file => {
        const filePath = `${path}/${file}`;
        fs.unlinkSync(filePath);
    });
    fs.rmdirSync(path);
}
```

## 文件下载

使用 `Express` 提供的 `res.download()` 可以很方便的自动识别文件类型，返回对应的格式。
```js
router.get('/', function(req, res, next) {
    const filename = req.query.file;
    const path = `${downloadDir}/${filename}`;
    const exists = fileUtils.fileExists(path);
    if (!exists) return res.send(ResponseVo.error('file is not exists'));
    try {
        res.download(path);
    } catch (err) {
        res.send(ResponseVo.error(err));
    }
});
```

## 二进制流下载

### 服务端
在响应头中设置 `application/octet-stream` 等特定的属性，即可让请求返回二进制流。
```js
router.get('/stream', async function(req, res, next) {
    const filename = req.query.file;
    const path = `${downloadDir}/${filename}`;
    const exists = fileUtils.fileExists(path);
    if (!exists) return res.send(ResponseVo.error('file is not exists'));
    try {
        const data = await fileUtils.readFile(path);
        res.set('Content-Type', 'application/octet-stream');
        res.set('Content-Disposition', `attachment;filename=${filename}`);
        res.end(data);
    } catch (err) {
        res.send(ResponseVo.error(err));
    }
});
```

### 客户端
客户端接收数据时需预先约定数据接方式，再通过 `a` 标签的 `download` 属性触发下载。

```js
// axios
export function streamDownload(filename) {
  return axios({
    url: `/download/stream?file=${filename}`, method: 'get', responseType: 'blob'
  });
}

// 数据拼装
const handleStreamDownload = () => {
    const filename = 'demo.xlsx';
    streamDownload(filename).then(res => {
        const objectUrl = URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
};
```


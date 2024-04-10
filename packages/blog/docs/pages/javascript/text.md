# 文字自适应背景的若干方案


当页面元素为客户自定义上传图片等场景时，系统不能预先知道图片的主色调，进而导致该区域内字体内容视觉不明显。
## CSS3 字体阴影或描边
  将字体的颜色与字体的描边或者阴影取反色值，达到两种颜色必定能有一种颜色显眼的效果。同理，若非文字元素，可加边框。

  - 优点: 效果可控，实现成本低。
  - 缺点: 必须增加描边等额外的样式属性，可能与原设计不符。
 <img :src="$withBase('/images/stroke.gif')" alt="dock">
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .bg {
        width: 600px;
        height: 300px;
        display: table-cell;
        text-align: center;
        vertical-align: middle;
        animation-name: bg-change;
        animation-duration: 4s;
        animation-iteration-count: infinite;
        animation-direction: alternate;
      }
      .text {
        display: inline-block;
        font-size: 32px;
      }
      .stroke {
        color: #fff;
        -webkit-text-stroke: 1px #000;
      }
      .shadow {
        color: #000;
        text-shadow: 3px 3px 3px #fff;
      }
      @keyframes bg-change {
        from {
          background: #000;
        }
        to {
          background: #fff;
        }
      }
    </style>
  </head>
  <body>
    <div class="bg">
      <span class="text">
        <span class="stroke"> 我是描边 </span>
        <br />
        <span class="shadow"> 我是阴影 </span>
      </span>
    </div>
  </body>
</html>
```
## CSS3 背景混色
  借助混色模式的反色模式(或其他与场景更契合的模式)，实现动态变化元素的颜色。
  - 优点: 效果尚可，实现成本低。
  - 缺点: 效果并不完全可控。

 <img :src="$withBase('/images/difference.png')" alt="dock">
<img :src="$withBase('/images/difference.gif')" alt="dock">

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .bg {
        width: 600px;
        height: 300px;
        display: table-cell;
        text-align: center;
        vertical-align: middle;
        animation-name: bg-change;
        animation-duration: 4s;
        animation-iteration-count: infinite;
        animation-direction: alternate;
      }
      .text {
        display: inline-block;
        font-size: 32px;
        mix-blend-mode: difference;
        color: #fff;
      }
      @keyframes bg-change {
        from {
          background: #000;
        }
        to {
          background: #fff;
        }
      }
    </style>
  </head>
  <body>
    <div class="bg">
      <span class="text"> 我是文字 </span>
    </div>
  </body>
</html>
```

## Canvas 区域色值控制
 获取canvas指定区域的平均色值，计算出反色值赋予目标元素。
  - 优点: 效果可控性强。
  - 缺点: 必须借助canvas，实现成本高。
 <img :src="$withBase('/images/difference.gif')" alt="dock">
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      #text {
        position: absolute;
        top: 140px;
        left: 200px;
        font-size: 32px;
      }
    </style>
  </head>
  <body>
    <canvas id="c1" width="600" height="300"></canvas>
    <div id="text">我是文字.....</div>
    <script>
      const c1 = document.getElementById("c1");
      const text = document.getElementById("text");
      const ctx = c1.getContext("2d");

      let theme = false;

      /**
       * ArrayBuffer 转换为rgbData
       */
      function genRgbaData(data) {
        const perChunkSize = 4;
        return Array.from(data).reduce((rgba, item, index) => {
          const subIndex = Math.floor(index / perChunkSize);
          if (!rgba[subIndex]) {
            rgba[subIndex] = [];
          }
          rgba[subIndex].push(item);
          return rgba;
        }, []);
      }
      /**
       * 获取区域内的平均色值
       */
      function getColorByAvg(imgRgbaData, sizes) {
        const avgColor = {
          r: 0,
          g: 0,
          b: 0,
        };
        imgRgbaData.forEach((rgba) => {
          avgColor.r += rgba[0];
          avgColor.g += rgba[1];
          avgColor.b += rgba[2];
        });
        const area = sizes.width * sizes.height;
        avgColor.r = (avgColor.r / area) | 0;
        avgColor.g = (avgColor.g / area) | 0;
        avgColor.b = (avgColor.b / area) | 0;
        return avgColor;
      }
      /**
       * 反向色值
       */
      function getReverseColor(color) {
        const reverseColor = {
          r: 255 - color.r,
          g: 255 - color.g,
          b: 255 - color.b,
        };
        return reverseColor;
      }

      function drawImage() {
        theme = !theme;
        const imgSrc = theme ? "./imgs/light.png" : "./imgs/dark.png";
        const img = new Image();
        img.src = imgSrc;
        img.onload = function () {
          ctx.drawImage(img, 0, 0, 600, 300);
          const starX = 200,
            starY = 140,
            chunkWidth = 180,
            chunkHeight = 40;
          const ImageData = ctx.getImageData(
            starX,
            starY,
            chunkWidth,
            chunkHeight
          );
          const rgbData = genRgbaData(ImageData.data);
          const colorInfo = getColorByAvg(rgbData, {
            width: chunkWidth,
            height: chunkHeight,
          });
          const reverseColor = getReverseColor(colorInfo);
          const txtColor = `rgb(${reverseColor.r}, ${reverseColor.g}, ${reverseColor.b})`;
          text.style.color = txtColor;
        };
        const st = setTimeout(() => {
          clearTimeout(st);
          drawImage();
        }, 4000);
      }
      drawImage();
    </script>
  </body>
</html>
```
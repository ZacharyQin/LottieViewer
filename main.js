let duration = 0    //每个动画文件的总帧数
let currentFrame=0  //手势操作-当前所在的帧数
let fixedFrame=0    //手势操作-当前移动后所在的帧数
let currentRate=1   //手势操作-当前播放速率
let fixedRate=1     //手势操作-当前移动后的速率
let normalSize = $size(375, 375)  //动画大小
let btnSize=$size(45,45)          //下方按键大小
let json = $file.read('/assets/jsbox_update.json').string
let lottieJs= $file.read('/scripts/lottie.min.js').string
let html = (json, size = normalSize) => `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title></title>
</head>
<style>
    body,
    html {
        overflow: hidden;
        margin: 0;
        padding: 0;
    }

    #svgContainer {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        margin: auto;
        width: ${size.width}px;
        height: ${size.height}px;
        background-color: #fff;
    }
</style>
</head>

<body>
    <div id="svgContainer"></div>
    <script type="text/javascript">${lottieJs}</script>
    <script>
        var animationData = ${json}
        var svgContainer = document.getElementById("svgContainer")
        var animItem = bodymovin.loadAnimation({ wrapper: svgContainer, animType: "svg", loop: !0, animationData: animationData })
        setTimeout(() => {
            let duration = animItem.getDuration(true)
            $notify('getDuration', duration)
        }, 0)
        // document.getElementsByTagName("svg")[0].onclick=function(){
        //   $notify('clickedEvent', "clicked")
        // }
    </script>
</body>

</html>`
//重置播放状态
function resetPlaySpeed(){
  currentRate=1
  currentFrame=0
  $device.taptic(1);
  $("slider").value=0
  $ui.toast("1x");
  $('web').eval({
    script: `animItem.setSpeed(1)\nanimItem.play()`,
    handler:  (result, error)=> {}
  })
}

//官方lottie页面跳转
function officialPageActivity(searchText = "") {
  $ui.push({
    props: {
      title: searchText = "" ? "LottieFile.com" : searchText
    },
    views: [{
        type: "view",
        props: {
          id: "searchbarView",
        },
        layout: (make, view) => {
          make.left.right.inset(0)
          make.top.inset(-45)
          make.height.equalTo(65)
        },
        views: [{
            type: 'input',
            props: {
              id: "search",
              type: $kbType.search,
              placeholder:"some key words to search",
              darkKeyboard: true
            },
            layout:  (make, view)=> {
              make.right.top.left.inset(15)
              make.height.equalTo(30)
            },
            events: {
              returned: async  (sender)=> {
                $("webpage").url = "https://www.lottiefiles.com/search?q=" + encodeURI(sender.text)
                 $("searchbarView").updateLayout((make) => {
                    make.top.inset(-45)
                  })
                  $ui.animate({
                    duration: 0.4,
                    delay: 0,
                    damping: .5,
                    velocity: 0,
                    options: 0,
                    animation:  () =>{
                      $("hideSearch").title = "expand to search↓"
                      $("searchbarView").relayout();
                    }
                  })
                $delay(0.5,$("search").blur())
              }
            }
          },
          {
            type: "button",
            props: {
              id: "hideSearch",
              title: "expand to search↓",
              titleColor: $color("gray"),
              font: $font("Menlo-Bold", 10),
              bgcolor: $color("clear")
            },
            layout: (make, view) => {
              make.left.bottom.right.inset(0)
            },
            events: {
              tapped: (sender) => {

                if (sender.title == "fold↑") {
   
                  $("searchbarView").updateLayout((make) => {
                    make.top.inset(-45)
                  })
                  $ui.animate({
                    duration: 0.4,
                    delay: 0,
                    damping: .5,
                    velocity: 0,
                    options: 0,
                    animation:  ()=> {
                      sender.title = "expand to search↓"
                      $("searchbarView").relayout();
                    }
                  })
                   $delay(0.5,$("search").blur())
                } else {
                  $("searchbarView").updateLayout((make) => {
                    make.top.inset(0)
                  })
              

                  $ui.animate({
                    duration: 0.4,
                    delay: 0,
                    damping: .5,
                    velocity: 0,
                    options: 0,
                    animation:  () =>{
                      sender.title = "fold↑";
                      $("searchbarView").relayout();
                    }
                  })
                  $("search").focus()
                }
              },

            }
          },

        ]
      },
      {
        type: "web",
        props: {
          id: "webpage",
          url: searchText == "" ? "https://www.lottiefiles.com/popular" : `https://www.lottiefiles.com/search?q=${encodeURI(searchText)}`,
          script: `var a=document.getElementsByClassName("button is-light");
            for (i in a ){
              if(a[i].className!="show_qr button is-light"){
                a[i].onclick=function(){
                  $notify("downloadEvent", {"url": this.href})  
                }
              }
            }
          `
        },
        layout: (make, view) => {
          make.left.right.bottom.inset(0)
          make.top.equalTo($("searchbarView").bottom).offset(0)
        },
        events: {
          didStart: (sender, navigation) => {
          },didFinish: (sender, navigation) =>{
            $("webpage").eval(`lottie.setQuality("low")`)
},
          downloadEvent: async (object) => {
            $ui.toast("开始下载");
            var resp = await $http.download({
              url: object.url,
              progress:  (bytesWritten, totalBytes)=> {
                var percentage = bytesWritten * 1.0 / totalBytes
                $ui.progress(percentage, "下载中...")
              },
            });
            var file = resp.data
            if (!$file.exists("./assets/download/")) $file.mkdir("./assets/download");
            if ($file.exists("./assets/download/" + file.fileName)) {
              $ui.toast("同目录已存在同名文件")
            } else {
              $file.write({
                data: file,
                path: "./assets/download/" + file.fileName
              });
              $ui.toast("下载完成 :" + file.fileName);
              if(/.zip$/.test(file.fileName)){
                $ui.toast("检测为压缩包格式，解压中");
                let unZipPath="./assets/download/"+file.fileName.split(".")[0]
                !$file.exists(unZipPath)?$file.mkdir(unZipPath):false;
                console.log(unZipPath)
                $archiver.unzip({
                   file: file,
                   dest: unZipPath,
                   handler: (success) =>{
                      $ui.toast("解压完毕")
                     }
                })
              }
            }
          },
        }
      },
    ],
    events: {
      disappeared:  ()=> {
      },
      dealloc:  () =>{}
    }
  });
}

//获取本地动画文件
function getJsonIn(parentFolder, jsonList) {
  let list = $file.list(parentFolder);
  for (var i in list) {
    var pointer = parentFolder + "/" + list[i]
    if ($file.isDirectory(pointer)) {
      getJsonIn(pointer, jsonList)
    } else {
      if (!/^\./.test(list[i])&&/.json$/.test(list[i]) && !/^config.json$/.test(list[i])) {
        jsonList.push({
          matrixWeb:{
            html:html($file.read(pointer).string, $size(185, 185))
          },
          animationName:{
            text:list[i],
            path:pointer
          }
        })
      }else{
        if(/.zip$/.test(list[i])){
          let unZipPath="./assets/download/"+list[i].split(".")[0]
               if(!$file.exists(unZipPath)){
                 $file.mkdir(unZipPath)
                 $archiver.unzip({
                   file: $file.read(pointer),
                   dest: unZipPath,
                   handler: (success)=> {
                    $ui.toast("解压完毕,重新打开以查看新增内容") 
                   }
                 })
               }
        }
      }
    }
  }
}
function insertData() {
  let jsonList = []
  getJsonIn(".", jsonList)
  $("selectView").data=jsonList
}

//本地动画gallery
function localAnimateAcitivity() {
  $ui.push({
    props: {
      title: "Select animate"
    },
    views: [{
      type: "matrix",
      props: {
        id: "selectView",
        // data:listData,
        columns: 2,
        itemHeight: 195,
        spacing: 5,
        radius: 10, //圆角,
        template: {
          views: [{
            type:"view",
            props:{
              radius: 10,
              borderWidth: 1,
              borderColor: $color("#e8e8e8"),
            },
            layout: (make, view) =>{
              make.top.bottom.left.right.equalTo(0);
              make.height.equalTo(view.super);
              make.width.equalTo(view.super);
            },
            views:[
              {
                type: "web",
                props: {
                  id:"matrixWeb",
                  scrollEnabled: !1,
                  showsProgress: !1,
                  userInteractionEnabled:false
                },
                layout: (make,view)=>{
                  make.top.left.right.inset(0)
                  make.height.equalTo(185)
                },
                events: {
                  getDuration:  (frame)=> {
                  },
                  clickedEvent:  (str)=> {
                  }
                }
              },
              {
                type:"label",
                props:{
                  id:"animationName",
                  align:$align.center,
                  font:$font(13),
                  lines:2
                },
                layout:(make,view)=>{
                  make.left.right.inset(0)
                  make.bottom.inset(5)
                }
              }
            ]
          },
        ]
        }
      },
      layout: $layout.fill,
      events:{
        didSelect: (sender, indexPath, data)=> {
          console.log()
          $("web").html=html($file.read(data["animationName"]["path"]).string)
          resetPlaySpeed()
          $ui.pop();
        }
      }
    },
  ],
    events: {
      appeared:()=>{
        insertData()
      },
      disappeared: ()=> {
      },
      dealloc: ()=> {}
    }
  });
}



let img = name => {
  $image.png
}
$app.autoKeyboardEnabled = true
$ui.render({
  props: {},
  views: [{
      type: "button",
      props: {
        id: "scan",
        icon: $icon("018", $color("gray"), $size(30, 30)),
        bgcolor: $color("clear")
      },
      layout: (make, view) => {
        make.left.top.inset(15)
      },
      events: {
        tapped: async (sender) => {
            var result = await $qrcode.scan()
            if ((typeof result) == "undefined") {
              $ui.toast("canceled")
            } else {
              $('web').html = html($file.read('/assets/loading.json').string)
              let {
                data
              } = await $http.get(result)
              json = JSON.stringify(data)
              $('web').html = html(json)
              resetPlaySpeed()
            }
          },
          longPressed: (sender) => {
            $('web').eval({
              script: `animItem.stop()`,
              handler:  (result, error)=> {}
            })
            officialPageActivity()
          }
      }
    },
    {
      type: 'input',
      props: {
        id: "inputUrl",
        type: $kbType.search,
        darkKeyboard: true,
        placeholder:"Url or KeyWords"
      },
      layout:  (make, view) =>{
        make.left.inset(60)
        make.top.right.inset(15)
        make.height.equalTo(30)
      },
      events: {
        returned: async  (sender)=> {
          let webReg = /^(?=^.{3,255}$)(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)*(\/\w+\.\w+)*([\?&]\w+=\w*)*$/
          $delay(0.5, $("inputUrl").blur())
          if (!!sender.text.match(webReg)) {
            $('web').html = html($file.read('/assets/loading.json').string)
            let {
              data
            } = await $http.get(sender.text)
            json = JSON.stringify(data)
            $('web').html = html(json)
            resetPlaySpeed()
          } else {
            officialPageActivity(sender.text)
          }
        }
      }
    },
    {
      type:"view",
      props:{
        id:"webContainer"
      },
      layout:(make,view)=>{
        make.top.equalTo($('inputUrl').bottom).inset(5)
        make.left.right.inset(4)
        make.bottom.inset(160)
      },
      views:[
        {
          type: 'web',
          props: {
            id: 'web',
            scrollEnabled: !1,
            showsProgress: !1,
            userInteractionEnabled:false,
            html: html(json)
          },
          layout: (make, view) => {
            make.edges.inset(0)
          },
          events: {
            getDuration:  (frame)=> {
              duration = frame-1
              $('slider').max = duration
              // $('slider').value=
            },
            clickedEvent:  (str)=> {},
            didClose:  (sender)=> {},
          }
        },
      ],
      events:{
        touchesBegan: (sender, location) =>{
          $cache.set("initLocation", location);
          $cache.set("horizontalEnabled", true);
          $cache.set("verticalEnabled", true);
          $cache.set("checked", false);
          $cache.set("horizontalFixed", false);

        },
        touchesMoved: (sender, location) =>{
          let loctaion0=$cache.get("initLocation");
          let deltaX=location["x"]-loctaion0["x"]
          let deltaY=loctaion0["y"]-location["y"]
          let cosa=Math.abs(deltaX/Math.sqrt(deltaX*deltaX+deltaY*deltaY))
          let cosb=Math.abs(deltaY/Math.sqrt(deltaX*deltaX+deltaY*deltaY))
          if($cache.get("horizontalEnabled")&&cosa>Math.cos((Math.PI)/6)){
            if(!$cache.get("checked")){
              $cache.set("checked", true);
              $cache.set("verticalEnabled", false);
            }
            $cache.set("horizontalFixed", true);
          }else if($cache.get("verticalEnabled")&&cosb>Math.cos((Math.PI)/6)){
            if(!$cache.get("checked")){
              $cache.set("checked", true);
              $cache.set("horizontalEnabled", false);
            }
          }
          if ($cache.get("horizontalEnabled")&&$cache.get("checked")){
            let totalWidth=$('web').frame.width
            let rate=deltaX/totalWidth*1.25
            let frame=(currentFrame+rate*duration)<0?0:(currentFrame+rate*duration)
            frame=frame<=duration?frame:duration
            fixedFrame=frame
            $("slider").value=frame
            $ui.toast(frame.toFixed(0) + ' frame')
            $('web').eval({
              script: `animItem.goToAndStop(${frame.toFixed(0)}, true)`,
              handler:  (result, error) =>{}
            })
          }
          if($cache.get("verticalEnabled")&&$cache.get("checked")){
            let rate=(currentRate+deltaY*2/$('web').frame.height)<0?0:(currentRate+deltaY*2/normalSize.height)
            fixedRate=rate
            $ui.toast(rate.toFixed(2) + 'x')
            $('web').eval({
            script: `animItem.setSpeed(${rate})`,
            handler:  (result, error)=> {}
          })
          }
        },
        touchesEnded: (sender, location) =>{
          $cache.set("horizontalEnabled", true);
          $cache.set("verticalEnabled", true);
          $cache.set("checked", false);
          currentFrame=fixedFrame
          currentRate=fixedRate
          if(!$cache.get("horizontalFixed")){
          $('web').eval({
            script: `animItem.play()`,
            handler:  (result, error) =>{}
          })
          $cache.set("horizontalFixed", false);
        }
        },
        doubleTapped: (sender)=> {
          currentRate=1
          currentFrame=0
          $device.taptic(1);
          $("slider").value=0
          $ui.toast("1x");
          $('web').eval({
            script: `animItem.setSpeed(1)\nanimItem.play()`,
            handler:  (result, error)=> {}
          })
        }
      }
    },
    {
      type: 'stepper',
      props: {
        max: 5.0,
        min: 0.25,
        value: 1,
        step: 0.25
      },
      layout:  (make, view)=> {
        // make.right.inset(15)
        make.centerX.inset(0)
        make.height.equalTo(12)
        make.bottom.inset(145)
      },
      events: {
        changed:  (sender)=> {
          $ui.toast(sender.value + 'x')
          $('web').eval({
            script: `animItem.setSpeed(${sender.value})`,
            handler:  (result, error)=> {}
          })
        }
      }
    },
    {
      type: 'slider',
      props: {
        value: 0,
        max: 1.0,
        min: 0
      },
      layout:  (make, view) =>{
        make.bottom.inset(90)
        make.left.right.inset(15)
      },
      events: {
        changed:  (sender) =>{
          $ui.toast(~~sender.value + ' frame')
          $('web').eval({
            script: `animItem.goToAndStop(${~~sender.value}, true)`,
            handler:  (result, error) =>{}
          })
        }
      }
    },
    {
      type: "view",
      props: {
        id:"buttonContainer",
        borderColor: $color("black"),
        borderWidth: 2,
        smoothRadius: 20
      },
      layout: (make, view) => {
        make.height.equalTo(60)
        make.left.right.inset(15)
        make.bottom.inset(20)
      },
      views: [{
          type: "button",
          props: {
            id: "OPEN",
            image: $file.read("./assets/picture.png").image,
            bgcolor: $color("clear")
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super.centerY)
            make.left.inset(15)
            make.size.equalTo(btnSize)
          },
          events: {
            tapped: (sender) => {
              $('web').eval({
                script: `animItem.stop()`,
                handler:  (result, error) =>{}
              })
              localAnimateAcitivity()
            }
          }
        },
        {
          type: "button",
          props: {
            id: "PLAY",
            image: $file.read("./assets/play.png").image,
            bgcolor: $color("clear")
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super.centerY)
            make.left.inset(80) 
            make.size.equalTo(btnSize)
          },
          events: {
            tapped: (sender) => {
              $('web').eval({
                script: `animItem.${sender.id.toLocaleLowerCase()}()`,

                handler:  (result, error) =>{}
              })
              $ui.toast(sender.id);
            }
          }
        },
        {
          type: "button",
          props: {
            id: "PAUSE",
            image: $file.read("./assets/pause.png").image,
            bgcolor: $color("clear")
          },
          layout: (make, view) => {
            make.center.equalTo(view.super.center)
            make.size.equalTo(btnSize)
          },
          events: {
            tapped: (sender) => {
              $('web').eval({
                script: `animItem.${sender.id.toLocaleLowerCase()}()`,
                handler:  (result, error) =>{}
              })
              $ui.toast(sender.id);
            }

          }
        },
        {
          type: "button",
          props: {
            id: "STOP",
            image: $file.read("./assets/stop.png").image,
            bgcolor: $color("clear")
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super.centerY)
            make.right.inset(80)
            make.size.equalTo(btnSize)
          },
          events: {
            tapped: (sender) => {
              $('web').eval({
                script: `animItem.${sender.id.toLocaleLowerCase()}()`,
                handler:  (result, error)=> {}
              })
              $ui.toast(sender.id);
            }
          }
        },
        {
          type: "button",
          props: {
            id: "SHARE",
            image: $file.read("./assets/share.png").image,
            bgcolor: $color("clear")
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super.centerY)
            make.right.inset(15)
            make.size.equalTo(btnSize)
          },
          events: {
            tapped: (sender) => {
              $share.sheet(html(json))
              $ui.toast(sender.id);
            }
          }
        }
      ]
    }
  ],
  events: {
    appeared:  () =>{
    },
    disappeared:  ()=> {
    },
    dealloc:  ()=> {
    }
  }
})
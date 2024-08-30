# 当前

- https://github.com/mar10/fancytree/wiki 学习这个用法 https://poe.com/chat/3jo4e13rqqubov30wx1

- 学习常规的 [pdf跳转](obsidian://open?vault=%E6%97%A5%E8%AE%B0%E7%BB%9F%E8%AE%A1&file=%E6%80%9D%E8%80%83%2F%E6%9C%AA%E5%91%BD%E5%90%8D)


- 修改从服务端获取clip的逻辑,考虑到将来clip数量众多,我们只按需获取加载的clip,因此还需要修改clip的数据结构上一级是页码,才能在需要加载的时候下载.

- create clip的时候,超出边界应该修正

  
  
  

# 待办

- clip在创建完成的状态下,hover可高亮曾经选中的,并提前他的zindex

  

- clip的选择后添加一个工具条(复制链接|添加到当前(正面|背面)|添加到新增(正面|背面)|删除|添加评论)

  

- 删除旋转功能

- clip创建完成后应与后端通信,回传clip数据

- clip数据的读取

  

- outline修改的保存

- outline右键.底部添加操作按钮(重命名,重定向,移动,删除,添加)

- clip在page刷新时应保持相对位置不变

- allRelatedCard按钮添加

- reviewCard按钮添加

    - 实现点击开始复习

- PDFOutlineObj

    - uuid

    - items

        - List[]

            - name

            - page

            - items

    - created

    - last_edit

    - pdf_uuid

  
  

- tooltip修改

    - 删除原有的tooltip,最好直接转换

    - 给按钮添加好用的toolTip

  
  

- 挂靠卡片对象(LoadedCardObj)

    - card_desc

    - card_id

    - front

    - back

  

- 挂靠卡片列表(loadedCardList)

    - 注:一个独立于其他窗口的卡片列表窗口.

    - 新建卡片

    - 删除卡片

  

- 将卡片添加到当前PDF浏览器

  
  

- 新的HTML临时对象(TempClipBox)

    - 确定

    - 取消

  

- 新的HTML对象(ClipBox)

    - 删除

    - 编辑文字

    - 编辑尺寸

    - 添加到新卡片

        - 正面

        - 背面

    - 添加到选中卡片

        - 正面

        - 背面

- PDFClipinfo 中要添加一个copylink的按钮

- 实现复制PDFViewer为anklink的功能,打开就能回到上次阅读的位置.

  
  

# 已完成
2024年8月30日21:00:31
- 点击pick_clip之后要发布一个事件,使得所有的clip_layer可以被点击

  - 设置BtnPickClips的idfinder

  - 设置addeventlistener

  - 设置响应函数, 调整所有的clip_layer的pointer-event

  - 将create和operate分成两个class再放到clip-system class中

    - 先实现单独的class 再从中抽象出共同的class
  - 目前存在一个无法正常地添加clear_pointer_events 的问题.下次来解决


2024年8月30日16:20:46

- 在create状态下,(点击右键,点击添加书签)自动结束状态,

  
  

2024年8月29日01:17:42

- 删除(viewAttachments,viewLayers)按钮

- 检查插件中跳转到github仓库的地址是否已经更改

  
  

2024年8月28日20:53:06

- 摸索了fluent的翻译功能,后面可以用起来

2024年8月28日17:52:57

- 添加tooltip功能,减少文字描述,用图片展示.

  

2024年8月28日16:50:26

- 新建一个按钮叫pick_clip

  

2024年8月22日16:34:17

- clip_layer的创建

  

2024年8月21日20:54:50

- 搞明白page刷新的信号在哪里释放,然后尝试接入clip重绘

    - 找到重绘的事件,还有page加载事件 setScaleUpdatePages

    - this.eventBus.on("pagerendered",(data)=>console.log(data))

2024年8月21日18:08:12

- 新增一个小功能,从后端发toast到前端.

  

2024年8月19日17:51:52

- outline数据的读取

- 转换后Outline数据的上传

- 删除原有的outline加载方式

- 添加新的outline加载方式

    - create_outline 函数

- 后台配合outline数据的生成

- PDFViewer的书签功能修改

    - 从数据库加载书签,不从本身加载,只在第一次打开书本的时候获取.

        - 判断书籍是否发生过一次书签的获取

    - 学习pdf_outline_viewer.js中的 render({ outline, pdfDocument }) 函数,理解如何获取正确的dest

    - pdf_link_service.js中async goToDestination(dest) 函数的dest参数是如何获取的?

    - PDFViewerApplication.pdfViewer.linkService.goToPage(1)

    - PDFViewerApplication.pdfViewer.currentPageNumber

  

    - 实现书签的添加和删除

        - 修改书签的加载逻辑

        - 新增书签的添加逻辑

    - 怎样转换原有的大纲为给定的格式并保存

        - 要把 destination 的参数转换为常人可看懂的

        - const outline = await PDFViewerApplication.pdfDocument.getOutline()

        - const [ref] = outline[0].dest

        - const pagenum = await PDFViewerApplication.pdfDocument.getPageIndex(ref)+1

  

2024年8月18日15:24:54

- clips预留种类区分

  

2024年8月18日15:20:09

- 修改render函数中的相关outline树构建的代码.

    - this._bindLink(element, item);

    - this._setStyles(element, item);

    - this._addToggleButton(div, item);

2024年8月17日17:14:47

- outline数据的转换

  

2024年8月16日14:18:54

- 抽象python上的各种DataBase对象为一个ProtoDataBase

  

2024年8月13日15:59:00

- 解决keydown覆盖问题

- 换CSS加载文件为本地文件

  

2024年8月13日13:23:30

- PDFinfoObj中添加lastReadPage信息,大纲的uuid信息

- PDFViewer工具栏的修改

    - 去掉全部工具

    - 新增

        - 添加书签(ButtonAddBookmark)

        - 添加书签弹窗配置

            - 需要学习搜索弹出怎么实现

            - id="findbar"

            - 搜索弹出是一个隐藏的元素,点击按钮后显示

        - 添加标注(ButtonAddClip)

        - 添加标注动作

2024年8月8日23:22:44

- editToolbar删除(完成,将注册鼠标拖拽事件的函数注释了)

  

2024年8月8日17:39:30

- 项目上传github

  

- 实现封面图加载的机制

  - 1 实现pdfinfo加载封面图片

  - 2 实现当无封面图片时,需要用户先打开一次PDF,然后自动保存第一张图片

  

# 放弃

- 文件保存用uuid替代文件原名,文件的MD5值计算
# 当前

- 文件保存用uuid替代文件原名.

# 待办
- clip创建完成后应与后端通信
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


已完成
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

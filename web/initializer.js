async function init_inject(callback){
    const response = await fetch('./web/viewer.html')
    const data = await response.text()
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');
    const bodyContent = doc.body.innerHTML;
    document.getElementById('pdf-container').innerHTML = bodyContent;
    // 等待下一次事件循环，以确保 DOM 已经更新
    await new Promise(requestAnimationFrame);
    callback()
}

export {init_inject}
function uint8ArrayToBase64(uint8Array) {
    return new Promise((resolve, reject) => {
        // 创建一个 Blob 对象
        const blob = new Blob([uint8Array]);
  
        // 创建 FileReader 对象
        const reader = new FileReader();
        reader.onloadend = () => {
            // 获取 Data URL 并移除前缀部分
            const dataUrl = reader.result;
            const base64String = dataUrl.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
  
        // 将 Blob 对象读取为 Data URL
        reader.readAsDataURL(blob);
    });
    // return btoa(String.fromCharCode.apply(null, uint8Array));
}

self.onmessage =async (event) => {
    const { data,url,filename } = event.data;
    const b64_data = await uint8ArrayToBase64(data);
    const json_data_str = JSON.stringify({ data:b64_data,url,filename });
    console.log(json_data_str);
    const socket = new WebSocket("ws://localhost:1027");
    socket.onopen = () => {
        socket.send(json_data_str);
    }
    // self.postMessage({ data: b64_data, url: url, filename: filename });
    // self.postMessage({ data: data, url: url, filename: filename }, [data.buffer]);
    // console.log(event)
}
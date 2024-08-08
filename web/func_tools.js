export function uint8ArrayToBase64(uint8Array) {
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
}
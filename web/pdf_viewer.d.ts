// global.d.ts
interface Backend{
    save_thumbnail:(base64_string:string)=>Promise<string>;
    upload_pdf_outline:(outline_data_str:string)=>Promise<string>;
    fetch_pdf_outline:(outline_uuid:string)=>Promise<string>;
    fetch_pdf_info:()=>Promise<string>;
}

interface Window {
  backend:Backend;
}
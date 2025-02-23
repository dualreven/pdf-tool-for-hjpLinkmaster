import { To } from "copy-webpack-plugin";

// global.d.ts
declare interface Backend{
    save_thumbnail:(base64_string:string)=>Promise<string>;
    upload_pdf_outline:(outline_data_str:string)=>Promise<string>;
    fetch_pdf_outline:(outline_uuid:string)=>Promise<string>;
    fetch_pdf_info:()=>Promise<string>;
    
}
declare interface Notify{
  close:()=>void;
}

declare interface Toast{
  info:(title:string,msg:string,auto_close:boolean)=>Notify;
  error:(title:string,msg:string,auto_close:boolean)=>Notify;
  success:(title:string,msg:string,auto_close:boolean)=>Notify;
  warning:(title:string,msg:string,auto_close:boolean)=>Notify;
}

declare global {
  interface Window {
    backend:Backend;
    toast:Toast;
  }




  
}
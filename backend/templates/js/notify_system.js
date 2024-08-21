// import {Notify} from './simple-notify.min.js'

function defaultNotify(status){
  return (title,msg,auto_close=true)=>{
    return new Notify ({
      status: status,
      title:title,
      text: msg,
      effect: 'slide',
      speed: 300,
      customClass: '',
      customIcon: '',
      showIcon: true,
      showCloseButton: true,
      autoclose: auto_close,
      autotimeout: 3000,
      notificationsGap: null,
      notificationsPadding: null,
      type: 'filled',
      position: 'right bottom',
      customWrapper: '',
    })
  }
}
const toast_success = defaultNotify('success')
const toast_info = defaultNotify('info')
const toast_warning = defaultNotify('warning')
const toast_error = defaultNotify('error')

function register_toast_to_window()
{
  window.toast = {
    success:toast_success,
    info:toast_info,
    warning:toast_warning,
    error:toast_error
  }

}


export {toast_success,toast_info,toast_warning,toast_error,register_toast_to_window}
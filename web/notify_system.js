import Notify from 'simple-notify'

function defaultNotify(status,title,msg){
  return (title,msg)=>{
    new Notify ({
      status: status,
      title:title,
      text: msg,
      effect: 'slide',
      speed: 300,
      customClass: '',
      customIcon: '',
      showIcon: true,
      showCloseButton: true,
      autoclose: true,
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

export {toast_success,toast_info,toast_warning,toast_error}
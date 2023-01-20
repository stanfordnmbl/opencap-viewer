import moment from 'moment'

export default (Vue) => {
  Vue.filter("dateTime", val => !val? val: moment(val).format('MMM. DD, YYYY, h:mm a'));
  Vue.filter("date", val => !val? val: moment(val).format('MMM. DD, YYYY'));
  Vue.filter("time", val => !val? val: moment(val).format('h:mm a'));
}

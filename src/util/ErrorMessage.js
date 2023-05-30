/**
 * Error message processing
 * @module util/ErrorMessage
 */
import Vue from 'vue'

/**
 * Format object field depending on field type
 * @param {String} key - object field name
 * @param {String} value - object field value
 * @returns {String} - formatted field value string
 */
function getField (key, value) {
  return key === 'non_field_errors'
    ? value
    : `${key}: ${value}<br/>`
}

/**
 * Processes error object and returns error message string
 * @param {Object} error - error object
 * @param {String} operation - optional operation name string
 * @returns {String} - extracted & formatted error message
 */
function processErrorMessage (err, operation) {
  // switch to response object
  let error = err.response ? err.response : err

  // message caption
  let res = ""


  // if error is object
  if (typeof(error) === "object") {
    if (error.data && typeof(error.data) === "object") {

      Object.keys(error.data).forEach(key => {
        let x = error.data[key]

        if (Array.isArray(x)) {
          x.forEach(y => {
            res += y
          })
        } else {
          res += x
        }
      })
    } else {
      res += `${error.toString()}`
    }

    // status text and code
/*    if (error.statusText) {
      res += `<br/>HTTP status: ${error.statusText}`

      if (error.status) {
        res += ` (${error.status})`
      }
    } else {
      // check for HTTP status without statusText
      if (error.status) {
        res += `<br/>HTTP status code: ${error.status}`
      }
    }*/
  } else {
    if (Array.isArray(error)) {
      res += error.join('<br/>')
    } else {
      // should be a string
      res += `${error}`
    }
  }

  return res
}

/**
 * Show error message with close button
 * Uses processErrorMessage for error object handling
 * @param {Object} error - error object
 * @param {String} operation - optional operation name string
 */
function apiError (error, operation) {
  if (error == "Error: Network Error") {
    error = "Something went wrong! Our server is currently down. Please try again later."
  }
  Vue.toasted.error(processErrorMessage(error, operation),{duration: 10000})
}
/**
 * Shorthand for successful toast message
 * @param {String} text - message text
 */
function apiSuccess (text) {
  Vue.toasted.success(text, {duration: 10000})
}
/**
 * Shorthand for info toast message
 * @param {String} text - message text
 */
 function apiInfo (text) {
  Vue.toasted.info(text, {duration: null})
}

/**
 * Pass this a trial with an error in meta
 */
function apiErrorRes (axiosRes, defaultText) {
  if (axiosRes && axiosRes.data && axiosRes.data.meta && axiosRes.data.meta.error_msg) {
    apiError(axiosRes.data.meta.error_msg)
  } else {
    apiError(defaultText)
  }
}

export {
  processErrorMessage,
  apiError,
  apiSuccess,
  apiErrorRes,
  apiInfo
}

const {ipcRenderer, remote} = require('electron')
const GinboxApi = require('./GinboxApi')
const { WB_BROWSER_GOOGLE_INBOX_TOP_MESSAGE_CHANGED } = remote.require('./shared/ipcEvents')
const MAX_MESSAGE_HASH_TIME = 1000 * 60 * 10 // 10 mins

class GinboxChangeEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.state = {
      messageHash: this.currentMessageHash,
      messageHashTime: new Date().getTime()
    }
    this.latestMessageInterval = setInterval(this.recheckMessageHash.bind(this), 1000)
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get isInboxTabVisible () {
    const elm = document.querySelector('nav [role="menuitem"]') // The first item
    return window.getComputedStyle(elm).backgroundColor.substr(-4) !== ', 0)'
  }

  get currentMessageHash () {
    const estimatedCount = GinboxApi.getVisibleUnreadCount()
    const topItem = document.querySelector('[data-item-id]')
    const topHash = topItem ? topItem.getAttribute('data-item-id') : '_'
    return `${estimatedCount}:${topHash}`
  }

  /* **************************************************************************/
  // Event Handlers
  /* **************************************************************************/

  /**
  * Re-checks the top message id and fires an unread-count-changed event when
  * changed
  */
  recheckMessageHash () {
    const now = new Date().getTime()
    const nextMessageHash = this.currentMessageHash

    if (now - this.state.messageHashTime > MAX_MESSAGE_HASH_TIME || (this.isInboxTabVisible && this.state.messageHash !== nextMessageHash)) {
      this.state.messageHash = nextMessageHash
      this.state.messageHashTime = now
      ipcRenderer.sendToHost({
        type: WB_BROWSER_GOOGLE_INBOX_TOP_MESSAGE_CHANGED,
        data: { trigger: 'periodic-diff' }
      })
    }
  }
}

module.exports = GinboxChangeEmitter

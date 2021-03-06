import OSSettings from 'shared/Models/Settings/OSSettings'
const os = window.nativeRequire('os')

class NotificationPlatformSupport {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get enhancedSupportDarwin () { return process.platform === 'darwin' }
  get enhancedSupportLinux () { return process.platform === 'linux' }
  get enhancedSupportWin32 () {
    if (process.platform === 'win32') {
      const major = parseInt(os.release().split('.')[0])
      return major >= 10
    }
    return false
  }

  /* **************************************************************************/
  // Query
  /* **************************************************************************/

  /**
  * Checks to see if thie provider is supported on this platform
  * @param provider: the provider to check
  * @return true if the provider is supported, false otherwise
  */
  supportsProvider (provider) {
    if (provider === OSSettings.NOTIFICATION_PROVIDERS.ELECTRON) {
      return true
    } else if (provider === OSSettings.NOTIFICATION_PROVIDERS.ENHANCED) {
      if (process.platform === 'darwin') {
        return this.enhancedSupportDarwin
      } else if (process.platform === 'linux') {
        return this.enhancedSupportLinux
      } else if (process.platform === 'win32') {
        return this.enhancedSupportWin32
      }
    }

    return false
  }
}

module.exports = new NotificationPlatformSupport()

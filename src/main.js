const VaultSyncManager = require('./sync/VaultSyncManager')
const Path = require('path')

/**
 * helper script to launch aem sync via shell
 * use method 'push' or 'pull' as first arg
 * filepath for second arg
 */

const CONFIG = {
  server: 'http://localhost:4502',
  user: 'admin',
  password: 'admin',
  acceptSelfSignedCert: false,
}

class SyncManager {
  static push(path) {
    if (!path.includes('jcr_root')) {
      console.error(`path not under jcr_root folder: ${path}`)
      return
    }
    const { server, acceptSelfSignedCert, user, password } = CONFIG
    const filterPath = SyncManager.getFilterPath(path)
    VaultSyncManager.sync(
      server,
      acceptSelfSignedCert,
      user,
      password,
      path,
      filterPath,
      VaultSyncManager.PUSH
    ).then(
      () => {
        console.log(`Successfully exported: ${SyncManager.getRemotePath(path)}`)
      },
      err => {
        console.error(
          `Failed to export: ${SyncManager.getRemotePath(path)} ${err}`
        )
      }
    )
  }

  static pull(path) {
    if (!path.includes('jcr_root')) {
      console.error(`path not under jcr_root folder: ${path}`)
      return
    }
    const { server, acceptSelfSignedCert, user, password } = CONFIG
    const filterPath = SyncManager.getFilterPath(path)
    VaultSyncManager.sync(
      server,
      acceptSelfSignedCert,
      user,
      password,
      path,
      filterPath,
      VaultSyncManager.PULL
    ).then(
      () => {
        console.log(`Successfully Imported: ${SyncManager.getRemotePath(path)}`)
      },
      err => {
        console.error(
          `Failed to import: ${SyncManager.getRemotePath(path)} ${err}`
        )
      }
    )
  }

  static getFilterPath(path) {
    // get the filter.xml nearest from path
    const root = path.substring(0, path.indexOf('jcr_root') - 1)
    const filterPath = Path.join(root, 'META-INF', 'vault', 'filter.xml')
    return filterPath
  }

  static getRemotePath(path) {
    return path.substring(path.indexOf('jcr_root') + 8)
  }
}

;(async () => {
  console.log('AEM SYNC')
  const [, , method, filepath] = process.argv
  SyncManager[method](filepath)
})()

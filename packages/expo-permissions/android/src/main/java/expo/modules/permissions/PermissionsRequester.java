package expo.modules.permissions;

import org.unimodules.core.ModuleRegistry;
import org.unimodules.interfaces.permissions.PermissionsListener;
import org.unimodules.interfaces.permissions.PermissionsManager;

public class PermissionsRequester {

  private static final int PERMISSIONS_REQUEST = 13;
  private PermissionsManager mPermissionManager;

  PermissionsRequester(ModuleRegistry moduleRegistry) {
    mPermissionManager = moduleRegistry.getModule(PermissionsManager.class);
  }

  boolean askForPermissions(final String[] permissions, PermissionsListener listener) {
    if (mPermissionManager != null) {
      mPermissionManager.requestPermissions(permissions, PERMISSIONS_REQUEST, listener);
      return true;
    } else {
      return false;
    }
  }
}

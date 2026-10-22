package frc.browser;
/** Explicit browser input boundary. Not WPILib HAL or a Phoenix device implementation. */
public final class BrowserIO {
 public static boolean enabled, autonomous;
 public static double leftAxis,rightAxis;
 public static void set(boolean en,boolean auto,double left,double right){enabled=en;autonomous=auto;leftAxis=left;rightAxis=right;}
}

public class PhoenixLoadProbe {
 public static void main(String[] args) {
  boolean sim=com.ctre.phoenix6.jni.UtilsJNI.isSimulation();
  double time=com.ctre.phoenix6.jni.UtilsJNI.getCurrentTimeSeconds();
  System.out.println("PHOENIX_NATIVE_JNI_OK simulation="+sim+" time="+time);
  if(!sim)throw new AssertionError("Expected simulation library");
 }
}

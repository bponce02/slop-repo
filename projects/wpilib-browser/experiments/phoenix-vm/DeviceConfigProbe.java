import com.ctre.phoenix6.hardware.core.*;
import com.ctre.phoenix6.configs.*;
public class DeviceConfigProbe {
 public static void main(String[]args)throws Exception {
  var encoder=new CoreCANcoder(20,"sim");var motor=new CoreTalonFX(21,"sim");
  Thread.sleep(1000);
  for(double timeout:new double[]{.1,1,5}){
   long start=System.nanoTime();
   var e=encoder.getConfigurator().apply(new CANcoderConfiguration(),timeout);
   var m=motor.getConfigurator().apply(new TalonFXConfiguration(),timeout);
   System.out.println("CONFIG timeout="+timeout+" encoder="+e+" motor="+m+" seconds="+(System.nanoTime()-start)/1e9);
  }
  System.out.println("CONFIG_PROBE_DONE");
 }
}

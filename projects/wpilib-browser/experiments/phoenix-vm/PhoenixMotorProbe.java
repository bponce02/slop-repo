import com.ctre.phoenix6.hardware.core.CoreTalonFX;
import com.ctre.phoenix6.controls.VoltageOut;
public class PhoenixMotorProbe {
 public static void main(String[] args)throws Exception {
  {var motor=new CoreTalonFX(1,"sim");
   var sim=motor.getSimState();System.out.println("SUPPLY "+sim.setSupplyVoltage(12));
   for(int i=0;i<15;i++){com.ctre.phoenix6.unmanaged.Unmanaged.feedEnable(1000);var status=motor.setControl(new VoltageOut(6));Thread.sleep(20);System.out.println("MOTOR "+i+" status="+status+" volts="+sim.getMotorVoltage());}
  }
  System.out.println("PHOENIX_MOTOR_PROBE_DONE");
 }
}

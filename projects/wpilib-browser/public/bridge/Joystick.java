package edu.wpi.first.wpilibj;
/** Two keyboard-backed sticks, Y axis only. Other channels fail explicitly. */
public class Joystick implements AutoCloseable {
 private final int port;
 public Joystick(int port){if(port<0||port>1)throw new UnsupportedOperationException("Only joystick ports 0 and 1 supported");this.port=port;}
 public double getY(){return - (port==0?frc.browser.BrowserIO.leftAxis:frc.browser.BrowserIO.rightAxis);}
 public double getRawAxis(int axis){if(axis==1)return getY();throw new UnsupportedOperationException("Only Y axis (1) supported");}
 public int getPort(){return port;} public void close(){}
}

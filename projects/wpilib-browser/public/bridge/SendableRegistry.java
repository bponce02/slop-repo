package edu.wpi.first.util.sendable;
import java.util.IdentityHashMap;
/** Browser metadata only. No NetworkTables / LiveWindow publication. */
public final class SendableRegistry {
 private static final IdentityHashMap<Object,String> names=new IdentityHashMap<>(),systems=new IdentityHashMap<>();
 public static void add(Sendable s,String n){names.put(s,n);}
 public static void addLW(Sendable s,String n){add(s,n);}
 public static void addLW(Sendable s,String sub,String n){add(s,n);systems.put(s,sub);}
 public static boolean remove(Sendable s){return names.remove(s)!=null;}
 public static String getName(Sendable s){return names.getOrDefault(s,"");}
 public static void setName(Sendable s,String n){names.put(s,n);}
 public static String getSubsystem(Sendable s){return systems.getOrDefault(s,"");}
 public static void setSubsystem(Sendable s,String n){systems.put(s,n);}
}

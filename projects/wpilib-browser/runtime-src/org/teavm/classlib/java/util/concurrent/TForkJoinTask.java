package org.teavm.classlib.java.util.concurrent;

import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;

/** Single-thread compatibility subset. fork() is lazy; join/get execute the task. */
public abstract class TForkJoinTask<V> {
  private int state; // 0 pending, 1 running, 2 success, 3 failed, 4 cancelled
  private Throwable failure;
  public abstract V getRawResult();
  protected abstract void setRawResult(V value);
  protected abstract boolean exec();
  protected void fail(Throwable e) { failure=e; state=3; }
  private void runTask() {
    if (state == 1) throw new IllegalStateException("Cyclic task dependency; no parallel workers available");
    if (state != 0) return;
    state = 1;
    try {
      if (!exec()) throw new UnsupportedOperationException("Asynchronous task completion is unsupported");
      if (state == 1) state = 2;
    } catch (Throwable e) { failure = e; state = 3; }
  }
  public final TForkJoinTask<V> fork() { return this; }
  public final V join() {
    runTask();
    if (state == 4) throw new CancellationException();
    if (state == 3) {
      if (failure instanceof RuntimeException) throw (RuntimeException) failure;
      if (failure instanceof Error) throw (Error) failure;
      throw new RuntimeException(failure);
    }
    return getRawResult();
  }
  public final V invoke() { return join(); }
  public final V get() throws InterruptedException, ExecutionException {
    runTask();
    if (state == 4) throw new CancellationException();
    if (state == 3) throw new ExecutionException(failure);
    return getRawResult();
  }
  public final boolean cancel(boolean mayInterruptIfRunning) { if(state!=0)return false;state=4;return true; }
  public final boolean isDone() { return state>=2; }
  public final boolean isCancelled() { return state==4; }
}

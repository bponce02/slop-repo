#!/bin/sh
set -eu
: "${JAVA_HOME:?Set JAVA_HOME to a JDK 25 installation}"
ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
WORK=${TEAVM_BUILD_DIR:-/tmp/wpilib-teavm-build}
REV=208d4c97a602
if [ ! -d "$WORK/.git" ]; then git clone https://github.com/konsoletyper/teavm-javac.git "$WORK"; fi
cd "$WORK"
git checkout "$REV"
if git apply --check "$ROOT/patches/teavm-javac-diagnostics.patch"; then git apply "$ROOT/patches/teavm-javac-diagnostics.patch"; else git apply --reverse --check "$ROOT/patches/teavm-javac-diagnostics.patch"; fi
PATH="$JAVA_HOME/bin:$PATH" ./gradlew :compiler:buildWasmGC :compiler:buildTeaVMClassLib :compiler:generateClassLib --no-daemon --max-workers=1 '-Dorg.gradle.jvmargs=-Xmx1200m -XX:MaxMetaspaceSize=384m'
cp compiler/build/generated/teavm/wasm-gc/compiler.wasm* "$ROOT/public/vendor/"
cp compiler/build/classlib/*.bin "$ROOT/public/vendor/"
python3 "$ROOT/scripts/patch-runtime.py"
python3 "$ROOT/scripts/fetch-assets.py"

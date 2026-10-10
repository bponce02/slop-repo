# Vision Tetris agent — proof of concept

Pixels from https://play.tetris.com/ go to OpenRouter Decisions; a bounded action ID becomes real browser keyboard events. No DOM, board parser, game state, generated code, or chat fallback. The game continues during inference. Capture retains the newest frame; one model request runs at a time. Keys are released after each bounded macro, not held during inference. Menus/start are manual for now.

## Run

```sh
cd projects/vision-tetris-agent
uv sync
uv run playwright install chromium
cp .env.example .env # put your capped OpenRouter key here
uv run python agent.py --model flash
# Alternatives: --model clef or --model luna
```

Start the game manually in the visible browser, dismiss overlays, verify key bindings, click the game to focus it, then press Enter in the terminal. Do not use the browser while the agent runs. Ctrl+C stops it. Screenshots and JSONL traces go into ignored `runs/` folders.

Models: `cloudflare/clef-flash`, `cloudflare/clef`, `openai/gpt-6-luna-decisions`. All use `https://openrouter.ai/api/alpha/decisions` and top-level `state` image parts. No direct-provider billing.

Default run: 120 seconds, $1 budget, $0.05 reserved before each call, 1.5-second stale-frame cutoff. Increase cutoff only if you accept delayed inputs. Missing costs or API failures stop without retries. The reservation is conservative but **cannot guarantee a hard dollar ceiling**: a provider can bill more than reserved or charge an ambiguous failed request. Use an OpenRouter key with a $1 limit as the authoritative cap. Budget is per run; the key cap covers multiple runs. No API key is logged.

## Cheap smoke check

```sh
uv run python agent.py --smoke --headless
```

Loads the real site and saves a screenshot, without inference or game inputs. Model performance and actual gameplay require a supplied key. This is a POC, not a full Tetris solver; model latency and game key-repeat timing will affect results.

Reference: https://openrouter.ai/docs/guides/community/multimodal-decisions

## Input flows

The model now chooses from 91 finite flows: no rotation / clockwise / half turn / counterclockwise, followed by -5 to +5 horizontal taps, ending with observation or a final hard drop. `flow_cw_+2_drop` means rotate clockwise, tap right twice, then Space. Each key is held 45ms with a 35ms release gap; scheduled sequences are at most 640ms (real scheduling can be slower). Hold/swap is separate so the replacement piece is observed before further inputs. No keyboard events overlap; all keys release after each tap.

The prompt emphasizes observe → plan → execute → observe. History includes the selected flow and its actual configured key/duration list. No game-state parser or placement solver was added. Screenshots now default to the game-region crop described below; multi-frame observation remains experimental. Keyboard smoke checks passed, but gameplay gains are unverified.

## Screenshot crop

Default `--crop 285,15,390,575` extracts the game panel (board, score, hold and next) from the fixed 960x720 viewport and enlarges it 2x. This is a pixel crop, not DOM reading or game-state extraction. Adjust if the site layout changes. `--crop none` restores full-page observation. Saved decision screenshots are exactly the cropped JPEGs sent to the API. No previous-frame input has been added; existing action history remains unchanged.

## Compact decisions (current default)

Four independent choice heads share one request: rotation (4 choices), movement (-5..+5 taps), finish (observe/drop), and mode (play/hold/wait/stop). Mode gates execution; non-play modes discard the other planned inputs. The resulting sequence still uses the bounded executor above, but the model no longer receives the full 91-flow catalog. All returned heads/probabilities are saved under `answers` in the trace. Default model is now Luna. Independence means answers may conflict; no correctness guarantee is implied. Tests of live performance remain pending.

## Current policy: one question

The live agent again asks just one `action` choice question, selecting one complete bounded input sequence from the 91-flow catalog. Compact independent heads are no longer sent. Cropping, existing action history, drop-last execution, and billing logs remain. Default model remains Luna. This restores coherent single-choice sequences at the expense of a larger request.

## Current policy: basic operations

One `action` choice question now selects among 11 basic operations: idle, left/right tap, left/right hold, clockwise/counterclockwise rotation, soft drop, hard drop, hold/swap, stop. Compound flows and compact heads are removed. Cropping and existing action history remain enabled. Prior sections describing flow choices are historical.

`stop` has been removed from model choices. The model has 10 basic operations and can choose idle when gameplay is not visible. Runs end by time/budget limits, errors, or manual Ctrl+C—not a model decision.

`idle` is also removed. All nine model choices send a game input. Start/focus gameplay manually; there is no model-selected wait or stop. Time/budget limits, errors and Ctrl+C still terminate the run. During menus/transitions, the model may select an inappropriate input because abstention is unavailable.

## Local clone: isolate model quality from latency

Plain HTML/CSS/JS game, no build tools. Turn mode disables automatic gravity entirely: only Down or Space advances/locks pieces. This deliberately avoids wasting thinking time or consuming vertical space on movement/rotation. Simplified rotation kicks, seven-bag seeded pieces, next/hold, line-clear and drop scoring. Not an exact official Tetris implementation.

Terminal 1 (from project folder):
```sh
python -m http.server 8765 --bind 127.0.0.1 --directory game
```
Terminal 2:
```sh
uv run python agent.py --model luna --url 'http://127.0.0.1:8765/?mode=turn&seed=42' --crop none
```
The clone starts immediately. Press Enter in the agent terminal to begin. `--crop none` is required because the default official-site crop does not fit this layout. Use `mode=realtime` for normal gravity. Use the same seed for comparable piece order. Agent observation remains pixels only; the browser game exposes no telemetry API to the agent. Game-over requires manual Restart (agent no longer has stop/idle).

## Sequential loop (current)

The background screenshot task is removed. Each iteration captures/encodes one fresh screenshot, requests inference, validates and executes one basic operation, releases the key, waits 35ms for rendering, and then captures again. No screenshots overlap input or inference. The game still runs normally during inference unless using the clone's turn mode. Traces separate capture/encoding, API round-trip, and input-execution timing. An applied flag is logged only after successful execution; it does not verify game effect. This isolates observation scheduling, not all possible model/input problems.

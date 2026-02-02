# SPA-JSPLUS — Demo Blog (Hybrid SSR + SPA)

SPA-JSPlus Demo Blog is a **hybrid Single Page Application (SPA)** built entirely with **vanilla JavaScript** and a **custom lightweight bundler**.
This project is **not a framework or library** — it is an architectural reference that demonstrates how modern SPA behavior can be achieved with minimal tooling and strong semantic structure.

This repository showcases how to combine:

* Server-rendered HTML for SEO-friendly entry points
* Client-side hydration
* History API navigation
* Template-driven rendering
* A deterministic bundling process
* Minimal Node.js infrastructure

👉 Core repository: [https://github.com/dimaspandu/spa-jsplus](https://github.com/dimaspandu/spa-jsplus)

---

# Table of Contents

* Overview
* Architecture
* Project Structure
* How the System Works
* Bundling Strategy
* Development Workflow
* Running the Project
* Configuration
* Example Route Setup
* Demo
* Summary
* License

---

# Overview

The Demo Blog demonstrates a **Hybrid SSR + SPA architecture**:

1. The first request returns a **fully rendered HTML document**.
2. JavaScript hydrates the page.
3. Navigation is intercepted and handled client-side.
4. Subsequent transitions occur without full reloads.

This approach delivers:

✅ SEO compatibility
✅ Fast navigation
✅ Predictable rendering
✅ Minimal runtime complexity

---

# Architecture

The system is intentionally explicit and split into three major layers:

## 1. Runtime SPA Engine

Located inside:

```
src/spa
```

Responsibilities:

* Route registration (`reactor`)
* Error fallback (`err`)
* Lifecycle hooks (`notifiers`)
* Hydration
* Navigation orchestration

The runtime is started via:

```
app.tap()
```

---

## 2. Builders (View Composition)

```
src/builders
```

Builders are responsible for rendering views.

Instead of using a virtual DOM, each builder:

* Loads an HTML template
* Injects data
* Mounts into the host container

This keeps rendering deterministic and easy to debug.

---

## 3. Custom Bundler

```
/bundler
```

The project includes a lightweight bundler designed around:

* Static dependency graphs
* Explicit entry points
* Deterministic output
* Minimal transformation

It treats HTML as a **first-class dependency**, allowing templates to participate directly in the module graph.

---

# Project Structure

```
.
├── bundler/        # Custom JavaScript bundler
├── dist/           # Production output
├── doc/            # Diagrams and screenshots
├── src/
│   ├── builders/   # View builders
│   ├── helpers/    # Navigation + DOM helpers
│   ├── hydrators/  # Hydration logic
│   ├── models/     # Data models
│   ├── pages/      # HTML templates
│   ├── spa/        # SPA runtime engine
│   ├── styles/     # CSS modules / styles
│   ├── utils/      # Utility functions
│   ├── app.js
│   ├── globals.css
│   ├── index.html
│   ├── index.js
│   └── pre-index.js  # Bundle entry
│
├── config.json
├── run.dev.js
├── run.bundle.js
├── run.start.js
└── README.md
```

---

# How the System Works

## Initial Request (SSR-like Entry)

When a browser requests a path:

1. The server returns a full HTML document.
2. CSS is applied.
3. JavaScript executes.
4. The SPA hydrates the DOM.

---

## Client-side Navigation

Navigation is intercepted and executed via the History API:

* `pushState` updates the URL
* Templates are fetched or resolved
* Builders render the next view
* Notifiers handle transitions

No full reload occurs.

---

## Error Handling

Two layers exist:

**Server-level**

* Missing assets → 404

**SPA-level**

* Unknown routes → custom 404 builder
* Rendering failures → 500 builder

---

# Bundling Strategy

The bundler starts from:

```
src/pre-index.js
```

This file intentionally imports:

* Global CSS
* HTML templates
* Application runtime

Example:

```js
import "./globals.css";
import "./index.html";
import "./pages/about.html";
import application from "./index.js";

(() => application)(application);
```

The no-op invocation ensures the runtime remains inside the dependency graph.

---

# Development Workflow

## Dev Server (No Bundling)

Start a lightweight static server that serves **source files directly**:

```bash
node run.dev.js
```

Server characteristics:

* No transformation
* No bundling
* Instant reload workflow
* SPA fallback support

Default port is defined in `config.json`.

---

## Bundle Only

```bash
node run.bundle.js
```

Outputs optimized assets into:

```
dist/
```

---

## Production-like Mode

Build and serve bundled output:

```bash
node run.start.js
```

This script:

1. Executes the bundler
2. Serves `/dist`
3. Enables SPA fallback

---

# Configuration

`config.json`

```json
{
  "entry": "src/pre-index.js",
  "devDir": "src",
  "outputDir": "dist",
  "uglified": true,
  "port": 4503
}
```

### Fields

**entry** — Root of the dependency graph
**devDir** — Directory served by the dev server
**outputDir** — Production build target
**uglified** — Enables minification
**port** — Server port

---

# Example Route Setup

```js
app.reactor(["", "/", "/home"], homeBuilder, error500Builder);
app.reactor("/about", aboutBuilder, error500Builder);
app.reactor("/{slug}", singleBuilder, error500Builder);

app.err(error404Builder);

app.addNotifier("transition", setTransition);
app.addNotifier("meet", setTransition);

app.tap();
```

This demonstrates:

* Static routes
* Dynamic routes
* Error fallback
* Lifecycle hooks

---

# Demo

Live demo:

👉 [https://spademoblog.netlify.app/](https://spademoblog.netlify.app/)

Demonstrates:

* SSR-style initial load
* SPA transitions
* Template rendering
* Back/forward navigation
* Error handling

---

# Summary

SPA-JSPlus Demo Blog is intentionally designed to be:

* Educational
* Explicit
* Minimal
* Deterministic
* Framework-independent

It is ideal for developers who want to deeply understand how SPA systems work beneath modern abstractions.

---

# License

MIT License — free to use, modify, and study.

# Rhinestone Relayer

**A Minimal Example Repo to Demonstrate How to Fill OmniAccount Bundles on Across**

> **Important:** This is a demo script. Please reach out on Discord before filling any bundles. [Join Discord Channel](https://discord.com/channels/887426921892315137/1333280423920402464).

### Quick Guide

- `src/app.ts`: Listens for bundles sent from the orchestrator.
- `src/filler.ts`: Fills the received bundles on the destination chain.
- `src/claimer.ts`: Claims filled bundles on the origin chains.
- `src/bundleGenerator.ts`: The `generateBundle` function enables relayers to create mock bundles for testing. Our default relayer skips bundles with `outputAmount = 1` to ensure fair testing for other relayers.

### Requirements

To interact with most Orchestrator functions, you'll need an API key. If you're interested in relaying on our system, please get in touch.

### Contributing

We welcome contributions! To request features, propose changes, or discuss improvements:
- Open a Pull Request (PR)
- Start a discussion in the repo
- Reach out directly via Discord
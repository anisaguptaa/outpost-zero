# Outpost Zero

An interactive mission game for ages 7–12. Lead a Moon or Mars outpost, balance critical resources, respond to mission events, and learn why each decision matters.

## Game loop

Briefing → Choose a world → Prepare the outpost → Play a mission day → Respond to an event → See consequences → Debrief

## Experience goals

Outpost Zero should feel like a small adventure game: an illustrated outpost to explore, crew characters, a mission-control HUD, purposeful transitions, and decisions with visible consequences.

## Stack

- React + Vite for menus, story, HUD, and mission flow.
- Phaser 3 for the interactive outpost scene.
- FastAPI and Python for mission state and simulation rules.
- Shared JSON contracts for integration.

## Work split

- Person 1 owns onboarding, briefing, destination choice, HUD, progression, saves, and debrief.
- Person 2 owns the world scene, buildings, interactions, resource rules, events, decisions, and NASA data adapters.
- Coordinate shared contracts before integrating. Person 1 owns app routing; Person 2 exports game components.

Use separate branches: `frontend-experience` and `gameplay-simulation`. Merge through pull requests into `main`.

## MVP scope

- Moon and Mars; 7–10 mission days for the demo.
- Power, oxygen, water, food, crew health, and radiation risk.
- Five or six interactive structures and 8–10 authored events.
- Explain consequences clearly and distinguish NASA observations, derived calculations, and fictional training scenarios.

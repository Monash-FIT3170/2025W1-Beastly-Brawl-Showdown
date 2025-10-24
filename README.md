# 2025W1-Beastly-Brawl-Showdown

## Team Members
Jamie Kaltzis - jkal0010@student.monash.edu

Harshil Jigneshbhai Patel - hpat0037@student.monash.edu

Joesiah Liu Young - jliu0290@student.monash.edu 

Tan Wei Hom - wtan0125@student.monash.edu

Maddy Hem - mhem0008@student.monash.edu

Henryaldi Matio - hmat0015@student.monash.edu

Mark Shim Wen Ren - mshi0073@student.monash.edu

Dean G Park - dpar0031@student.monash.edu

Sunny Cho - scho0103@student.monash.edu

Rohan Kannan - rkan0017@student.monash.edu

Jonathan Foo - jfoo0023@student.monash.edu

Ryan Tan - rtan0062@student.monash.edu

## Quick Start
### Requirements & Dependencies
- `ts-node`
- `Vite` + `React`
- `MongoDB`
- `Docker CLI` (no GUI) and `Docker Compose`

### Local Deployment
In the root folder:
```
docker compose up
```
This will start all processes needed in their own containers, access at `http://localhost:3000/home/`
### `render.com` Deployment
The project is deployed and hosted from `render.com`, which will handle `nginx` duties performed in the local deployment.

> Test it out at: **[https://two025w1-beastly-brawl-showdown-frontend.onrender.com/](https://two025w1-beastly-brawl-showdown-frontend.onrender.com/)**
> 
> Note: it may take upwards on 5-10 mins to provision the servers

## Features
### EPIC 1: Core Gameplay System

- Character Types & Stats System

- Combat Engine (d20 System)

- Defense Mechanic

- Special Abilities

- Health & Status Tracking

- Action Selection Interface

### EPIC 2: Multiplayer & Networking

- Room Creation System (unique 6-digit room codes)

- Player Joining Mechanism (join via mobile browser)

- Matchmaking System (random 1v1 pairings)

- Real-time Communication (Socket.io / MeteorJS)

- Spectator Mode

### EPIC 3: User Interface & Experience (UI/UX)

- Mobile Interface (player dashboard, action buttons)

- Main Display / Projector View (lobby, battles, results)

- Dice Roll Visualization (animated d20 rolls)

- Character Selection Screen

- Result Announcements (round outcomes, rankings)

### EPIC 4: Tournament System

- Tournament Mode Selection (Battle Royale / Set Matches)

- Match Progression Logic (winners advance, losers observe)

- Scoring System (wins, losses, bonus points)

- Leaderboard Display (ranked results)

- End-of-Tournament Summary (final rankings, winner display)

## Contributing
To setup the development environment refer to https://github.com/Monash-FIT3170/2025W1-Beastly-Brawl-Showdown/wiki/Development-Environment-Setup

Architecture and internal systems can also be found in the wiki, namely:
The overall architecture: https://github.com/Monash-FIT3170/2025W1-Beastly-Brawl-Showdown/wiki/Architecture-Overview
The battle processing system: https://github.com/Monash-FIT3170/2025W1-Beastly-Brawl-Showdown/wiki/Simulator-Overview

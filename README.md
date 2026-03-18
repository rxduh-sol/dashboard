# Core Dashboard

This is a personal dashboard I built to centralize my life. It runs on my homelab (Proxmox/CasaOS) and acts as a single interface for my school assignments, home tasks, and daily routines. 

I got tired of jumping between different apps, so I made this to keep everything in one place with a clean, glassmorphic UI.

---

### Dashboard Preview
[INSERT A SCREENSHOT OF YOUR DASHBOARD HERE]

---

### What I built
I wanted a setup that felt fast and looked good, so I used Next.js and Tailwind. Here is what’s actually running in the app:

**Task Management**
I have two separate streams for 'Home' and 'School' tasks. I added a search bar for quick filtering and a calendar view that lets me select a date to see everything due from that day onwards.

**Daily Routine**
I track my habits through a routine widget. It has a progress bar that changes color based on how much I’ve done for the day (red to green) and shows me exactly what my next task is.

**Environment & Music**
Since I use this while I'm studying, I embedded a YouTube playlist widget for focus music. It also pulls live weather data for Colchester and shows the heartbeat status of my local server node (192.168.0.10) so I know if the backend is online.

---

### Technical Details
Everything is built with Next.js 14 and Framer Motion for the animations. The icons are from Lucide. For the backend, I'm using a Python FastAPI setup running in a Docker container on my server.

---

### For the IT Admin (Regarding Permissions)
If you're looking at this, I’m hoping to integrate my school assignments directly. 

I am specifically looking for **Delegated Permissions** (`EduAssignments.Read`). I’m not trying to build something that sees the whole school's data or anyone else's grades. Delegated permissions just let the app "log in as me" to pull my own assignment titles and due dates into this UI. 

Everything stays local to my network, and I'm not storing any school credentials on the server—it’s all handled through standard Microsoft OAuth.

---

### How to run it
1. Clone the repo
2. Run `npm install`
3. Set up the `.env.local` with the local IP of the FastAPI backend
4. Start it with `npm run dev`

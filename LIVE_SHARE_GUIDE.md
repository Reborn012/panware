# Live Share Setup Guide for Pancreatic Cancer Clinical Copilot

## 🤝 For the HOST (You):

### 1. Start Live Share Session
1. Install "Live Share" extension in VS Code
2. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
3. Type "Live Share: Start Collaboration Session"
4. Share the link with collaborators

### 2. Enable Terminal Sharing
1. In VS Code, go to Settings (Ctrl+,)
2. Search for "liveshare"
3. Enable:
   - `Live Share: Allow Guests Terminal Access` ✅
   - `Live Share: Auto Share Terminals` ✅

### 3. Forward Ports
Once servers are running:
1. Press `Ctrl+Shift+P`
2. Type "Live Share: Manage Shared Terminals and Servers"
3. Forward these ports:
   - **Port 5000** (Backend API)
   - **Port 3001** (Frontend App)

### 4. Start the Application
Run one of these commands in VS Code terminal:

**Windows:**
```cmd
.\start.bat
```

**Mac/Linux:**
```bash
./start.sh
```

## 👥 For COLLABORATORS (Guests):

### 1. Join Session
1. Click the Live Share link
2. VS Code will open with shared workspace

### 2. Access Terminals
- Look for "Shared Terminals" in VS Code
- You can type commands in host's terminals
- Or ask host to share new terminal

### 3. Access the Application
- Backend API: Use the forwarded port link for port 5000
- Frontend App: Use the forwarded port link for port 3001
- Links appear in "Ports" tab or notification

### 4. If You Need to Start Servers Yourself:
```bash
# Backend (in one terminal)
cd backend
npm run dev

# Frontend (in another terminal) 
cd frontend
PORT=3001 npm start
```

## 🚀 Quick Commands for Live Share:

### Start Everything (Host):
```bash
# Windows
start.bat

# Mac/Linux  
./start.sh
```

### Check if Running:
```bash
# Check backend
curl http://localhost:5000

# Check if ports are active
netstat -an | grep :5000
netstat -an | grep :3001
```

## 📋 Live Share Checklist:

**Host Setup:**
- [ ] Live Share extension installed
- [ ] Terminal access enabled for guests
- [ ] Ports 5000 and 3001 forwarded
- [ ] Application started with start script

**Guest Access:**
- [ ] Joined Live Share session
- [ ] Can see shared terminals
- [ ] Can access forwarded ports
- [ ] Can view the running application

## 🔗 Useful Live Share Commands:

- `Ctrl+Shift+P` → "Live Share: End Collaboration Session"
- `Ctrl+Shift+P` → "Live Share: Share Terminal"  
- `Ctrl+Shift+P` → "Live Share: Stop Sharing Terminal"
- `Ctrl+Shift+P` → "Live Share: Focus Participants"

## 💡 Pro Tips:

1. **Host should start servers first** - easier for guests to access
2. **Use port forwarding** - guests get clickable links
3. **Share terminals explicitly** - gives guests more control
4. **Restart servers if issues** - Live Share can sometimes lose connection
5. **Check firewall** - may need to allow VS Code through firewall
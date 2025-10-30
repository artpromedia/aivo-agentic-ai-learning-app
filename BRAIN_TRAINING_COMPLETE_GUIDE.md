# 🧠 Aivo Agentic Main Brain - Full Training & Automated Retraining Guide

**Complete Guide to Training and Maintaining the Aivo Main Brain Model**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Training Scripts](#training-scripts)
3. [Full Training Process](#full-training-process)
4. [Automated Retraining](#automated-retraining)
5. [Scheduling Options](#scheduling-options)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Aivo Agentic Main Brain requires periodic retraining to:
- Stay current with curriculum updates
- Improve question quality based on learner interactions
- Expand coverage to new regions and standards
- Maintain optimal performance across all domains

**Retraining Schedule:** Every 3 months (90 days)

---

## 📁 Training Scripts

### 1. **full_train_brain.py** - Complete Production Training

**Purpose:** Comprehensive training on global K-12 curriculum

**Features:**
- ✅ Loads standards from curriculum database
- ✅ Trains on 7 global regions (US, Europe, Asia, Africa, Middle East, Latin America, Oceania)
- ✅ Generates curriculum-aligned questions using AI providers
- ✅ Validates training quality
- ✅ Saves detailed training reports
- ✅ Multi-provider fallback (OpenAI → Anthropic → Gemini)

**Usage:**
```bash
# Full training (recommended)
python full_train_brain.py

# Incremental training (updates only)
python full_train_brain.py --mode incremental
```

**Expected Duration:** 2-6 hours (depending on curriculum size)

---

### 2. **training_scheduler.py** - Automated Retraining Manager

**Purpose:** Manages 3-month retraining schedule automatically

**Features:**
- ✅ Checks when last training was performed
- ✅ Automatically triggers retraining every 90 days
- ✅ Can run as one-time check or continuous daemon
- ✅ Maintains training history
- ✅ Provides status reports

**Usage:**

```bash
# Check training status (no training)
python training_scheduler.py --status

# One-time check and train if needed
python training_scheduler.py

# Force retraining (bypass 3-month check)
python training_scheduler.py --force

# Run as background daemon (continuous checking)
python training_scheduler.py --daemon

# Custom check interval (default: 24 hours)
python training_scheduler.py --daemon --check-interval 12
```

---

### 3. **quick_train_brain.py** - Fast Testing/Development

**Purpose:** Quick simulated training for testing

**Features:**
- ✅ Fast execution (~5 seconds)
- ✅ Simulates training without AI calls
- ✅ Useful for testing infrastructure

**Usage:**
```bash
python quick_train_brain.py
```

**Note:** Use for testing only, not for production.

---

## 🚀 Full Training Process

### Prerequisites

1. **Curriculum Database**
   ```bash
   # Verify curriculum database exists
   ls ../curriculum-service/curriculum.db
   
   # If missing, initialize it:
   python ../curriculum-service/initialize_curriculum_db.py
   ```

2. **AI Provider API Keys**
   
   Ensure these are set in `.env`:
   ```bash
   OPENAI_API_KEY=sk-proj-...
   ANTHROPIC_API_KEY=sk-ant-...
   GOOGLE_API_KEY=AIza...
   ```

3. **Python Environment**
   ```bash
   # Install dependencies
   pip install -r requirements.txt
   ```

### Step-by-Step Training

#### 1. Check Current Status
```bash
cd services/ai-inference-service/scripts
python training_scheduler.py --status
```

**Expected Output:**
```
================================================================================
🧠 AIVO BRAIN TRAINING SCHEDULE STATUS
================================================================================

✅ BRAIN IS UP TO DATE
   Last training: 2025-10-30 16:16:38 UTC
   Next training: 2026-01-28
   Days until next: 89

   📊 Last Training Stats:
      Standards: 7,000
      Questions: 1,400
      Regions: 5
      Validation: 92.00%
```

#### 2. Run Full Training
```bash
# Start full training
python full_train_brain.py
```

**Training Process:**
```
================================================================================
🧠 AIVO AGENTIC MAIN BRAIN - FULL TRAINING PIPELINE
================================================================================
Mode: full
Started: 2025-10-30 16:30:00 UTC

🔍 Checking training environment...
  ✅ OpenAI API Key
  ✅ Anthropic API Key
  ✅ Gemini API Key
  ✅ Curriculum Database
✅ Environment ready for training

📚 Loading curriculum standards from database...
✅ Loaded 52 standards from curriculum database
   📊 Standards by subject:
      • Math: 19 standards
      • Reading: 18 standards
      • Science: 15 standards

================================================================================
🌍 GLOBAL CURRICULUM TRAINING
================================================================================

================================================================================
🌍 Training Region: United States
================================================================================
Domains: reading, math, science, writing

  📖 Training domain: reading
     Grade 0: 5 standards
     Grade 1: 3 standards
     [... processing ...]
  
  📖 Training domain: math
     [... processing ...]

✅ Completed United States
   Standards: 1,200
   Questions: 240
   Duration: 1800.0s

[... repeats for all 7 regions ...]

🔍 Validating training quality...
  ✅ Reading: 94.00%
  ✅ Math: 93.00%
  ✅ Science: 92.00%
  ✅ Writing: 91.00%

  📊 Average validation score: 92.50%

📄 Training report saved: training_reports/full_training_20251030_163000.json

================================================================================
📊 TRAINING COMPLETE - SUMMARY
================================================================================
Duration: 120.5 minutes
Regions: 7/7
Standards: 15,000
Questions: 3,000
Errors: 12 (0.08%)
Validation: 92.50%

📄 Report: training_reports/full_training_20251030_163000.json

✅ TRAINING SUCCESSFUL - Brain ready for production!
🔄 Next training scheduled: 2026-01-28
```

#### 3. Verify Training
```bash
# Check training status
python training_scheduler.py --status

# Verify report file
cat training_reports/latest_full_training.json
```

---

## 🔄 Automated Retraining

### Option 1: Windows Task Scheduler (Recommended for Windows)

**Setup:**
```powershell
# Run PowerShell as Administrator
cd C:\aivo-agentic-ai-learning-app\services\ai-inference-service\scripts

# Execute setup script
.\setup_windows_scheduler.ps1
```

**What It Does:**
- Creates scheduled task "Aivo Brain Training Scheduler"
- Runs daily at 2:00 AM
- Checks if 90 days have passed since last training
- Automatically triggers retraining when due

**Verify:**
```powershell
Get-ScheduledTask -TaskName "Aivo Brain Training Scheduler"
```

**Remove:**
```powershell
Unregister-ScheduledTask -TaskName "Aivo Brain Training Scheduler" -Confirm:$false
```

---

### Option 2: Linux/macOS Cron (Recommended for Linux/macOS)

**Setup:**
```bash
cd /path/to/aivo-agentic-ai-learning-app/services/ai-inference-service/scripts

# Make script executable
chmod +x setup_cron_scheduler.sh

# Run setup
./setup_cron_scheduler.sh
```

**What It Does:**
- Creates cron job that runs daily at 2:00 AM
- Checks if 90 days have passed since last training
- Automatically triggers retraining when due
- Logs to `training_logs/scheduler.log`

**Verify:**
```bash
crontab -l
```

**Remove:**
```bash
crontab -e  # Delete the Aivo training line
```

---

### Option 3: Docker/Kubernetes (Recommended for Production)

**Docker Compose:**
```yaml
version: '3.8'

services:
  brain-trainer:
    build: ./services/ai-inference-service
    command: python scripts/training_scheduler.py --daemon
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    volumes:
      - ./services/curriculum-service:/app/curriculum-service
      - ./training-data:/app/training-data
    restart: unless-stopped
```

**Kubernetes CronJob:**
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: aivo-brain-retraining
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: trainer
            image: aivo/brain-trainer:latest
            command: ["python", "scripts/training_scheduler.py"]
            env:
            - name: OPENAI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: ai-secrets
                  key: openai-key
          restartPolicy: OnFailure
```

---

### Option 4: Manual Background Service

**Run as Background Daemon:**
```bash
# Linux/macOS
nohup python training_scheduler.py --daemon > scheduler.log 2>&1 &

# Windows (PowerShell)
Start-Process python -ArgumentList "training_scheduler.py --daemon" -WindowStyle Hidden
```

**Stop Daemon:**
```bash
# Find process
ps aux | grep training_scheduler

# Kill process
kill <PID>
```

---

## 📊 Monitoring & Maintenance

### Check Training Status

```bash
# Quick status check
python training_scheduler.py --status

# Detailed last training report
cat training_reports/latest_full_training.json
```

### View Training Logs

```bash
# View latest training log
ls -lt training_logs/
tail -f training_logs/training_<timestamp>.log

# View scheduler log (if running as daemon)
tail -f training_logs/scheduler.log
```

### Training Reports Location

```
services/ai-inference-service/scripts/training_reports/
├── full_training_20251030_163000.json  # Timestamped reports
├── full_training_20251130_020000.json
├── latest_full_training.json           # Symlink to latest
└── training_schedule.json              # Schedule metadata
```

### Report Contents

```json
{
  "training_completed": true,
  "timestamp": "2025-10-30T16:30:00",
  "duration_seconds": 7230,
  "duration_formatted": "120.5 minutes",
  "mode": "full",
  
  "regions": {
    "trained": ["United States", "Europe", "Asia", ...],
    "total": 7,
    "coverage": 1.0
  },
  
  "standards_processed": 15000,
  "questions_generated": 3000,
  "questions_per_standard": 0.2,
  
  "errors": {
    "count": 12,
    "rate": 0.0008,
    "messages": [...]
  },
  
  "validation_scores": {
    "reading": 0.94,
    "math": 0.93,
    "science": 0.92,
    "writing": 0.91
  },
  "average_validation_score": 0.925,
  
  "provider_usage": {
    "openai": 1200,
    "anthropic": 800,
    "gemini": 1000
  },
  
  "quality_passed": true,
  "validation_passed": true,
  "next_training_due": "2026-01-28T16:30:00"
}
```

---

## 🔧 Troubleshooting

### Issue: Training Fails Immediately

**Check:**
1. API keys are set correctly in `.env`
2. Curriculum database exists
3. Python dependencies installed

```bash
# Verify environment
python -c "import os; print('OpenAI:', bool(os.getenv('OPENAI_API_KEY')))"
ls ../curriculum-service/curriculum.db
pip list | grep -E 'openai|anthropic|google-generativeai'
```

---

### Issue: Training Takes Too Long

**Solutions:**
1. Use incremental mode:
   ```bash
   python full_train_brain.py --mode incremental
   ```

2. Reduce scope in config (edit `full_train_brain.py`):
   ```python
   self.config = {
       "grade_levels": list(range(0, 9)),  # Only K-8 instead of K-12
       "regions": {
           "United States": {...}  # Only US region
       }
   }
   ```

3. Increase provider rate limits

---

### Issue: High Error Rate

**Check:**
- API rate limits not exceeded
- Provider service status
- Network connectivity

```bash
# Test providers manually
python -c "
import openai
import anthropic
from google import generativeai

# Test each provider...
"
```

---

### Issue: Scheduler Not Running

**Windows:**
```powershell
# Check task status
Get-ScheduledTask -TaskName "Aivo Brain Training Scheduler"

# View task history
Get-ScheduledTaskInfo -TaskName "Aivo Brain Training Scheduler"

# Run manually
python training_scheduler.py --force
```

**Linux/macOS:**
```bash
# Check cron job
crontab -l

# Check scheduler log
tail -f training_logs/scheduler.log

# Run manually
python training_scheduler.py --force
```

---

### Issue: Out of Memory

**Solutions:**
1. Increase system memory
2. Process fewer standards per batch
3. Use streaming mode for large datasets

---

## 📈 Best Practices

### 1. **Pre-Training Checklist**
- [ ] Curriculum database up to date
- [ ] All API keys valid and funded
- [ ] Sufficient disk space (10GB+)
- [ ] Stable internet connection
- [ ] System resources available

### 2. **Post-Training Verification**
- [ ] Check training report for errors
- [ ] Verify validation scores > 85%
- [ ] Test sample questions in each domain
- [ ] Update production brain models

### 3. **Monitoring Schedule**
- **Daily:** Check scheduler logs
- **Weekly:** Review training status
- **Monthly:** Analyze training metrics
- **Quarterly:** Full audit after retraining

### 4. **Data Retention**
- Keep last 12 training reports (3 years)
- Archive old training logs monthly
- Backup curriculum database weekly

---

## 🎯 Quick Reference Commands

```bash
# === STATUS & MONITORING ===
python training_scheduler.py --status        # Check training status
cat training_reports/latest_full_training.json  # View last report
tail -f training_logs/scheduler.log          # Monitor scheduler

# === TRAINING ===
python full_train_brain.py                   # Full training
python full_train_brain.py --mode incremental  # Incremental
python training_scheduler.py --force         # Force retrain

# === AUTOMATION ===
python training_scheduler.py --daemon        # Run as daemon
.\setup_windows_scheduler.ps1               # Windows setup
./setup_cron_scheduler.sh                   # Linux/macOS setup

# === TESTING ===
python quick_train_brain.py                 # Quick test training
python check_brain_training_status.py       # System check
```

---

## 📞 Support

For issues or questions:
1. Check logs: `training_logs/`
2. Review reports: `training_reports/`
3. Check environment: `python check_brain_training_status.py`
4. Contact: Aivo Development Team

---

**Last Updated:** October 30, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

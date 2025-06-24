# ⚡ Quick Start: Your First Maintenance Flow

> **Get your first automation running in under 10 minutes**

## 🎯 What You'll Build
A **High-Value Asset Protection Flow** that automatically requires manager approval for expensive equipment maintenance.

---

## 📋 Before You Start
- [ ] You have **Manager** or **Admin** access
- [ ] At least one asset worth over $5,000 in your system
- [ ] Manager email configured for approvals

---

## 🚀 Step-by-Step Setup

### 1. Open Flow Builder
```
Navigation: Maintenance → Custom Flows → Flow Builder Tab → "New Flow"
```

### 2. Basic Information
```yaml
Flow Name: "High-Value Asset Approval"
Description: "Require manager approval for maintenance on assets over $5,000"
Trigger: "On Creation"
Priority: 200
Active: ✅ Yes
```

### 3. Add Your First Condition
Click **"Add Condition"**:
```yaml
Field: "Asset Value"
Operator: "Greater Than"
Value: 5000
```

### 4. Add Your First Action
Click **"Add Action"**:
```yaml
Action Type: "Require Approval"
Approver Role: "Manager"
Reason: "High-value asset maintenance"
```

### 5. Add Notification Action
Click **"Add Action"** again:
```yaml
Action Type: "Send Notification"
Recipient: "Manager"
Message: "High-value asset maintenance requires your approval"
```

### 6. Test & Save
1. Click **"Test Flow"** - you should see the preview
2. Click **"Save Flow"**
3. ✅ **Done!** Your flow is now active

---

## 🧪 Test Your Flow

### Create Test Maintenance
1. Go to **Maintenance** → **Schedule New**
2. Select an asset worth more than $5,000
3. Fill in maintenance details
4. Click **"Schedule Maintenance"**

### What Should Happen
1. **Approval Required** - Maintenance goes to pending approval
2. **Manager Notified** - Email sent to manager
3. **Status Updated** - Shows "Waiting for Approval"

---

## ✅ Success Indicators

| ✅ Working | ❌ Not Working |
|------------|----------------|
| Maintenance shows "Pending Approval" | Maintenance goes straight to "Scheduled" |
| Manager receives email notification | No email received |
| Flow appears in "Active Flows" list | Flow shows as "Inactive" |

---

## 🔧 Troubleshooting

### Flow Not Triggering?
- **Check asset value** - Must be exactly over $5,000
- **Verify flow is active** - Toggle should be green
- **Confirm trigger** - Should be "On Creation"

### No Email Notifications?
- **Check manager email** - Verify in user settings
- **Check spam folder** - Emails might be filtered
- **Test with different recipient** - Try "Asset Owner" instead

### Wrong Approval Flow?
- **Check approver role** - Must match user's actual role
- **Verify permissions** - Manager must have approval rights
- **Review conditions** - Asset might not meet criteria

---

## 🎯 Next Steps

### Level Up Your Flows
1. **Add More Conditions** - Maintenance type, priority, department
2. **Chain Actions** - Multiple notifications, assignments
3. **Create Templates** - Emergency response, preventive maintenance
4. **Monitor Performance** - Check success rates and execution counts

### Popular Flow Ideas
- **🚨 Emergency Response** - Auto-assign critical maintenance
- **📅 Preventive Scheduler** - Auto-schedule recurring maintenance  
- **💰 Budget Alerts** - Flag when costs exceed limits
- **👥 Load Balancing** - Distribute work evenly across technicians

---

## 📞 Need Help?

**Stuck? We're here to help:**
- 💬 **Live Chat** - Bottom right corner
- 📧 **Email** - support@yourcompany.com  
- 📚 **Full Guide** - [Complete Documentation](./maintenance-flows-guide.md)

---

*🎉 Congratulations! You've just automated your first maintenance workflow. Welcome to the future of asset management!* 
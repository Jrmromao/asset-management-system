# 🔧 Maintenance Flows Troubleshooting Guide

> **Quick solutions to common flow issues**

---

## 🚨 Flow Not Triggering

### ❓ **Problem:** Flow doesn't activate when expected

#### **Root Causes & Solutions:**

| **Cause** | **How to Check** | **Solution** |
|-----------|------------------|--------------|
| **Flow is inactive** | Check toggle in flow list | Enable the flow (green toggle) |
| **Wrong trigger type** | Review trigger in flow builder | Change to correct trigger (Creation, Status Change, etc.) |
| **Conditions not met** | Test with different asset/maintenance | Adjust condition values or logic |
| **Priority conflicts** | Check if higher priority flows override | Adjust priority levels (higher = runs first) |
| **User permissions** | Verify user can create maintenance | Grant appropriate permissions |

#### **Quick Diagnostic Steps:**
1. ✅ **Flow Status** - Is toggle green/active?
2. ✅ **Test Data** - Does your test case meet ALL conditions?
3. ✅ **Flow Priority** - Are other flows blocking this one?
4. ✅ **User Role** - Do you have permission to trigger flows?

---

## 📧 Notifications Not Sending

### ❓ **Problem:** Email alerts aren't reaching recipients

#### **Root Causes & Solutions:**

| **Cause** | **How to Check** | **Solution** |
|-----------|------------------|--------------|
| **Wrong recipient** | Check action configuration | Select correct recipient (Manager, Asset Owner, etc.) |
| **Missing email** | Verify user profile | Add email address in user settings |
| **Spam/junk folder** | Check recipient's spam folder | Whitelist sender domain |
| **Email service down** | Check system status | Wait or contact support |
| **Action order wrong** | Review action sequence | Move notification after status updates |

#### **Testing Email Notifications:**
```yaml
Test Flow:
  Name: "Email Test Flow"
  Trigger: "On Creation"
  Conditions: None
  Actions:
    1. Send Notification → "Asset Owner"
    2. Send Notification → "Manager"
    3. Send Notification → Your Email
```

---

## 🔒 Approval Workflows Broken

### ❓ **Problem:** Approval process isn't working correctly

#### **Root Causes & Solutions:**

| **Cause** | **How to Check** | **Solution** |
|-----------|------------------|--------------|
| **Wrong approver role** | Check user's actual role | Match approver role in flow with user role |
| **No approval permissions** | Test with different user | Grant approval permissions to role |
| **Approval action missing** | Review flow actions | Add "Require Approval" action |
| **Multiple approval conflicts** | Check for overlapping flows | Consolidate or prioritize approval flows |
| **Status not updating** | Monitor maintenance status | Check for status update actions |

#### **Approval Flow Checklist:**
- [ ] **Approver exists** with correct role
- [ ] **Approval permissions** granted to role  
- [ ] **"Require Approval" action** configured
- [ ] **Notification sent** to approver
- [ ] **Status updates** properly sequenced

---

## 🔄 Actions Executing in Wrong Order

### ❓ **Problem:** Flow actions happen out of sequence

#### **Root Causes & Solutions:**

| **Cause** | **How to Check** | **Solution** |
|-----------|------------------|--------------|
| **Action order wrong** | Review action list in builder | Drag actions to correct order |
| **Multiple flows conflict** | Check flow priorities | Use priority levels to sequence flows |
| **Timing issues** | Test with delays | Add wait/delay actions between steps |
| **Dependency missing** | Review action requirements | Ensure prerequisites are met first |

#### **Best Practice Action Order:**
1. **Status Updates** (set maintenance status)
2. **Assignments** (assign technicians)
3. **Approvals** (require manager approval)
4. **Notifications** (send alerts)
5. **Scheduling** (schedule follow-ups)

---

## 📊 Performance Issues

### ❓ **Problem:** Flows are slow or timing out

#### **Root Causes & Solutions:**

| **Cause** | **How to Check** | **Solution** |
|-----------|------------------|--------------|
| **Too many conditions** | Count condition complexity | Simplify logic, split into multiple flows |
| **Heavy actions** | Review action types | Optimize or batch similar actions |
| **Database load** | Check during peak hours | Schedule heavy flows for off-peak times |
| **External dependencies** | Test individual actions | Remove or replace slow external calls |

#### **Performance Optimization:**
- **Batch Actions** - Group similar notifications
- **Simplify Conditions** - Use fewer, more targeted rules  
- **Split Complex Flows** - Break into smaller, focused flows
- **Monitor Execution** - Watch flow statistics dashboard

---

## 🔍 Debugging Checklist

### **Before Creating Support Ticket:**

#### ✅ **Basic Checks**
- [ ] Flow is **active** (green toggle)
- [ ] **Test data** meets all conditions
- [ ] **User permissions** are correct
- [ ] **Email addresses** are valid

#### ✅ **Advanced Checks**  
- [ ] **Flow priority** doesn't conflict
- [ ] **Action order** is logical
- [ ] **Condition logic** is sound (AND/OR)
- [ ] **External dependencies** are working

#### ✅ **Testing Steps**
- [ ] **Create test flow** with simple conditions
- [ ] **Test with known data** that should trigger
- [ ] **Check flow statistics** for execution history
- [ ] **Monitor real-time** during test execution

---

## 🛠️ Common Error Messages

### **"Flow execution failed"**
- **Cause:** Action couldn't complete
- **Solution:** Check action configuration, verify permissions

### **"Condition evaluation error"**  
- **Cause:** Invalid condition logic or data
- **Solution:** Simplify conditions, check data types

### **"Notification delivery failed"**
- **Cause:** Email service issue or invalid recipient
- **Solution:** Verify email addresses, check service status

### **"Approval timeout"**
- **Cause:** No response within time limit
- **Solution:** Set longer timeout or add escalation

### **"Permission denied"**
- **Cause:** User lacks required permissions
- **Solution:** Grant appropriate role permissions

---

## 📞 When to Contact Support

### **Contact Support If:**
- ✅ You've tried all troubleshooting steps
- ✅ Error persists across multiple tests
- ✅ System-wide issue affecting all flows
- ✅ Data corruption or loss suspected
- ✅ Need help with complex flow logic

### **Before Contacting Support, Gather:**
1. **Flow Name** and configuration
2. **Error messages** (screenshots helpful)
3. **Test data** used to reproduce issue
4. **User role** and permissions
5. **Browser/device** information
6. **Steps to reproduce** the problem

### **Support Channels:**
- 💬 **Live Chat** - Immediate assistance
- 📧 **Email** - Detailed technical issues  
- 📞 **Phone** - Critical production problems
- 🎫 **Support Portal** - Track issue progress

---

## 💡 Pro Tips for Reliable Flows

### **Design Best Practices:**
1. **Start Simple** - Begin with basic flows, add complexity gradually
2. **Test Thoroughly** - Use test data before going live
3. **Document Logic** - Add clear descriptions to flows
4. **Monitor Performance** - Check statistics regularly
5. **Plan for Failures** - Include fallback actions

### **Maintenance Best Practices:**
1. **Regular Reviews** - Monthly flow performance analysis
2. **Update Conditions** - Adjust as business rules change  
3. **Archive Unused** - Remove or disable obsolete flows
4. **Train Users** - Ensure team understands flow purposes
5. **Backup Configurations** - Export flow settings regularly

---

*🎯 **Remember:** Most flow issues are configuration problems, not bugs. Take time to review your settings carefully before escalating to support.*

**Need more help? Check our [Complete Flow Guide](./maintenance-flows-guide.md) or [Quick Start Guide](./maintenance-flows-quickstart.md)** 
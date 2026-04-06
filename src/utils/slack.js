const Integration = require("../models/integration.model");

async function sendSlackNotification(webhookUrl, text) {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return { success: false, error: `Slack returned ${res.status}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Silently fire a Slack notification for a workspace — never throws, never blocks the main request
async function notifySlack(adminId, text) {
  try {
    const integration = await Integration.findOne({ adminRef: adminId, type: "slack", status: "active" });
    if (!integration?.config?.webhookUrl) return;
    await sendSlackNotification(integration.config.webhookUrl, text);
  } catch (_) {
    // intentionally silent
  }
}

function taskAssignedMessage(taskTitle, assigneeName) {
  return `📋 *Task Assigned*: "${taskTitle}" has been assigned to ${assigneeName}`;
}

function taskStatusMessage(taskTitle, newStatus) {
  return `🔄 *Task Updated*: "${taskTitle}" is now *${newStatus}*`;
}

function ticketCreatedMessage(ticketTitle) {
  return `🎫 *New Ticket*: "${ticketTitle}" has been created`;
}

function employeeOnboardedMessage(name, email) {
  return `👋 *New Team Member*: ${name} (${email}) has joined the workspace`;
}

module.exports = {
  sendSlackNotification,
  notifySlack,
  taskAssignedMessage,
  taskStatusMessage,
  ticketCreatedMessage,
  employeeOnboardedMessage,
};

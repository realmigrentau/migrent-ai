/**
 * Migrent email relay: sends Migrent's emails from migrentau@gmail.com.
 *
 * Render's free plan cannot reach Gmail's mail servers, but it can call a
 * web address. This script runs inside the Gmail account, so the emails
 * really come from Gmail and land in normal inboxes. About 100 a day on a
 * free Gmail account.
 *
 * Setup (once):
 *   1. script.google.com > New project > paste this file over Code.gs.
 *   2. Project Settings (gear) > Script Properties > Add:
 *        RELAY_SECRET = the same long random text as GMAIL_RELAY_SECRET on Render.
 *   3. Deploy > New deployment > type Web app.
 *        Execute as: Me.  Who has access: Anyone.
 *      Approve the Google permissions (your own script; "unverified" is normal).
 *   4. Copy the Web app URL into GMAIL_RELAY_URL on Render.
 */
function doPost(e) {
  var out = function (obj) {
    return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
  };
  try {
    var req = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty('RELAY_SECRET');
    if (!secret || req.secret !== secret) return out({ ok: false, error: 'not allowed' });
    var to = String(req.to || '').trim();
    if (!/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(to)) return out({ ok: false, error: 'bad recipient' });
    if (MailApp.getRemainingDailyQuota() < 1) return out({ ok: false, error: 'daily limit reached' });
    var options = { htmlBody: String(req.html || ''), name: String(req.name || 'Migrent') };
    if (req.replyTo) options.replyTo = String(req.replyTo);
    GmailApp.sendEmail(to, String(req.subject || 'Migrent').slice(0, 250), String(req.text || ''), options);
    return out({ ok: true, remaining: MailApp.getRemainingDailyQuota() });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

/** Opening the URL in a browser just says it is running. */
function doGet() {
  return ContentService.createTextOutput('Migrent email relay is running.');
}
